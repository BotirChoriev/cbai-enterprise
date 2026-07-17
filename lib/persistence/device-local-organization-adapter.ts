/**
 * BUILD-034 — Device-local organization repository adapter.
 * development_only · single_device · not_collaboration_safe
 */

import {
  acceptOrganizationInvitationByToken,
  createOrganizationWithOwner,
  inviteOrganizationMember,
  loadOrganizationInvitations,
  loadOrganizationMemberships,
  revokeOrganizationInvitation,
} from "@/lib/organization-os/organization-membership-store";
import { loadOrganization, loadOrganizations } from "@/lib/organization-os/organization-store";
import { loadOrganizationAudit } from "@/lib/organization-os/organization-audit-store";
import type {
  AcceptInviteInput,
  CreateOrganizationInput,
  InviteMemberInput,
  OrganizationRepository,
  RepositoryResult,
} from "@/lib/persistence/organization-repository.types";

function ok<T>(value: T): RepositoryResult<T> {
  return { ok: true, value };
}

function err(code: string, message: string): RepositoryResult<never> {
  return { ok: false, code, message };
}

export class DeviceLocalOrganizationRepository implements OrganizationRepository {
  readonly adapterKind = "device_local" as const;
  readonly isShared = false;

  async listOrganizations(userId: string) {
    const memberships = loadOrganizationMemberships();
    const orgIds = new Set(memberships.filter((m) => m.userId === userId).map((m) => m.organizationId));
    return loadOrganizations().filter((o) => orgIds.has(o.id));
  }

  async getOrganization(organizationId: string) {
    return loadOrganization(organizationId);
  }

  async createOrganizationWithOwner(input: CreateOrganizationInput) {
    const result = createOrganizationWithOwner(input);
    return ok(result);
  }

  async listMemberships(organizationId: string) {
    return loadOrganizationMemberships(organizationId);
  }

  async listInvitations(organizationId: string) {
    return loadOrganizationInvitations(organizationId);
  }

  async inviteMember(input: InviteMemberInput) {
    const result = inviteOrganizationMember(input);
    if ("error" in result) return err("not_authorized", result.error);
    const rawToken = result.rawToken;
    if (!rawToken) return err("validation_failed", "Invitation token missing.");
    return ok({ invitation: result, rawToken });
  }

  async acceptInvitation(input: AcceptInviteInput) {
    const result = acceptOrganizationInvitationByToken(
      input.rawToken,
      input.userId,
      input.userDisplayName,
      input.userEmail,
    );
    if ("error" in result) return err("validation_failed", result.error);
    return ok(result);
  }

  async revokeInvitation(invitationId: string, actorId: string, actorDisplayName: string) {
    const success = revokeOrganizationInvitation(invitationId, actorId, actorDisplayName);
    return success ? ok(true) : err("not_authorized", "Could not revoke invitation.");
  }

  async listAudit(organizationId: string) {
    return loadOrganizationAudit(organizationId);
  }
}

