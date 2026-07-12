/**
 * Synchronous cloud-session peek (Real Supabase Authentication + Cloud Persistence mission).
 *
 * project-store.ts and context-history.ts are plain synchronous functions (not React), called
 * from dozens of places that all expect an immediate return — exactly like lib/auth/auth-store.ts's
 * `getCurrentUserId()` already does for the device-local account. To decide whether a mutation
 * should also enqueue a background cloud sync, those files need the same kind of synchronous
 * read for the *cloud* session.
 *
 * supabase-js persists its session as plain JSON under the storageKey configured in
 * lib/supabase/client.ts ("cbai-supabase-auth") — this reads that same key directly rather than
 * calling the async `supabase.auth.getSession()`. This is only ever used to decide whether to
 * queue a background write; it is never used for access control (Row Level Security on the real
 * Supabase session is what actually protects data — see supabase/migrations/0002_rls_policies.sql).
 */

const SUPABASE_AUTH_STORAGE_KEY = "cbai-supabase-auth";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

type PersistedSupabaseSession = {
  user?: { id?: string };
  expires_at?: number;
};

/** Real, synchronous read of the current cloud user id — null when signed out, unconfigured, or
 * the persisted session has expired. Never throws on malformed storage. */
export function getSyncedCloudUserId(): string | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(SUPABASE_AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedSupabaseSession;
    const userId = parsed.user?.id;
    if (!userId) return null;
    if (parsed.expires_at && parsed.expires_at * 1000 < Date.now()) return null;
    return userId;
  } catch {
    return null;
  }
}
