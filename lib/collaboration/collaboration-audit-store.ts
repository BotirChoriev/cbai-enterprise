/**
 * BUILD-035 — Collaboration audit events (device-local).
 */

import { resolveStorageKey } from "@/lib/storage/namespaced-key";

export type CollaborationAuditEvent =
  | "collaboration_created"
  | "participant_invited"
  | "participant_accepted"
  | "participant_declined"
  | "participant_revoked"
  | "object_shared"
  | "object_revoked"
  | "review_assigned"
  | "review_completed"
  | "stale_write_rejected"
  | "collaboration_archived";

export type CollaborationAuditRecord = {
  readonly id: string;
  readonly collaborationId: string;
  readonly event: CollaborationAuditEvent;
  readonly actorId: string;
  readonly targetId?: string | null;
  readonly safeMetadata?: Record<string, string>;
  readonly createdAt: string;
};

const STORAGE_KEY = "cbai-collaboration-audit";
const memory: CollaborationAuditRecord[] = [];

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function readAll(): CollaborationAuditRecord[] {
  if (!isBrowser()) return [...memory];
  try {
    const raw = window.localStorage.getItem(resolveStorageKey(STORAGE_KEY));
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as CollaborationAuditRecord[]) : [];
  } catch {
    return [];
  }
}

function writeAll(items: readonly CollaborationAuditRecord[]): void {
  if (!isBrowser()) {
    memory.length = 0;
    memory.push(...items);
    return;
  }
  window.localStorage.setItem(resolveStorageKey(STORAGE_KEY), JSON.stringify(items));
}

export function recordCollaborationAudit(input: {
  readonly collaborationId: string;
  readonly event: CollaborationAuditEvent;
  readonly actorId: string;
  readonly targetId?: string | null;
  readonly safeMetadata?: Record<string, string>;
}): CollaborationAuditRecord {
  const record: CollaborationAuditRecord = {
    id: `caudit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    collaborationId: input.collaborationId,
    event: input.event,
    actorId: input.actorId,
    targetId: input.targetId ?? null,
    safeMetadata: input.safeMetadata ?? {},
    createdAt: new Date().toISOString(),
  };
  writeAll([...readAll(), record]);
  return record;
}

export function loadCollaborationAudit(collaborationId: string): CollaborationAuditRecord[] {
  return readAll()
    .filter((r) => r.collaborationId === collaborationId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function clearCollaborationAuditForTests(): void {
  memory.length = 0;
  if (!isBrowser()) return;
  window.localStorage.removeItem(resolveStorageKey(STORAGE_KEY));
}
