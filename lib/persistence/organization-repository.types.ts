/**
 * BUILD-034 — Organization repository contracts (shared + device-local adapters).
 */

import type { Organization } from "@/lib/organization-os/organization.types";
import type {
  OrganizationInvitation,
  OrganizationMembership,
  OrganizationRole,
} from "@/lib/organization-os/organization-membership-store";
import type { OrganizationAuditRecord } from "@/lib/organization-os/organization-audit-store";

export type CreateOrganizationInput = {
  readonly name: string;
  readonly kind: Organization["kind"];
  readonly ownerUserId: string;
  readonly ownerDisplayName: string;
  readonly missionStatement?: string | null;
  readonly website?: string | null;
  readonly country?: string | null;
};

export type InviteMemberInput = {
  readonly organizationId: string;
  readonly inviterId: string;
  readonly inviterDisplayName: string;
  readonly inviteeEmail: string;
  readonly role: OrganizationRole;
};

export type InviteMemberResult = {
  readonly invitation: OrganizationInvitation;
  readonly rawToken: string;
};

export type AcceptInviteInput = {
  readonly rawToken: string;
  readonly userId: string;
  readonly userDisplayName: string;
  readonly userEmail: string;
};

export type RepositoryError = {
  readonly ok: false;
  readonly code: string;
  readonly message: string;
};

export type RepositoryResult<T> = { readonly ok: true; readonly value: T } | RepositoryError;

export interface OrganizationRepository {
  readonly adapterKind: "supabase_shared" | "device_local";
  readonly isShared: boolean;
  listOrganizations(userId: string): Promise<readonly Organization[]>;
  getOrganization(organizationId: string): Promise<Organization | null>;
  createOrganizationWithOwner(input: CreateOrganizationInput): Promise<
    RepositoryResult<{ organization: Organization; membership: OrganizationMembership }>
  >;
  listMemberships(organizationId: string): Promise<readonly OrganizationMembership[]>;
  listInvitations(organizationId: string): Promise<readonly OrganizationInvitation[]>;
  inviteMember(input: InviteMemberInput): Promise<RepositoryResult<InviteMemberResult>>;
  acceptInvitation(input: AcceptInviteInput): Promise<RepositoryResult<OrganizationMembership>>;
  revokeInvitation(
    invitationId: string,
    actorId: string,
    actorDisplayName: string,
  ): Promise<RepositoryResult<boolean>>;
  listAudit(organizationId: string): Promise<readonly OrganizationAuditRecord[]>;
}
