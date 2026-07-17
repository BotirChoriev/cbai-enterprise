/**
 * BUILD-030B — Collaboration persistence (device-local).
 * Multi-account collaboration requires shared backend — not claimed here.
 */

import { resolveStorageKey } from "@/lib/storage/namespaced-key";
import { authorizeOrganizationAction } from "@/lib/organization-os/authorization-policy";
import { createLivingRelationship } from "@/lib/living-object-network/living-relationship-store";
import type {
  CollaborationParticipant,
  CollaborationReviewAssignment,
  CollaborationSharePolicy,
  MissionCollaboration,
  SharedLivingObject,
} from "@/lib/collaboration/collaboration.types";
import { DEFAULT_SHARE_POLICY } from "@/lib/collaboration/collaboration.types";
import type { LivingObjectReference } from "@/lib/living-object-network/living-object.types";
import { recordCollaborationAudit } from "@/lib/collaboration/collaboration-audit-store";
import { createUserNotification } from "@/lib/notifications/user-notification-store";

const COLLAB_KEY = "cbai-mission-collaborations";
const PARTICIPANTS_KEY = "cbai-collaboration-participants";
const SHARED_KEY = "cbai-collaboration-shared-objects";
const POLICY_KEY = "cbai-collaboration-share-policies";
const REVIEWS_KEY = "cbai-collaboration-review-assignments";

const memoryCollabs: MissionCollaboration[] = [];
const memoryParticipants: CollaborationParticipant[] = [];
const memoryShared: SharedLivingObject[] = [];
const memoryReviews: CollaborationReviewAssignment[] = [];

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function readList<T>(key: string, isValid: (v: unknown) => v is T): T[] {
  if (!isBrowser()) {
    if (key === COLLAB_KEY) return memoryCollabs.filter(isValid) as T[];
    if (key === PARTICIPANTS_KEY) return memoryParticipants.filter(isValid) as T[];
    if (key === REVIEWS_KEY) return memoryReviews.filter(isValid) as T[];
    return memoryShared.filter(isValid) as T[];
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
    if (key === COLLAB_KEY) {
      memoryCollabs.length = 0;
      memoryCollabs.push(...(items as unknown as MissionCollaboration[]));
    } else if (key === PARTICIPANTS_KEY) {
      memoryParticipants.length = 0;
      memoryParticipants.push(...(items as unknown as CollaborationParticipant[]));
    } else if (key === REVIEWS_KEY) {
      memoryReviews.length = 0;
      memoryReviews.push(...(items as unknown as CollaborationReviewAssignment[]));
    } else {
      memoryShared.length = 0;
      memoryShared.push(...(items as unknown as SharedLivingObject[]));
    }
    return;
  }
  window.localStorage.setItem(resolveStorageKey(key), JSON.stringify(items));
}

function isCollab(v: unknown): v is MissionCollaboration {
  const c = v as MissionCollaboration;
  return typeof c?.id === "string" && typeof c?.missionId === "string";
}

function isParticipant(v: unknown): v is CollaborationParticipant {
  const p = v as CollaborationParticipant;
  return typeof p?.id === "string" && typeof p?.collaborationId === "string";
}

function isShared(v: unknown): v is SharedLivingObject {
  const s = v as SharedLivingObject;
  return typeof s?.id === "string" && typeof s?.collaborationId === "string";
}

function isReview(v: unknown): v is CollaborationReviewAssignment {
  const r = v as CollaborationReviewAssignment;
  return typeof r?.id === "string" && typeof r?.collaborationId === "string";
}

export function loadMissionCollaborations(missionId?: string): MissionCollaboration[] {
  const all = readList(COLLAB_KEY, isCollab);
  return missionId ? all.filter((c) => c.missionId === missionId) : all;
}

export function loadCollaboration(collaborationId: string): MissionCollaboration | null {
  return loadMissionCollaborations().find((c) => c.id === collaborationId) ?? null;
}

