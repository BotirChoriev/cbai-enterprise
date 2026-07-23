/**
 * BUILD-039 — Organization persistence facade (adapter-agnostic).
 */

import { resolveOrganizationRepository } from "@/lib/persistence/repository-factory";
import { resolveActorId } from "@/lib/persistence/resolve-actor-id";
import {
  setSharedOrgMirror,
} from "@/lib/persistence/shared-org-session-cache";
import { isOrganizationCollaborationShared } from "@/lib/persistence/persistence-capability";
import { saveOrganization } from "@/lib/organization-os/organization-store";
import type { CreateOrganizationInput, InviteMemberInput } from "@/lib/persistence/organization-repository.types";
import { MISSION_DATA_CHANGED } from "@/lib/intelligence-os/mission-activation-events";

function notifyChange(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(MISSION_DATA_CHANGED));
  }
}

async function refreshMirror(userId: string): Promise<void> {
  const repo = resolveOrganizationRepository();
  const organizations = await repo.listOrganizations(userId);
  const memberships = (
    await Promise.all(organizations.map((o) => repo.listMemberships(o.id)))
  ).flat();
  const invitations = (
    await Promise.all(organizations.map((o) => repo.listInvitations(o.id)))
  ).flat();
  const auditEntries = await Promise.all(
    organizations.map(async (o) => [o.id, await repo.listAudit(o.id)] as const),
  );
  setSharedOrgMirror({
    userId,
    organizations,
    memberships,
    invitations,
    auditByOrg: new Map(auditEntries),
  });
  for (const org of organizations) {
    saveOrganization(org);
  }
}

export async function hydrateOrganizationPersistence(userId: string): Promise<void> {
  if (!isOrganizationCollaborationShared()) return;
  await refreshMirror(userId);
}

export async function createOrganizationPersisted(input: Omit<CreateOrganizationInput, "ownerUserId"> & {
  readonly ownerDisplayName: string;
}) {
  const actorId = resolveActorId();
  if (!actorId) return { error: "Sign in to create an organization.", code: "not_authenticated" as const };

  const repo = resolveOrganizationRepository();
  const result = await repo.createOrganizationWithOwner({
    ...input,
    ownerUserId: actorId,
  });

  if (!result.ok) return { error: result.message, code: result.code };

  if (repo.isShared) {
    saveOrganization(result.value.organization);
    await refreshMirror(actorId);
  }
  notifyChange();
  return result.value;
}

export async function inviteOrganizationMemberPersisted(input: Omit<InviteMemberInput, "inviterId">) {
  const actorId = resolveActorId();
  if (!actorId) return { error: "Sign in to invite members.", code: "not_authenticated" as const };

  const repo = resolveOrganizationRepository();
  const result = await repo.inviteMember({ ...input, inviterId: actorId });
  if (!result.ok) return { error: result.message, code: result.code };

  const { buildInvitationAcceptUrl, sendOrganizationInvitationEmail, isPreviewOrDevHost } = await import(
    "@/lib/enterprise-collaboration/email-transport"
  );
  const acceptUrl = buildInvitationAcceptUrl(result.value.rawToken);
  const org = await repo.getOrganization(input.organizationId);
  const emailResult = await sendOrganizationInvitationEmail({
    toEmail: input.inviteeEmail,
    organizationName: org?.name ?? "Organization",
    inviterDisplayName: input.inviterDisplayName,
    role: input.role,
    acceptUrl,
    expiresAt: result.value.invitation.expiresAt,
  });

  if (repo.isShared) await refreshMirror(actorId);
  notifyChange();
  return {
    ...result.value,
    emailStatus: emailResult.status,
    emailMessage: emailResult.status === "delivered" ? "Invitation email delivered." : emailResult.message,
    copyLinkAllowed: isPreviewOrDevHost() || emailResult.status !== "delivered",
    acceptUrl,
  };
}

export async function acceptOrganizationInvitationPersisted(input: {
  readonly rawToken: string;
  readonly userDisplayName: string;
  readonly userEmail: string;
}) {
  const actorId = resolveActorId();
  if (!actorId) return { error: "Sign in to accept invitations.", code: "not_authenticated" as const };

  const repo = resolveOrganizationRepository();
  const result = await repo.acceptInvitation({
    rawToken: input.rawToken,
    userId: actorId,
    userDisplayName: input.userDisplayName,
    userEmail: input.userEmail,
  });
  if (!result.ok) return { error: result.message, code: result.code };

  if (repo.isShared) await refreshMirror(actorId);
  notifyChange();
  return result.value;
}

export async function listAccessibleOrganizationsPersisted() {
  const actorId = resolveActorId();
  if (!actorId) return [];
  const repo = resolveOrganizationRepository();
  if (repo.isShared) {
    await refreshMirror(actorId);
    return repo.listOrganizations(actorId);
  }
  return repo.listOrganizations(actorId);
}

export function patchMirrorAfterLocalMutation(): void {
  if (!isOrganizationCollaborationShared()) return;
  const actorId = resolveActorId();
  if (!actorId) return;
  void refreshMirror(actorId);
}
