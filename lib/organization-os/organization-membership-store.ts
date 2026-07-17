/**
 * BUILD-029 — Organization membership, invitations, and role mutations.
 * Device-local only — not multi-device or cross-account without shared backend.
 */

import type { Organization } from "@/lib/organization-os/organization.types";
import { saveOrganization, createOrganizationDraft } from "@/lib/organization-os/organization-store";
import { authorizeOrganizationAction } from "@/lib/organization-os/authorization-policy";
import { recordOrganizationAudit } from "@/lib/organization-os/organization-audit-store";
import { resolveStorageKey } from "@/lib/storage/namespaced-key";

export type OrganizationRole =
  | "owner"
  | "administrator"
  | "mission_lead"
  | "researcher"
  | "reviewer"
  | "member"
  | "guest";

export type InvitationStatus =
  | "draft"
  | "pending"
  | "accepted"
  | "declined"
  | "expired"
  | "revoked"
  | "failed";

export type OrganizationMembership = {
  readonly id: string;
  readonly organizationId: string;
  readonly userId: string;
  readonly userDisplayName: string;
  readonly role: OrganizationRole;
  readonly version: number;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type OrganizationInvitation = {
  readonly id: string;
  readonly organizationId: string;
  readonly inviterId: string;
  readonly inviteeEmail: string;
  readonly role: OrganizationRole;
  readonly token: string;
  readonly status: InvitationStatus;
  readonly expiresAt: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly acceptedByUserId?: string | null;
  readonly acceptedAt?: string | null;
};

const MEMBERS_KEY = "cbai-organization-memberships";
const INVITES_KEY = "cbai-organization-invitations";
const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const memoryMembers: OrganizationMembership[] = [];
const memoryInvites: OrganizationInvitation[] = [];

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function readList<T>(key: string, isValid: (v: unknown) => v is T): T[] {
  if (!isBrowser()) {
    if (key === MEMBERS_KEY) return memoryMembers.filter(isValid) as T[];
    return memoryInvites.filter(isValid) as T[];
  }
  try {
    const raw = window.localStorage.getItem(resolveStorageKey(key));
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValid);
  } catch {
    return [];
  }
}

function writeList<T>(key: string, items: readonly T[]): void {
  if (!isBrowser()) {
    if (key === MEMBERS_KEY) {
      memoryMembers.length = 0;
      memoryMembers.push(...(items as unknown as OrganizationMembership[]));
    } else {
      memoryInvites.length = 0;
      memoryInvites.push(...(items as unknown as OrganizationInvitation[]));
    }
    return;
  }
  window.localStorage.setItem(resolveStorageKey(key), JSON.stringify(items));
}

function isMembership(v: unknown): v is OrganizationMembership {
  const m = v as OrganizationMembership;
  return (
    typeof m === "object" &&
    m !== null &&
    typeof m.id === "string" &&
    typeof m.organizationId === "string" &&
    typeof m.userId === "string" &&
    typeof m.role === "string"
  );
}

function isInvitation(v: unknown): v is OrganizationInvitation {
  const i = v as OrganizationInvitation;
  return (
    typeof i === "object" &&
    i !== null &&
    typeof i.id === "string" &&
    typeof i.organizationId === "string" &&
    typeof i.inviteeEmail === "string"
  );
}

function newToken(): string {
  return `invtok-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}

function normalizeMembership(m: OrganizationMembership): OrganizationMembership {
  return { ...m, version: m.version ?? 1 };
}

export function loadOrganizationMemberships(organizationId?: string): OrganizationMembership[] {
  const all = readList(MEMBERS_KEY, isMembership).map(normalizeMembership);
  return organizationId ? all.filter((m) => m.organizationId === organizationId) : all;
}

export function loadMembershipForUser(userId: string, organizationId: string): OrganizationMembership | null {
  return (
    loadOrganizationMemberships(organizationId).find(
      (m) => m.userId === userId && m.organizationId === organizationId,
    ) ?? null
  );
}

export function createOrganizationWithOwner(input: {
  readonly name: string;
  readonly kind: Organization["kind"];
  readonly ownerUserId: string;
  readonly ownerDisplayName: string;
  readonly missionStatement?: string | null;
  readonly website?: string | null;
  readonly country?: string | null;
}): { organization: Organization; membership: OrganizationMembership } {
  const organization = createOrganizationDraft(input.name, input.kind, input.missionStatement ?? null, {
    identityKind: "workspace_organization",
    website: input.website ?? null,
    country: input.country ?? null,
    createdBy: input.ownerUserId,
  });
  saveOrganization(organization);

  const now = new Date().toISOString();
  const membership: OrganizationMembership = {
    id: `mem-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    organizationId: organization.id,
    userId: input.ownerUserId,
    userDisplayName: input.ownerDisplayName.trim(),
    role: "owner",
    version: 1,
    createdAt: now,
    updatedAt: now,
  };

  writeList(MEMBERS_KEY, [...readList(MEMBERS_KEY, isMembership), membership]);
  recordOrganizationAudit({
    organizationId: organization.id,
    event: "organization_created",
    actorId: input.ownerUserId,
    actorDisplayName: input.ownerDisplayName,
  });
  return { organization, membership };
}

