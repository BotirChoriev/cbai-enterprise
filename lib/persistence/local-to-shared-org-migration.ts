/**
 * BUILD-039 — Explicit device-local → shared organization migration workflow.
 * Never silently uploads local records.
 */

import { loadOrganizations } from "@/lib/organization-os/organization-store";
import {
  loadOrganizationInvitations,
  loadOrganizationMemberships,
} from "@/lib/organization-os/organization-membership-store";
import { loadOrganizationAudit } from "@/lib/organization-os/organization-audit-store";
import { resolveOrganizationRepository } from "@/lib/persistence/repository-factory";
import { isOrganizationCollaborationShared } from "@/lib/persistence/persistence-capability";

export type OrgMigrationStatus =
  | "not_started"
  | "preview_ready"
  | "in_progress"
  | "partially_completed"
  | "completed"
  | "failed"
  | "cancelled";

export type OrgMigrationPreview = {
  readonly organizations: number;
  readonly memberships: number;
  readonly invitations: number;
  readonly auditEvents: number;
  readonly skippedReasons: readonly string[];
};

export type OrgMigrationReport = OrgMigrationPreview & {
  readonly status: OrgMigrationStatus;
  readonly migratedOrganizations: number;
  readonly failures: readonly string[];
};

function markerKey(userId: string): string {
  return `cbai-org-shared-migration:${userId}`;
}

export function getOrgMigrationStatus(userId: string): OrgMigrationStatus {
  if (typeof window === "undefined") return "not_started";
  const raw = window.localStorage.getItem(markerKey(userId));
  if (!raw) return "not_started";
  try {
    const parsed = JSON.parse(raw) as { status?: OrgMigrationStatus };
    return parsed.status ?? "completed";
  } catch {
    return "not_started";
  }
}

export function previewLocalOrganizationMigration(): OrgMigrationPreview {
  const orgs = loadOrganizations().filter((o) => o.maturity !== "cloud_connected");
  const memberships = orgs.flatMap((o) => loadOrganizationMemberships(o.id));
  const invitations = orgs.flatMap((o) => loadOrganizationInvitations(o.id));
  const auditEvents = orgs.flatMap((o) => loadOrganizationAudit(o.id));
  const skippedReasons: string[] = [];
  if (!isOrganizationCollaborationShared()) {
    skippedReasons.push("shared_backend_not_configured");
  }
  for (const org of orgs) {
    if (!org.createdBy) skippedReasons.push(`org:${org.id}:missing_owner`);
  }
  return {
    organizations: orgs.length,
    memberships: memberships.length,
    invitations: invitations.length,
    auditEvents: auditEvents.length,
    skippedReasons,
  };
}

/**
 * User-confirmed migration — creates organizations in Supabase via RPC.
 * Local records are never deleted; migration marker set only on full success.
 */
export async function migrateLocalOrganizationsToShared(
  userId: string,
  ownerDisplayName: string,
): Promise<OrgMigrationReport> {
  const preview = previewLocalOrganizationMigration();
  const failures: string[] = [];
  let migrated = 0;

  if (!isOrganizationCollaborationShared()) {
    return { ...preview, status: "failed", migratedOrganizations: 0, failures: ["shared_backend_not_configured"] };
  }

  const repo = resolveOrganizationRepository();
  if (!repo.isShared) {
    return { ...preview, status: "failed", migratedOrganizations: 0, failures: ["adapter_not_shared"] };
  }

  const localOrgs = loadOrganizations().filter((o) => o.maturity !== "cloud_connected");

  for (const org of localOrgs) {
    if (org.createdBy && org.createdBy !== userId) {
      failures.push(`Skipped "${org.name}" — owned by another local user id.`);
      continue;
    }
    const result = await repo.createOrganizationWithOwner({
      name: org.name,
      kind: org.kind,
      ownerUserId: userId,
      ownerDisplayName,
      website: org.website ?? null,
      country: org.country ?? null,
    });
    if (!result.ok) {
      failures.push(`"${org.name}": ${result.message}`);
      continue;
    }
    migrated += 1;
  }

  const status: OrgMigrationStatus =
    failures.length === 0 ? "completed" : migrated > 0 ? "partially_completed" : "failed";

  if (status === "completed" && typeof window !== "undefined") {
    window.localStorage.setItem(
      markerKey(userId),
      JSON.stringify({ status: "completed", migratedAt: new Date().toISOString(), migrated }),
    );
  }

  return { ...preview, status, migratedOrganizations: migrated, failures };
}