export function createMissionCollaboration(input: {
  readonly missionId: string;
  readonly createdBy: string;
  readonly title: string;
  readonly description?: string | null;
  readonly ownerOrganizationId?: string | null;
}): MissionCollaboration | { readonly error: string } {
  if (input.ownerOrganizationId) {
    const auth = authorizeOrganizationAction({
      actorId: input.createdBy,
      organizationId: input.ownerOrganizationId,
      action: "collaboration.create",
    });
    if (!auth.ok) return { error: auth.message };
  }

  const now = new Date().toISOString();
  const collab: MissionCollaboration = {
    id: `collab-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    missionId: input.missionId,
    ownerOrganizationId: input.ownerOrganizationId ?? null,
    createdBy: input.createdBy,
    title: input.title.trim(),
    description: input.description ?? null,
    status: "inviting",
    visibility: "invited_participants",
    version: 1,
    createdAt: now,
    updatedAt: now,
  };
  writeList(COLLAB_KEY, [...readList(COLLAB_KEY, isCollab), collab]);

  const owner: CollaborationParticipant = {
    id: `cp-${Date.now()}`,
    collaborationId: collab.id,
    participantType: "user",
    participantId: input.createdBy,
    role: "owner",
    status: "active",
    invitedBy: input.createdBy,
    invitedAt: now,
    acceptedAt: now,
    version: 1,
  };
  writeList(PARTICIPANTS_KEY, [...readList(PARTICIPANTS_KEY, isParticipant), owner]);
  recordCollaborationAudit({
    collaborationId: collab.id,
    event: "collaboration_created",
    actorId: input.createdBy,
  });
  return collab;
}

export function inviteCollaborationParticipant(input: {
  readonly collaborationId: string;
  readonly invitedBy: string;
  readonly participantId: string;
  readonly role: CollaborationParticipant["role"];
}): CollaborationParticipant | { readonly error: string } {
  const collab = loadCollaboration(input.collaborationId);
  if (!collab || collab.status === "revoked") return { error: "Collaboration not available." };

  const now = new Date().toISOString();
  const participant: CollaborationParticipant = {
    id: `cp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    collaborationId: input.collaborationId,
    participantType: "user",
    participantId: input.participantId,
    role: input.role,
    status: "invited",
    invitedBy: input.invitedBy,
    invitedAt: now,
    version: 1,
  };
  writeList(PARTICIPANTS_KEY, [...readList(PARTICIPANTS_KEY, isParticipant), participant]);
  createUserNotification({
    recipientUserId: input.participantId,
    notificationType: "invitation_received",
    actorId: input.invitedBy,
    collaborationId: input.collaborationId,
  });
  recordCollaborationAudit({
    collaborationId: input.collaborationId,
    event: "participant_invited",
    actorId: input.invitedBy,
    targetId: participant.id,
  });
  return participant;
}

export function acceptCollaborationInvite(
  collaborationId: string,
  participantId: string,
  expectedVersion: number,
): CollaborationParticipant | { readonly error: string } {
  const participants = readList(PARTICIPANTS_KEY, isParticipant);
  const p = participants.find(
    (x) => x.collaborationId === collaborationId && x.participantId === participantId,
  );
  if (!p || p.status !== "invited") return { error: "Invitation not found." };
  if (p.version !== expectedVersion) return { error: "Participant record changed — reload." };

  const now = new Date().toISOString();
  const updated: CollaborationParticipant = {
    ...p,
    status: "active",
    acceptedAt: now,
    version: p.version + 1,
  };
  writeList(
    PARTICIPANTS_KEY,
    participants.map((x) => (x.id === p.id ? updated : x)),
  );

  const collab = loadCollaboration(collaborationId);
  if (!collab) return { error: "Collaboration not found." };

  const collabs = readList(COLLAB_KEY, isCollab);
  writeList(
    COLLAB_KEY,
    collabs.map((c) =>
      c.id === collaborationId ? { ...c, status: "active" as const, updatedAt: now } : c,
    ),
  );
  createUserNotification({
    recipientUserId: collab.createdBy,
    notificationType: "invitation_accepted",
    actorId: participantId,
    collaborationId,
  });
  recordCollaborationAudit({
    collaborationId,
    event: "participant_accepted",
    actorId: participantId,
    targetId: p.id,
  });
  return updated;
}

