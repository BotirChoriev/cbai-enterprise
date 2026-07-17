/**
 * BUILD-039 — In-memory mirror for shared org state (session-scoped, not localStorage).
 * Enables synchronous authorization reads while persistence uses Supabase.
 */

import type { Organization } from "@/lib/organization-os/organization.types";
import type {
  OrganizationInvitation,
  OrganizationMembership,
} from "@/lib/organization-os/organization-membership-store";
import type { OrganizationAuditRecord } from "@/lib/organization-os/organization-audit-store";

type SharedOrgMirror = {
  readonly userId: string;
  organizations: Organization[];
  memberships: OrganizationMembership[];
  invitations: OrganizationInvitation[];
  auditByOrg: Map<string, OrganizationAuditRecord[]>;
};

let mirror: SharedOrgMirror | null = null;

export function isSharedOrgMirrorActive(): boolean {
  return mirror !== null;
}

export function clearSharedOrgMirror(): void {
  mirror = null;
}

export function setSharedOrgMirror(input: {
  readonly userId: string;
  readonly organizations: readonly Organization[];
  readonly memberships: readonly OrganizationMembership[];
  readonly invitations?: readonly OrganizationInvitation[];
  readonly auditByOrg?: ReadonlyMap<string, readonly OrganizationAuditRecord[]>;
}): void {
  mirror = {
    userId: input.userId,
    organizations: [...input.organizations],
    memberships: [...input.memberships],
    invitations: [...(input.invitations ?? [])],
    auditByOrg: new Map(
      [...(input.auditByOrg ?? [])].map(([k, v]) => [k, [...v]] as const),
    ) as Map<string, OrganizationAuditRecord[]>,
  };
}

export function patchSharedOrgMirror(patch: Partial<Omit<SharedOrgMirror, "auditByOrg">> & {
  readonly auditByOrg?: Map<string, OrganizationAuditRecord[]>;
}): void {
  if (!mirror) return;
  mirror = {
    userId: patch.userId ?? mirror.userId,
    organizations: patch.organizations ?? mirror.organizations,
    memberships: patch.memberships ?? mirror.memberships,
    invitations: patch.invitations ?? mirror.invitations,
    auditByOrg: patch.auditByOrg ?? mirror.auditByOrg,
  };
}

export function getSharedOrganizationsMirror(): readonly Organization[] | null {
  return mirror?.organizations ?? null;
}

export function getSharedMembershipMirror(): readonly OrganizationMembership[] | null {
  return mirror?.memberships ?? null;
}

export function getSharedInvitationsMirror(): readonly OrganizationInvitation[] | null {
  return mirror?.invitations ?? null;
}

export function getSharedAuditMirror(organizationId: string): readonly OrganizationAuditRecord[] | null {
  if (!mirror) return null;
  return mirror.auditByOrg.get(organizationId) ?? [];
}
