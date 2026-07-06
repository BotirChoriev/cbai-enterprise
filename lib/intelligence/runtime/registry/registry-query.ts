import {
  copySessionRegistryEntry,
  isActiveSessionLifecycle,
  sortRegistryEntries,
} from "@/lib/intelligence/runtime/registry/registry-state";
import type { SessionRegistry } from "@/lib/intelligence/runtime/registry/session-registry";
import type { SessionRegistryEntry } from "@/lib/intelligence/runtime/registry/types";
import type { RuntimeLifecycleStatus } from "@/lib/intelligence/runtime/runtime.types";

/**
 * Query a session registry entry by session id.
 */
export function queryBySessionId(
  registry: SessionRegistry,
  sessionId: string,
): SessionRegistryEntry | null {
  return registry.get(sessionId);
}

/**
 * Query all registry entries for a request id.
 */
export function queryByRequestId(
  registry: SessionRegistry,
  requestId: string,
): SessionRegistryEntry[] {
  return sortRegistryEntries(
    registry.list().filter((entry) => entry.requestId === requestId),
  ).map(copySessionRegistryEntry);
}

/**
 * Query registry entries by lifecycle status.
 */
export function queryByLifecycleStatus(
  registry: SessionRegistry,
  lifecycle: RuntimeLifecycleStatus,
): SessionRegistryEntry[] {
  return sortRegistryEntries(
    registry.list().filter((entry) => entry.lifecycle === lifecycle),
  ).map(copySessionRegistryEntry);
}

/**
 * Query active sessions (created, running, paused).
 */
export function queryActiveSessions(registry: SessionRegistry): SessionRegistryEntry[] {
  return sortRegistryEntries(
    registry.list().filter((entry) => isActiveSessionLifecycle(entry.lifecycle)),
  ).map(copySessionRegistryEntry);
}

/**
 * Query completed sessions.
 */
export function queryCompletedSessions(registry: SessionRegistry): SessionRegistryEntry[] {
  return queryByLifecycleStatus(registry, "completed");
}

/**
 * Query failed sessions.
 */
export function queryFailedSessions(registry: SessionRegistry): SessionRegistryEntry[] {
  return queryByLifecycleStatus(registry, "failed");
}

/**
 * Query cancelled sessions.
 */
export function queryCancelledSessions(registry: SessionRegistry): SessionRegistryEntry[] {
  return queryByLifecycleStatus(registry, "cancelled");
}