export function shareObjectInCollaboration(input: {
  readonly collaborationId: string;
  readonly sharedBy: string;
  readonly object: LivingObjectReference;
  readonly access: SharedLivingObject["access"];
}): SharedLivingObject | { readonly error: string } {
  const collab = loadCollaboration(input.collaborationId);
  if (!collab || collab.status === "revoked") return { error: "Collaboration not available." };

  const now = new Date().toISOString();
  const shared: SharedLivingObject = {
    id: `sh-${Date.now()}`,
    collaborationId: input.collaborationId,
    object: input.object,
    sharedBy: input.sharedBy,
    sharedAt: now,
    access: input.access,
    status: "active",
    version: 1,
  };
  writeList(SHARED_KEY, [...readList(SHARED_KEY, isShared), shared]);

  createLivingRelationship({
    source: input.object,
    target: { objectType: "collaboration", objectId: input.collaborationId },
    relationshipType: "shared_with",
    status: "human_confirmed",
    provenanceKind: "user_asserted",
    createdBy: input.sharedBy,
    collaborationId: input.collaborationId,
  });

  const participants = readList(PARTICIPANTS_KEY, isParticipant).filter(
    (p) => p.collaborationId === input.collaborationId && p.status === "active" && p.participantId !== input.sharedBy,
  );
  for (const p of participants) {
    createUserNotification({
      recipientUserId: p.participantId,
      notificationType: "object_shared",
      actorId: input.sharedBy,
      collaborationId: input.collaborationId,
      objectType: input.object.objectType,
      objectId: input.object.objectId,
    });
  }
  recordCollaborationAudit({
    collaborationId: input.collaborationId,
    event: "object_shared",
    actorId: input.sharedBy,
    targetId: shared.id,
  });

  return shared;
}

export function revokeSharedObject(
  sharedId: string,
  actorId: string,
): boolean {
  const all = readList(SHARED_KEY, isShared);
  const item = all.find((s) => s.id === sharedId);
  if (!item || item.status !== "active") return false;
  writeList(
    SHARED_KEY,
    all.map((s) => (s.id === sharedId ? { ...s, status: "revoked" as const, version: s.version + 1 } : s)),
  );
  const participants = readList(PARTICIPANTS_KEY, isParticipant).filter(
    (p) => p.collaborationId === item.collaborationId && p.status === "active" && p.participantId !== actorId,
  );
  for (const p of participants) {
    createUserNotification({
      recipientUserId: p.participantId,
      notificationType: "object_revoked",
      actorId,
      collaborationId: item.collaborationId,
      objectType: item.object.objectType,
      objectId: item.object.objectId,
    });
  }
  recordCollaborationAudit({
    collaborationId: item.collaborationId,
    event: "object_revoked",
    actorId,
    targetId: sharedId,
  });
  return true;
}

export function loadSharedObjects(collaborationId: string, participantId: string): SharedLivingObject[] {
  const participant = readList(PARTICIPANTS_KEY, isParticipant).find(
    (p) => p.collaborationId === collaborationId && p.participantId === participantId && p.status === "active",
  );
  if (!participant) return [];
  return readList(SHARED_KEY, isShared).filter(
    (s) => s.collaborationId === collaborationId && s.status === "active",
  );
}

export function loadCollaborationParticipants(collaborationId: string): CollaborationParticipant[] {
  return readList(PARTICIPANTS_KEY, isParticipant).filter((p) => p.collaborationId === collaborationId);
}

export function loadCollaborationSharePolicy(collaborationId: string): CollaborationSharePolicy {
  if (!isBrowser()) return DEFAULT_SHARE_POLICY;
  try {
    const raw = window.localStorage.getItem(resolveStorageKey(`${POLICY_KEY}:${collaborationId}`));
    if (!raw) return DEFAULT_SHARE_POLICY;
    return JSON.parse(raw) as CollaborationSharePolicy;
  } catch {
    return DEFAULT_SHARE_POLICY;
  }
}

