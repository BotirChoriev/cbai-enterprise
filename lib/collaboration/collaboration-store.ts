/**
 * BUILD-030B — Collaboration persistence (device-local).
 * Multi-account collaboration requires shared backend — not claimed here.
 */

import { resolveStorageKey } from "@/lib/storage/namespaced-key";
import { authorizeOrganizationAction } from "@/lib/organization-os/authorization-policy";
import { createLivingRelationship } from "@/lib/living-object-network/living-relationship-store";
import type {
  CollaborationParticipant,
  CollaborationSharePolicy,
  MissionCollaboration,
  SharedLivingObject,
} from "@/lib/collaboration/collaboration.types";
import { DEFAULT_SHARE_POLICY } from "@/lib/collaboration/collaboration.types";
import type { LivingObjectReference } from "@/lib/living-object-network/living-object.types";

const COLLAB_KEY = "cbai-mission-collaborations";
const PARTICIPANTS_KEY = "cbai-collaboration-participants";
const SHARED_KEY = "cbai-collaboration-shared-objects";
const POLICY_KEY = "cbai-collaboration-share-policies";

const memoryCollabs: MissionCollaboration[] = [];
const memoryParticipants: CollaborationParticipant[] = [];
const memoryShared: SharedLivingObject[] = [];

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function readList<T>(key: string, isValid: (v: unknown) => v is T): T[] {
  if (!isBrowser()) {
    if (key === COLLAB_KEY) return memoryCollabs.filter(isValid) as T[];
    if (key === PARTICIPANTS_KEY) return memoryParticipants.filter(isValid) as T[];
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

  const collabs = readList(COLLAB_KEY, isCollab);
  writeList(
    COLLAB_KEY,
    collabs.map((c) =>
      c.id === collaborationId ? { ...c, status: "active" as const, updatedAt: now } : c,
    ),
  );
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
  void actorId;
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

export function clearCollaborationForTests(): void {
  memoryCollabs.length = 0;
  memoryParticipants.length = 0;
  memoryShared.length = 0;
}
