import type { RuntimeSession } from "@/lib/intelligence/runtime/runtime-session";
import type { RuntimeLifecycleStatus } from "@/lib/intelligence/runtime/runtime.types";

/**
 * A session entry tracked by the Intelligence Session Registry (BUILD-045).
 */
export interface SessionRegistryEntry {
  /** Unique runtime session identifier. */
  sessionId: string;
  /** Source intelligence request id. */
  requestId: string;
  /** Cached lifecycle status from the session snapshot at last register/update. */
  lifecycle: RuntimeLifecycleStatus;
  /** Registered runtime session instance — not modified by the registry. */
  session: RuntimeSession;
  /** ISO-8601 timestamp when the session was registered. */
  registeredAt: string;
  /** ISO-8601 timestamp when the registry entry was last updated. */
  updatedAt: string;
}

/**
 * Result of a session register operation.
 */
export interface SessionRegisterResult {
  /** Whether the session was accepted into the registry. */
  accepted: boolean;
  /** Registry entry when accepted. */
  entry?: SessionRegistryEntry;
  /** Rejection reason when not accepted. */
  reason?: string;
}

/**
 * Result of a session update operation.
 */
export interface SessionUpdateResult {
  /** Whether the session entry was updated. */
  updated: boolean;
  /** Updated registry entry when successful. */
  entry?: SessionRegistryEntry;
  /** Failure reason when not updated. */
  reason?: string;
}

/**
 * Immutable session registry state snapshot (BUILD-045).
 */
export interface SessionRegistrySnapshot {
  /** Total sessions tracked by the registry. */
  total: number;
  /** Sessions in created, running, or paused lifecycle. */
  active: number;
  /** Sessions with completed lifecycle. */
  completed: number;
  /** Sessions with failed lifecycle. */
  failed: number;
  /** Sessions with cancelled lifecycle. */
  cancelled: number;
  /** Session id with the most recent updatedAt, if any. */
  latestSessionId: string | null;
  /** Most recent updatedAt across all entries, if any. */
  latestUpdatedAt: string | null;
  /** Registry semantic version. */
  registryVersion: string;
}

/** Semantic version of the intelligence session registry foundation. */
export const RUNTIME_SESSION_REGISTRY_VERSION = "0.1.0-session-registry";