export function assignCollaborationReview(input: {
  readonly collaborationId: string;
  readonly assignedBy: string;
  readonly assignedTo: string;
  readonly object: LivingObjectReference;
  readonly dueAt?: string | null;
}): CollaborationReviewAssignment | { readonly error: string } {
  const collab = loadCollaboration(input.collaborationId);
  if (!collab || collab.status === "revoked") return { error: "Collaboration not available." };

  const now = new Date().toISOString();
  const assignment: CollaborationReviewAssignment = {
    id: `rev-${Date.now()}`,
    collaborationId: input.collaborationId,
    object: input.object,
    assignedBy: input.assignedBy,
    assignedTo: input.assignedTo,
    status: "assigned",
    dueAt: input.dueAt ?? null,
    createdAt: now,
    updatedAt: now,
    version: 1,
  };
  writeList(REVIEWS_KEY, [...readList(REVIEWS_KEY, isReview), assignment]);
  createUserNotification({
    recipientUserId: input.assignedTo,
    notificationType: "review_assigned",
    actorId: input.assignedBy,
    collaborationId: input.collaborationId,
    objectType: input.object.objectType,
    objectId: input.object.objectId,
  });
  recordCollaborationAudit({
    collaborationId: input.collaborationId,
    event: "review_assigned",
    actorId: input.assignedBy,
    targetId: assignment.id,
  });
  return assignment;
}

export function completeCollaborationReview(input: {
  readonly assignmentId: string;
  readonly actorId: string;
  readonly outcome: "accepted" | "rejected" | "changes_requested";
  readonly expectedVersion: number;
}): CollaborationReviewAssignment | { readonly error: string } {
  const all = readList(REVIEWS_KEY, isReview);
  const assignment = all.find((a) => a.id === input.assignmentId);
  if (!assignment) return { error: "Review assignment not found." };
  if (assignment.assignedTo !== input.actorId) return { error: "Not assigned to this reviewer." };
  if (assignment.version !== input.expectedVersion) return { error: "Assignment changed — reload." };

  const statusMap = {
    accepted: "accepted" as const,
    rejected: "rejected" as const,
    changes_requested: "changes_requested" as const,
  };
  const now = new Date().toISOString();
  const updated: CollaborationReviewAssignment = {
    ...assignment,
    status: statusMap[input.outcome],
    updatedAt: now,
    version: assignment.version + 1,
  };
  writeList(REVIEWS_KEY, all.map((a) => (a.id === assignment.id ? updated : a)));
  createUserNotification({
    recipientUserId: assignment.assignedBy,
    notificationType: input.outcome === "accepted" ? "review_completed" : "changes_requested",
    actorId: input.actorId,
    collaborationId: assignment.collaborationId,
    objectType: assignment.object.objectType,
    objectId: assignment.object.objectId,
  });
  recordCollaborationAudit({
    collaborationId: assignment.collaborationId,
    event: "review_completed",
    actorId: input.actorId,
    targetId: assignment.id,
    safeMetadata: { outcome: input.outcome },
  });
  return updated;
}

export function loadCollaborationReviewAssignments(collaborationId: string): CollaborationReviewAssignment[] {
  return readList(REVIEWS_KEY, isReview).filter((a) => a.collaborationId === collaborationId);
}

export function revokeCollaborationParticipant(input: {
  readonly collaborationId: string;
  readonly actorId: string;
  readonly participantId: string;
}): boolean {
  const participants = readList(PARTICIPANTS_KEY, isParticipant);
  const target = participants.find(
    (p) => p.collaborationId === input.collaborationId && p.participantId === input.participantId,
  );
  if (!target || target.status !== "active") return false;
  const now = new Date().toISOString();
  writeList(
    PARTICIPANTS_KEY,
    participants.map((p) =>
      p.id === target.id ? { ...p, status: "revoked" as const, revokedAt: now, version: p.version + 1 } : p,
    ),
  );
  createUserNotification({
    recipientUserId: input.participantId,
    notificationType: "participant_revoked",
    actorId: input.actorId,
    collaborationId: input.collaborationId,
  });
  recordCollaborationAudit({
    collaborationId: input.collaborationId,
    event: "participant_revoked",
    actorId: input.actorId,
    targetId: target.id,
  });
  return true;
}

export function clearCollaborationForTests(): void {
  memoryCollabs.length = 0;
  memoryParticipants.length = 0;
  memoryShared.length = 0;
  memoryReviews.length = 0;
}