/** @deprecated use createOrganizationWithOwner object form */
export function createOrganizationWithOwnerLegacy(
  name: string,
  kind: Organization["kind"],
  ownerUserId: string,
  ownerDisplayName: string,
  missionStatement: string | null = null,
): { organization: Organization; membership: OrganizationMembership } {
  return createOrganizationWithOwner({
    name,
    kind,
    ownerUserId,
    ownerDisplayName,
    missionStatement,
  });
}

export function inviteOrganizationMember(input: {
  readonly organizationId: string;
  readonly inviterId: string;
  readonly inviterDisplayName: string;
  readonly inviteeEmail: string;
  readonly role: OrganizationRole;
}): OrganizationInvitation | { readonly error: string } {
  const auth = authorizeOrganizationAction({
    actorId: input.inviterId,
    organizationId: input.organizationId,
    action: "membership.invite",
  });
  if (!auth.ok) return { error: auth.message };

  const now = new Date().toISOString();
  const invitation: OrganizationInvitation = {
    id: `inv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    organizationId: input.organizationId,
    inviterId: input.inviterId,
    inviteeEmail: input.inviteeEmail.trim().toLowerCase(),
    role: input.role,
    token: newToken(),
    status: "pending",
    expiresAt: new Date(Date.now() + INVITE_TTL_MS).toISOString(),
    createdAt: now,
    updatedAt: now,
  };
  writeList(INVITES_KEY, [...readList(INVITES_KEY, isInvitation), invitation]);
  recordOrganizationAudit({
    organizationId: input.organizationId,
    event: "invitation_created",
    actorId: input.inviterId,
    actorDisplayName: input.inviterDisplayName,
    targetId: invitation.id,
    metadata: { role: input.role },
  });
  return invitation;
}

export function loadInvitationByToken(token: string): OrganizationInvitation | null {
  const invite = readList(INVITES_KEY, isInvitation).find((i) => i.token === token) ?? null;
  if (!invite) return null;
  if (invite.status === "pending" && new Date(invite.expiresAt).getTime() < Date.now()) {
    return { ...invite, status: "expired" };
  }
  return invite;
}

export function acceptOrganizationInvitationByToken(
  token: string,
  userId: string,
  userDisplayName: string,
  userEmail: string,
): OrganizationMembership | { readonly error: string } {
  const invitation = loadInvitationByToken(token);
  if (!invitation) return { error: "Invitation not found." };
  if (invitation.status === "expired") return { error: "Invitation expired." };
  if (invitation.status !== "pending") return { error: "Invitation is no longer pending." };
  if (invitation.inviteeEmail !== userEmail.trim().toLowerCase()) {
    return { error: "This invitation was sent to a different email address." };
  }

  const now = new Date().toISOString();
  const invites = readList(INVITES_KEY, isInvitation);
  writeList(
    INVITES_KEY,
    invites.map((i) =>
      i.token === token
        ? { ...i, status: "accepted" as const, updatedAt: now, acceptedByUserId: userId, acceptedAt: now }
        : i,
    ),
  );

  const membership: OrganizationMembership = {
    id: `mem-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    organizationId: invitation.organizationId,
    userId,
    userDisplayName: userDisplayName.trim(),
    role: invitation.role,
    version: 1,
    createdAt: now,
    updatedAt: now,
  };
  writeList(MEMBERS_KEY, [...readList(MEMBERS_KEY, isMembership), membership]);
  recordOrganizationAudit({
    organizationId: invitation.organizationId,
    event: "invitation_accepted",
    actorId: userId,
    actorDisplayName: userDisplayName,
    targetId: invitation.id,
  });
  return membership;
}

export function acceptOrganizationInvitation(
  invitationId: string,
  userId: string,
  userDisplayName: string,
): OrganizationMembership | null {
  const invites = readList(INVITES_KEY, isInvitation);
  const invitation = invites.find((i) => i.id === invitationId);
  if (!invitation || invitation.status !== "pending") return null;
  return acceptOrganizationInvitationByToken(
    invitation.token,
    userId,
    userDisplayName,
    invitation.inviteeEmail,
  ) as OrganizationMembership;
}

