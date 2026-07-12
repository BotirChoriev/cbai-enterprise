/**
 * Storage Provider abstraction (Authentication + User Platform Foundation mission; superseded in
 * part by the Real Supabase Authentication + Cloud Persistence mission — read on).
 *
 * This file originally sketched a generic key-value `CloudStorageAdapter` (getItem/setItem/
 * removeItem) as the eventual cloud backend contract, honestly unconfigured because no real
 * Supabase project or credentials existed in that mission's environment.
 *
 * The real cloud backend that was later built (see lib/supabase/) does NOT use that generic KV
 * shape. supabase/migrations/0001_init_schema.sql requires typed relational tables — "Do not
 * store core relational data as one giant JSON blob" — so a real Project, Note, Task, etc. each
 * gets its own typed row via lib/supabase/cloud-tables.ts, synced through lib/supabase/outbox.ts,
 * not a single opaque blob keyed by a string. That is real, working code today, gated on
 * `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY` exactly like this file's
 * `isCloudStorageConfigured()` below.
 *
 * `currentStorageMode()` remains the one honest switch point the rest of the app can check for a
 * simple local/cloud read — `components/platform/context/AuthProvider.tsx`'s `accountMode` is the
 * richer, session-aware version of the same idea ("cloud" additionally requires an active signed-in
 * cloud session, not just configuration).
 */

export type StorageMode = "local" | "cloud";

/** What a generic key-value cloud backend would need to implement. Kept for backward
 * compatibility and as a simple reference shape — the real Supabase integration (lib/supabase/)
 * uses typed per-table operations instead, not this generic interface, for the reasons above. */
export interface CloudStorageAdapter {
  readonly isConfigured: boolean;
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

function readEnv(name: string): string | undefined {
  if (typeof process === "undefined" || !process.env) return undefined;
  return process.env[name];
}

/** Real env-var check — never assumes configuration that isn't there. */
export function isCloudStorageConfigured(): boolean {
  return Boolean(readEnv("NEXT_PUBLIC_SUPABASE_URL")) && Boolean(readEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"));
}

/** The one honest switch point for a simple local/cloud read: "local" (browser storage) until
 * real cloud credentials exist, then "cloud". For session-aware behavior (is a cloud user actually
 * signed in right now, not just configured), prefer `useAuth().accountMode`. */
export function currentStorageMode(): StorageMode {
  return isCloudStorageConfigured() ? "cloud" : "local";
}

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

/** Real, working local adapter — every existing store in this app (lib/project/project-store.ts,
 * lib/context/context-history.ts, lib/reports/reports-store.ts) already implements this same
 * getItem/setItem/removeItem behavior directly against `window.localStorage`; this class exists so
 * the two-adapter shape Phase 7 asks for is concretely satisfiable, not just described. */
export class LocalStorageAdapter implements CloudStorageAdapter {
  get isConfigured(): boolean {
    return isBrowser();
  }

  async getItem(key: string): Promise<string | null> {
    if (!isBrowser()) return null;
    return window.localStorage.getItem(key);
  }

  async setItem(key: string, value: string): Promise<void> {
    if (!isBrowser()) return;
    window.localStorage.setItem(key, value);
  }

  async removeItem(key: string): Promise<void> {
    if (!isBrowser()) return;
    window.localStorage.removeItem(key);
  }
}

/**
 * Real, typed, but deliberately inactive: a generic key-value adapter would require folding every
 * Project/Note/Task/etc. into one JSON blob per key, which supabase/migrations/0001_init_schema.sql
 * explicitly rejects in favor of real relational tables. This class stays honestly unconfigured
 * (never fabricates a successful write) and points callers at the real integration instead of
 * silently doing the wrong thing.
 */
export class SupabaseStorageAdapter implements CloudStorageAdapter {
  get isConfigured(): boolean {
    return isCloudStorageConfigured();
  }

  private unavailable(operation: string): Error {
    return new Error(
      `Generic key-value Supabase storage was never built for "${operation}" — CBAI's real cloud ` +
        "backend uses typed per-table operations instead. See lib/supabase/cloud-tables.ts, " +
        "lib/supabase/outbox.ts, and lib/reports/reports-store.ts/lib/project/project-store.ts for " +
        "the real, active integration.",
    );
  }

  async getItem(key: string): Promise<string | null> {
    throw this.unavailable(`read "${key}"`);
  }

  async setItem(key: string, value: string): Promise<void> {
    throw this.unavailable(`write "${key}" (${value.length} chars)`);
  }

  async removeItem(key: string): Promise<void> {
    throw this.unavailable(`remove "${key}"`);
  }
}
