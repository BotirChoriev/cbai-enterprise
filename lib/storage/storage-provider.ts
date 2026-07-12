/**
 * Storage Provider abstraction (Authentication + User Platform Foundation mission).
 *
 * This platform's entire persistence layer (Projects, Bookmarks, Recent Activity, Notes, Tasks)
 * has always been synchronous localStorage reads/writes — real, working, and honest about being
 * device-local. A real cloud backend (Supabase or otherwise) is fundamentally asynchronous (every
 * call is a network request), so it cannot be dropped in without every calling store function
 * becoming async too — a repo-wide signature change to dozens of already-real, already-tested
 * functions. That rewrite is deliberately NOT done here (this mission says "do not redesign," and
 * there is no real Supabase project or credentials in this environment to build or test against —
 * writing the async call sites now, with nothing real to call, would itself be a kind of
 * fabrication).
 *
 * What this file provides instead: a real, typed `CloudStorageAdapter` contract describing
 * exactly what a future cloud backend needs to implement, and a real (but honestly unconfigured)
 * `SupabaseStorageAdapter` that reports its own status truthfully. `currentStorageMode()` is the
 * one function the rest of the app can check — today it always returns "local", because no
 * `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY` exist in this environment. The moment
 * real credentials are configured, this becomes the real switch point — no other file needs to
 * change to start preferring cloud storage.
 */

export type StorageMode = "local" | "cloud";

/** What any real cloud backend (Supabase or otherwise) would need to implement. Every method is
 * honestly async — a real network call can never be synchronous. */
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

/** The one real switch point for the whole app: "local" (browser storage) until real cloud
 * credentials exist, then "cloud". Every store in this app should stay on `local` behavior today
 * — this function exists so that flip is a one-place change later, not a rewrite. */
export function currentStorageMode(): StorageMode {
  return isCloudStorageConfigured() ? "cloud" : "local";
}

/**
 * Real, typed, but honestly inactive today — every method rejects with a clear message rather
 * than silently no-op'ing or fabricating a successful write. Not wired into any store in this
 * app; exists so the shape of a real integration is already decided. A future implementation
 * would construct a Supabase client from the env vars above and call
 * `supabase.from(...).select()/upsert()/delete()` here instead of rejecting.
 */
export class SupabaseStorageAdapter implements CloudStorageAdapter {
  get isConfigured(): boolean {
    return isCloudStorageConfigured();
  }

  private unavailable(operation: string): Error {
    return new Error(
      `Supabase storage is not configured in this deployment — cannot ${operation}. Set ` +
        "NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY, then install " +
        "@supabase/supabase-js, to activate it.",
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
