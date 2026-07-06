import {
  buildSessionRegistrySnapshot,
  copySessionRegistryEntry,
  createSessionRegistryEntry,
  refreshSessionRegistryEntry,
  sortRegistryEntries,
  updateSessionRegistryEntry,
} from "@/lib/intelligence/runtime/registry/registry-state";
import type {
  SessionRegisterResult,
  SessionRegistryEntry,
  SessionRegistrySnapshot,
  SessionUpdateResult,
} from "@/lib/intelligence/runtime/registry/types";
import type { RuntimeSession } from "@/lib/intelligence/runtime/runtime-session";

/** Stable identifier for the default session registry. */
export const DEFAULT_SESSION_REGISTRY_ID = "default-session-registry";

/**
 * Contract for the CBAI Intelligence Session Registry (BUILD-045).
 *
 * In-memory tracking of RuntimeSession instances.
 * No persistence, timers, workers, or browser APIs.
 */
export interface SessionRegistry {
  /** Register a new runtime session. */
  register(session: RuntimeSession, registeredAt?: string): SessionRegisterResult;

  /** Retrieve a registry entry by session id. */
  get(sessionId: string): SessionRegistryEntry | null;

  /** List all registry entries in deterministic order. */
  list(): readonly SessionRegistryEntry[];

  /** Update an existing registry entry with a refreshed session. */
  update(
    sessionId: string,
    session: RuntimeSession,
    updatedAt?: string,
  ): SessionUpdateResult;

  /** Remove a session from the registry by id. */
  remove(sessionId: string): SessionRegistryEntry | null;

  /** Remove all sessions from the registry. */
  clear(): void;

  /** Immutable registry state snapshot. */
  snapshot(): SessionRegistrySnapshot;
}

/**
 * Default in-memory intelligence session registry (BUILD-045).
 */
export class DefaultSessionRegistry implements SessionRegistry {
  private entries = new Map<string, SessionRegistryEntry>();

  register(
    session: RuntimeSession,
    registeredAt: string = new Date().toISOString(),
  ): SessionRegisterResult {
    const state = session.snapshot();

    if (!state.sessionId.trim()) {
      return { accepted: false, reason: "Register reject: session id is required." };
    }

    if (this.entries.has(state.sessionId)) {
      return {
        accepted: false,
        reason: `Register reject: session id "${state.sessionId}" is already registered.`,
      };
    }

    const entry = createSessionRegistryEntry(session, registeredAt);
    this.entries.set(entry.sessionId, entry);

    return { accepted: true, entry: copySessionRegistryEntry(entry) };
  }

  get(sessionId: string): SessionRegistryEntry | null {
    const entry = this.entries.get(sessionId);

    if (!entry) {
      return null;
    }

    const refreshed = refreshSessionRegistryEntry(entry);
    this.entries.set(sessionId, refreshed);

    return copySessionRegistryEntry(refreshed);
  }

  list(): readonly SessionRegistryEntry[] {
    const refreshed = sortRegistryEntries([...this.entries.values()]).map((entry) =>
      refreshSessionRegistryEntry(entry),
    );

    for (const entry of refreshed) {
      this.entries.set(entry.sessionId, entry);
    }

    return refreshed.map(copySessionRegistryEntry);
  }

  update(
    sessionId: string,
    session: RuntimeSession,
    updatedAt: string = new Date().toISOString(),
  ): SessionUpdateResult {
    const existing = this.entries.get(sessionId);

    if (!existing) {
      return {
        updated: false,
        reason: `Update reject: session id "${sessionId}" is not registered.`,
      };
    }

    const state = session.snapshot();

    if (state.sessionId !== sessionId) {
      return {
        updated: false,
        reason: `Update reject: session id mismatch — expected "${sessionId}", got "${state.sessionId}".`,
      };
    }

    const entry = updateSessionRegistryEntry(existing, session, updatedAt);
    this.entries.set(sessionId, entry);

    return { updated: true, entry: copySessionRegistryEntry(entry) };
  }

  remove(sessionId: string): SessionRegistryEntry | null {
    const entry = this.entries.get(sessionId);

    if (!entry) {
      return null;
    }

    this.entries.delete(sessionId);
    return copySessionRegistryEntry(entry);
  }

  clear(): void {
    this.entries.clear();
  }

  snapshot(): SessionRegistrySnapshot {
    const entries = this.list();
    return buildSessionRegistrySnapshot(entries);
  }
}

/** Shared default session registry singleton. */
export const defaultSessionRegistry = new DefaultSessionRegistry();
