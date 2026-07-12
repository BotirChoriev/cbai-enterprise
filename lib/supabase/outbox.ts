/**
 * Cloud sync outbox (Real Supabase Authentication + Cloud Persistence mission, Phase 7/9/13).
 *
 * Local storage stays the single synchronous source of truth for every read in this app (see
 * lib/project/project-store.ts and lib/context/context-history.ts) — that is what keeps Local Mode
 * unchanged and every existing call site working without becoming async. This module is the one
 * real bridge from those synchronous writes to the asynchronous Supabase backend: every mutation,
 * while in Cloud Mode, enqueues a real background write here instead of blocking on the network.
 *
 * Guarantees this module actually provides:
 *  - Retry-safe: every write is a real upsert keyed on (owner_id, local_id) — retrying a failed op
 *    can never create a duplicate cloud row (see lib/supabase/cloud-tables.ts).
 *  - Never loses work silently: the queue itself is persisted to localStorage per cloud user, so a
 *    refresh or a closed tab does not drop a pending write — it resumes and retries on next load.
 *  - Visible status: `getSyncStatus`/`subscribeSyncStatus` expose real Saving/Saved/Could not save
 *    state per record, consumable via useSyncExternalStore, never fabricated as instantly "Saved."
 *  - No diverging copies: while an op for a given record is queued or retrying, a newer enqueue for
 *    the same record replaces it in place rather than racing two writes for the same row.
 */

import { upsertCloudRow, deleteCloudRowByLocalId, type SyncTableName } from "@/lib/supabase/cloud-tables";
import type { Database } from "@/lib/supabase/database.types";

type OutboxAction = "upsert" | "delete";

type OutboxOp = {
  opId: string;
  table: SyncTableName;
  action: OutboxAction;
  ownerId: string;
  localId: string;
  payload?: Record<string, unknown>;
  createdAt: string;
  attempts: number;
  lastError?: string;
};

export type SyncStatus = "idle" | "saving" | "saved" | "error";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function outboxKey(ownerId: string): string {
  return `cbai-cloud-outbox:u:${ownerId}`;
}

function statusKey(table: SyncTableName, localId: string): string {
  return `${table}:${localId}`;
}

function readQueue(ownerId: string): OutboxOp[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(outboxKey(ownerId));
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as OutboxOp[]) : [];
  } catch {
    return [];
  }
}

function writeQueue(ownerId: string, queue: readonly OutboxOp[]): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(outboxKey(ownerId), JSON.stringify(queue));
}

// Real per-record status, shared module-level state so every subscriber (e.g. multiple components
// showing the same project) sees the same Saving/Saved/Error value — the same listener-Set pattern
// AuthProvider/AssistantProfileProvider already use for useSyncExternalStore.
const statusMap = new Map<string, SyncStatus>();
const statusListeners = new Set<() => void>();

function setStatus(table: SyncTableName, localId: string, status: SyncStatus): void {
  statusMap.set(statusKey(table, localId), status);
  statusListeners.forEach((listener) => listener());
}

export function getSyncStatus(table: SyncTableName, localId: string): SyncStatus {
  return statusMap.get(statusKey(table, localId)) ?? "idle";
}

export function subscribeSyncStatus(listener: () => void): () => void {
  statusListeners.add(listener);
  return () => statusListeners.delete(listener);
}

const processingOwners = new Set<string>();
const RETRY_DELAY_MS = [2000, 5000, 15000, 30000];

function retryDelayFor(attempts: number): number {
  return RETRY_DELAY_MS[Math.min(attempts, RETRY_DELAY_MS.length - 1)];
}

/** Enqueues a real background write. A newer op for the same (table, localId) replaces any queued
 * op still pending for that record, rather than racing two writes for the same row. */
export function enqueueSync(
  ownerId: string,
  table: SyncTableName,
  action: OutboxAction,
  localId: string,
  payload?: Record<string, unknown>,
): void {
  if (!isBrowser()) return;

  const queue = readQueue(ownerId).filter((op) => !(op.table === table && op.localId === localId));
  queue.push({
    opId: `outbox-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    table,
    action,
    ownerId,
    localId,
    payload,
    createdAt: new Date().toISOString(),
    attempts: 0,
  });
  writeQueue(ownerId, queue);
  setStatus(table, localId, "saving");

  void processQueue(ownerId);
}

/** Processes every queued op for one owner, in order, retrying failures with backoff. Safe to call
 * repeatedly (e.g. on app load, after a network-reconnect event) — a second concurrent call for the
 * same owner is a no-op while one is already running. */
export async function processQueue(ownerId: string): Promise<void> {
  if (!isBrowser() || processingOwners.has(ownerId)) return;
  processingOwners.add(ownerId);

  try {
    for (;;) {
      const queue = readQueue(ownerId);
      const op = queue[0];
      if (!op) return;

      const result =
        op.action === "delete"
          ? await deleteCloudRowByLocalId(op.table, op.ownerId, op.localId)
          : await upsertCloudRow(
              op.table,
              (op.payload ?? {}) as Database["public"]["Tables"][typeof op.table]["Insert"],
            );

      const latestQueue = readQueue(ownerId);
      const stillQueuedAsSameOp = latestQueue[0]?.opId === op.opId;
      if (!stillQueuedAsSameOp) continue; // a newer enqueue replaced this op mid-flight — restart the loop on it

      if (result.ok) {
        writeQueue(ownerId, latestQueue.slice(1));
        setStatus(op.table, op.localId, "saved");
        continue;
      }

      const attempts = op.attempts + 1;
      const updated: OutboxOp = { ...op, attempts, lastError: result.error };
      writeQueue(ownerId, [updated, ...latestQueue.slice(1)]);
      setStatus(op.table, op.localId, "error");

      // Stop the synchronous loop and retry this same op later — never drop it, never spin hot.
      window.setTimeout(() => {
        processingOwners.delete(ownerId);
        void processQueue(ownerId);
      }, retryDelayFor(attempts));
      return;
    }
  } finally {
    processingOwners.delete(ownerId);
  }
}

/** Real, honest count — used by My Work / offline UI to say "N changes waiting to sync" instead of
 * silently claiming everything is saved. */
export function pendingSyncCount(ownerId: string): number {
  return readQueue(ownerId).length;
}
