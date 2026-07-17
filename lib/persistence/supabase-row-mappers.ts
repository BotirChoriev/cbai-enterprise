/**
 * BUILD-039 — Map Supabase rows to domain types.
 */

import type { Organization, OrganizationKind } from "@/lib/organization-os/organization.types";
import type {
  OrganizationInvitation,
  OrganizationMembership,
  OrganizationRole,
} from "@/lib/organization-os/organization-membership-store";
import type { OrganizationAuditRecord } from "@/lib/organization-os/organization-audit-store";

export type OrganizationRow = {
  id: string;
  name: string;
  normalized_name: string;
  organization_type: string;
  identity_kind: string;
  official_website: string | null;
  country_code: string | null;
  verification_state: string;
  version: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
};

export type MembershipRow = {
  id: string;
  organization_id: string;
  user_id: string;
  role: string;
  status: string;
  version: number;
  invited_by: string | null;
  joined_at: string | null;
  revoked_at: string | null;
  created_at: string;
  updated_at: string;
};

export type InvitationRow = {
  id: string;
  organization_id: string;
  recipient_email_normalized: string;
  intended_role: string;
  token_hash: string;
  status: string;
  expires_at: string;
  created_by: string;
  accepted_by: string | null;
  accepted_at: string | null;
  revoked_at: string | null;
  version: number;
  created_at: string;
  updated_at: string;
};

export type AuditRow = {
  id: string;
  organization_id: string;
  actor_id: string | null;
  action: string;
  target_type: string;
  target_id: string | null;
  safe_metadata: Record<string, unknown>;
  created_at: string;
};

export function mapOrganizationRow(row: OrganizationRow): Organization {
  return {
    id: row.id,
    name: row.name,
    kind: row.organization_type as OrganizationKind,
    identityKind: row.identity_kind as Organization["identityKind"],
    missionStatement: null,
    website: row.official_website,
    country: row.country_code,
    createdBy: row.created_by,
    version: row.version,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    maturity: "cloud_connected",
  };
}

export function mapMembershipRow(row: MembershipRow, displayName = "Member"): OrganizationMembership {
  return {
    id: row.id,
    organizationId: row.organization_id,
    userId: row.user_id,
    userDisplayName: displayName,
    role: row.role as OrganizationRole,
    version: row.version,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapInvitationRow(row: InvitationRow): OrganizationInvitation {
  return {
    id: row.id,
    organizationId: row.organization_id,
    inviterId: row.created_by,
    inviteeEmail: row.recipient_email_normalized,
    role: row.intended_role as OrganizationRole,
    tokenHash: row.token_hash,
    status: row.status as OrganizationInvitation["status"],
    expiresAt: row.expires_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    acceptedByUserId: row.accepted_by,
    acceptedAt: row.accepted_at,
  };
}

export function mapAuditRow(row: AuditRow): OrganizationAuditRecord {
  const meta = row.safe_metadata ?? {};
  return {
    id: row.id,
    organizationId: row.organization_id,
    event: row.action as OrganizationAuditRecord["event"],
    actorId: row.actor_id ?? "unknown",
    actorDisplayName: typeof meta.actorDisplayName === "string" ? meta.actorDisplayName : "Member",
    targetId: row.target_id,
    timestamp: row.created_at,
    metadata: Object.fromEntries(
      Object.entries(meta).filter(([, v]) => typeof v === "string"),
    ) as Readonly<Record<string, string>>,
  };
}

export function mapSupabaseError(error: { message?: string; code?: string; details?: string }): {
  code: string;
  message: string;
} {
  const msg = (error.message ?? "").toLowerCase();
  if (msg.includes("not_authenticated") || error.code === "PGRST301") {
    return { code: "not_authenticated", message: "Sign in to perform this action." };
  }
  if (msg.includes("not_authorized") || msg.includes("permission") || error.code === "42501") {
    return { code: "not_authorized", message: "You do not have permission for this action." };
  }
  if (msg.includes("not_found") || error.code === "PGRST116") {
    return { code: "not_found", message: "Record not found." };
  }
  if (msg.includes("expired")) {
    return { code: "expired", message: "This invitation has expired." };
  }
  if (msg.includes("conflict") || msg.includes("version")) {
    return { code: "conflict", message: "Record changed — reload and try again." };
  }
  return { code: "unknown", message: "Something went wrong. Please try again." };
}
