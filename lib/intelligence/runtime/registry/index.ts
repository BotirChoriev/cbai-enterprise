/**
 * CBAI Intelligence Runtime — Session Registry (BUILD-045).
 *
 * In-memory registry for RuntimeSession tracking.
 * Not wired to Orchestrator yet.
 *
 * @see docs/build-045-report.md
 */

export {
  DEFAULT_SESSION_REGISTRY_ID,
  DefaultSessionRegistry,
  defaultSessionRegistry,
  type SessionRegistry,
} from "@/lib/intelligence/runtime/registry/session-registry";

export {
  buildSessionRegistrySnapshot,
  copySessionRegistryEntry,
  countActiveSessions,
  countSessionsByLifecycle,
  createSessionRegistryEntry,
  findLatestRegistryEntry,
  isActiveSessionLifecycle,
  refreshSessionRegistryEntry,
  resolveEntryLifecycle,
  sortRegistryEntries,
  updateSessionRegistryEntry,
} from "@/lib/intelligence/runtime/registry/registry-state";

export {
  queryActiveSessions,
  queryByLifecycleStatus,
  queryByRequestId,
  queryBySessionId,
  queryCancelledSessions,
  queryCompletedSessions,
  queryFailedSessions,
} from "@/lib/intelligence/runtime/registry/registry-query";

export type {
  SessionRegisterResult,
  SessionRegistryEntry,
  SessionRegistrySnapshot,
  SessionUpdateResult,
} from "@/lib/intelligence/runtime/registry/types";

export { RUNTIME_SESSION_REGISTRY_VERSION } from "@/lib/intelligence/runtime/registry/types";
