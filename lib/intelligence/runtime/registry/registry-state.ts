import type { RuntimeSession } from "@/lib/intelligence/runtime/runtime-session";
import type { RuntimeLifecycleStatus } from "@/lib/intelligence/runtime/runtime.types";
import type {
  SessionRegistryEntry,
  SessionRegistrySnapshot,
} from "@/lib/intelligence/runtime/registry/types";
import { RUNTIME_SESSION_REGISTRY_VERSION } from "@/lib/intelligence/runtime/registry/types";

/**
 * Returns true when lifecycle represents an active (non-terminal) session.
 */
export function isActiveSessionLifecycle(lifecycle: RuntimeLifecycleStatus): boolean {
  return lifecycle === "created" || lifecycle === "running" || lifecycle === "paused";
}

/**
 * Count registry entries matching a lifecycle status.
 */
export function countSessionsByLifecycle(
  entries: readonly SessionRegistryEntry[],
  lifecycle: RuntimeLifecycleStatus,
): number {
  return entries.filter((entry) => entry.lifecycle === lifecycle).length;
}

/**
 * Count active sessions (created, running, paused).
 */
export function countActiveSessions(entries: readonly SessionRegistryEntry[]): number {
  return entries.filter((entry) => isActiveSessionLifecycle(entry.lifecycle)).length;
}

/**
 * Refresh lifecycle from a runtime session snapshot.
 */
export function resolveEntryLifecycle(session: RuntimeSession): RuntimeLifecycleStatus {
  return session.snapshot().lifecycle;
}

/**
 * Create a registry entry from a runtime session.
 */
export function createSessionRegistryEntry(
  session: RuntimeSession,
  timestamp: string = new Date().toISOString(),
): SessionRegistryEntry {
  const state = session.snapshot();

  return {
    sessionId: state.sessionId,
    requestId: state.requestId,
    lifecycle: state.lifecycle,
    session,
    registeredAt: timestamp,
    updatedAt: timestamp,
  };
}

/**
 * Refresh a registry entry lifecycle and updatedAt from its session.
 */
export function refreshSessionRegistryEntry(
  entry: SessionRegistryEntry,
  timestamp: string = new Date().toISOString(),
): SessionRegistryEntry {
  return {
    ...entry,
    lifecycle: resolveEntryLifecycle(entry.session),
    updatedAt: timestamp,
  };
}

/**
 * Replace the session on a registry entry and refresh metadata.
 */
export function updateSessionRegistryEntry(
  entry: SessionRegistryEntry,
  session: RuntimeSession,
  timestamp: string = new Date().toISOString(),
): SessionRegistryEntry {
  const state = session.snapshot();

  return {
    sessionId: state.sessionId,
    requestId: state.requestId,
    lifecycle: state.lifecycle,
    session,
    registeredAt: entry.registeredAt,
    updatedAt: timestamp,
  };
}

/**
 * Find the entry with the latest updatedAt timestamp.
 */
export function findLatestRegistryEntry(
  entries: readonly SessionRegistryEntry[],
): SessionRegistryEntry | null {
  if (entries.length === 0) {
    return null;
  }

  return [...entries].sort((a, b) => {
    const timeCompare = b.updatedAt.localeCompare(a.updatedAt);

    if (timeCompare !== 0) {
      return timeCompare;
    }

    return b.sessionId.localeCompare(a.sessionId);
  })[0];
}

/**
 * Build an immutable session registry snapshot.
 */
export function buildSessionRegistrySnapshot(
  entries: readonly SessionRegistryEntry[],
): SessionRegistrySnapshot {
  const latest = findLatestRegistryEntry(entries);

  return {
    total: entries.length,
    active: countActiveSessions(entries),
    completed: countSessionsByLifecycle(entries, "completed"),
    failed: countSessionsByLifecycle(entries, "failed"),
    cancelled: countSessionsByLifecycle(entries, "cancelled"),
    latestSessionId: latest?.sessionId ?? null,
    latestUpdatedAt: latest?.updatedAt ?? null,
    registryVersion: RUNTIME_SESSION_REGISTRY_VERSION,
  };
}

/**
 * Sort registry entries deterministically by registeredAt then sessionId.
 */
export function sortRegistryEntries(
  entries: readonly SessionRegistryEntry[],
): SessionRegistryEntry[] {
  return [...entries].sort((a, b) => {
    const registeredCompare = a.registeredAt.localeCompare(b.registeredAt);

    if (registeredCompare !== 0) {
      return registeredCompare;
    }

    return a.sessionId.localeCompare(b.sessionId);
  });
}

/**
 * Produce a shallow copy of a registry entry for external reads.
 */
export function copySessionRegistryEntry(entry: SessionRegistryEntry): SessionRegistryEntry {
  return { ...entry };
}