export function declineOrganizationInvitation(
  token: string,
  userId: string,
  userDisplayName: string,
): boolean {
  const invites = readList(INVITES_KEY, isInvitation);
  const invitation = invites.find((i) => i.token === token);
  if (!invitation || invitation.status !== "pending") return false;
  const now = new Date().toISOString();
  writeList(
    INVITES_KEY,
    invites.map((i) => (i.token === token ? { ...i, status: "declined" as const, updatedAt: now } : i)),
  );
  recordOrganizationAudit({
    organizationId: invitation.organizationId,
    event: "invitation_declined",
    actorId: userId,
    actorDisplayName: userDisplayName,
    targetId: invitation.id,
  });
  return true;
}

export function revokeOrganizationInvitation(
  invitationId: string,
  actorId: string,
  actorDisplayName: string,
): boolean {
  const invites = readList(INVITES_KEY, isInvitation);
  const invitation = invites.find((i) => i.id === invitationId);
  if (!invitation || invitation.status !== "pending") return false;
  const auth = authorizeOrganizationAction({
    actorId,
    organizationId: invitation.organizationId,
    action: "membership.invite",
  });
  if (!auth.ok) return false;
  const now = new Date().toISOString();
  writeList(
    INVITES_KEY,
    invites.map((i) =>
      i.id === invitationId ? { ...i, status: "revoked" as const, updatedAt: now } : i,
    ),
  );
  recordOrganizationAudit({
    organizationId: invitation.organizationId,
    event: "invitation_revoked",
    actorId,
    actorDisplayName,
    targetId: invitationId,
  });
  return true;
}

export function changeOrganizationMemberRole(input: {
  readonly organizationId: string;
  readonly actorId: string;
  readonly actorDisplayName: string;
  readonly memberUserId: string;
  readonly newRole: OrganizationRole;
  readonly expectedVersion: number;
}): OrganizationMembership | { readonly error: string } {
  const auth = authorizeOrganizationAction({
    actorId: input.actorId,
    organizationId: input.organizationId,
    action: "membership.change_role",
  });
  if (!auth.ok) return { error: auth.message };

  const members = readList(MEMBERS_KEY, isMembership);
  const member = members.find(
    (m) => m.organizationId === input.organizationId && m.userId === input.memberUserId,
  );
  if (!member) return { error: "Member not found." };
  if (member.version !== input.expectedVersion) {
    return { error: "Member record changed — reload and retry." };
  }
  if (member.role === "owner" && input.newRole !== "owner") {
    const owners = members.filter(
      (m) => m.organizationId === input.organizationId && m.role === "owner",
    );
    if (owners.length <= 1) return { error: "Cannot remove the last owner without transfer." };
  }

  const now = new Date().toISOString();
  const updated: OrganizationMembership = {
    ...member,
    role: input.newRole,
    version: member.version + 1,
    updatedAt: now,
  };
  writeList(
    MEMBERS_KEY,
    members.map((m) => (m.id === member.id ? updated : m)),
  );
  recordOrganizationAudit({
    organizationId: input.organizationId,
    event: "member_role_changed",
    actorId: input.actorId,
    actorDisplayName: input.actorDisplayName,
    targetId: input.memberUserId,
    metadata: { role: input.newRole },
  });
  return updated;
}

export function removeOrganizationMember(input: {
  readonly organizationId: string;
  readonly actorId: string;
  readonly actorDisplayName: string;
  readonly memberUserId: string;
}): boolean {
  const auth = authorizeOrganizationAction({
    actorId: input.actorId,
    organizationId: input.organizationId,
    action: "membership.remove",
  });
  if (!auth.ok) return false;

  const members = readList(MEMBERS_KEY, isMembership);
  const member = members.find(
    (m) => m.organizationId === input.organizationId && m.userId === input.memberUserId,
  );
  if (!member) return false;
  if (member.role === "owner") {
    const owners = members.filter(
      (m) => m.organizationId === input.organizationId && m.role === "owner",
    );
    if (owners.length <= 1) return false;
  }

  writeList(
    MEMBERS_KEY,
    members.filter((m) => m.id !== member.id),
  );
  recordOrganizationAudit({
    organizationId: input.organizationId,
    event: "member_removed",
    actorId: input.actorId,
    actorDisplayName: input.actorDisplayName,
    targetId: input.memberUserId,
  });
  return true;
}

export function loadPendingInvitations(email: string): OrganizationInvitation[] {
  const normalized = email.trim().toLowerCase();
  return readList(INVITES_KEY, isInvitation).filter(
    (i) => i.inviteeEmail === normalized && i.status === "pending",
  );
}

export function loadOrganizationInvitations(organizationId: string): OrganizationInvitation[] {
  return readList(INVITES_KEY, isInvitation).filter((i) => i.organizationId === organizationId);
}

export function clearOrganizationMembershipForTests(): void {
  memoryMembers.length = 0;
  memoryInvites.length = 0;
  if (!isBrowser()) return;
  window.localStorage.removeItem(resolveStorageKey(MEMBERS_KEY));
  window.localStorage.removeItem(resolveStorageKey(INVITES_KEY));
}
