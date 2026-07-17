/**
 * BUILD-029 — Organization membership and role assignments (device-local, real user records only).
 */

import type { Organization } from "@/lib/organization-os/organization.types";
import { saveOrganization, createOrganizationDraft } from "@/lib/organization-os/organization-store";
import { resolveStorageKey } from "@/lib/storage/namespaced-key";

export type OrganizationRole =
  | "owner"
  | "administrator"
  | "mission_lead"
  | "researcher"
  | "reviewer"
  | "member"
  | "guest";

export type OrganizationMembership = {
  readonly id: string;
  readonly organizationId: string;
  readonly userId: string;
  readonly userDisplayName: string;
  readonly role: OrganizationRole;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type OrganizationInvitation = {
  readonly id: string;
  readonly organizationId: string;
  readonly inviteeEmail: string;
  readonly role: OrganizationRole;
  readonly status: "pending" | "accepted" | "declined" | "revoked" | "expired";
  readonly createdAt: string;
  readonly updatedAt: string;
};

const MEMBERS_KEY = "cbai-organization-memberships";
const INVITES_KEY = "cbai-organization-invitations";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function readList<T>(key: string, isValid: (v: unknown) => v is T): T[] {
  if (!isBrowser()) return [];
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
  if (!isBrowser()) return;
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

export function loadOrganizationMemberships(organizationId?: string): OrganizationMembership[] {
  const all = readList(MEMBERS_KEY, isMembership);
  return organizationId ? all.filter((m) => m.organizationId === organizationId) : all;
}

export function loadMembershipForUser(userId: string, organizationId: string): OrganizationMembership | null {
  return (
    loadOrganizationMemberships(organizationId).find(
      (m) => m.userId === userId && m.organizationId === organizationId,
    ) ?? null
  );
}

export function createOrganizationWithOwner(
  name: string,
  kind: Organization["kind"],
  ownerUserId: string,
  ownerDisplayName: string,
  missionStatement: string | null = null,
): { organization: Organization; membership: OrganizationMembership } {
  const organization = createOrganizationDraft(name, kind, missionStatement);
  saveOrganization(organization);

  const now = new Date().toISOString();
  const membership: OrganizationMembership = {
    id: `mem-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    organizationId: organization.id,
    userId: ownerUserId,
    userDisplayName: ownerDisplayName.trim(),
    role: "owner",
    createdAt: now,
    updatedAt: now,
  };

  const all = readList(MEMBERS_KEY, isMembership);
  writeList(MEMBERS_KEY, [...all, membership]);
  return { organization, membership };
}

export function inviteOrganizationMember(
  organizationId: string,
  inviteeEmail: string,
  role: OrganizationRole,
): OrganizationInvitation {
  const now = new Date().toISOString();
  const invitation: OrganizationInvitation = {
    id: `inv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    organizationId,
    inviteeEmail: inviteeEmail.trim().toLowerCase(),
    role,
    status: "pending",
    createdAt: now,
    updatedAt: now,
  };
  const all = readList(INVITES_KEY, isInvitation);
  writeList(INVITES_KEY, [...all, invitation]);
  return invitation;
}

export function acceptOrganizationInvitation(
  invitationId: string,
  userId: string,
  userDisplayName: string,
): OrganizationMembership | null {
  const invites = readList(INVITES_KEY, isInvitation);
  const invitation = invites.find((i) => i.id === invitationId);
  if (!invitation || invitation.status !== "pending") return null;

  const now = new Date().toISOString();
  const updatedInvites = invites.map((i) =>
    i.id === invitationId ? { ...i, status: "accepted" as const, updatedAt: now } : i,
  );
  writeList(INVITES_KEY, updatedInvites);

  const membership: OrganizationMembership = {
    id: `mem-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    organizationId: invitation.organizationId,
    userId,
    userDisplayName: userDisplayName.trim(),
    role: invitation.role,
    createdAt: now,
    updatedAt: now,
  };
  const members = readList(MEMBERS_KEY, isMembership);
  writeList(MEMBERS_KEY, [...members, membership]);
  return membership;
}

export function loadPendingInvitations(email: string): OrganizationInvitation[] {
  const normalized = email.trim().toLowerCase();
  return readList(INVITES_KEY, isInvitation).filter(
    (i) => i.inviteeEmail === normalized && i.status === "pending",
  );
}
