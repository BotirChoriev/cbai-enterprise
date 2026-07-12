/**
 * Real ownership for existing localStorage-backed stores (Authentication + User Platform
 * Foundation mission; extended for cloud accounts by the Real Supabase Authentication + Cloud
 * Persistence mission) — every Project, Bookmark, and Recent-Activity entry belongs to the
 * signed-in identity's own key, without duplicating any storage shape or function. Each store
 * keeps its exact same read/write functions; only the raw key string changes, computed here from
 * the real current session.
 *
 * Precedence: a real cloud session (lib/supabase/cloud-session-sync.ts) always wins over a
 * device-local session (lib/auth/auth-store.ts) — a signed-in cloud user's local cache is
 * pull-synced from Supabase (see lib/supabase/pull-sync.ts) into its own `:cloud:<id>` bucket,
 * which must never collide with that same person's separate device-local account bucket, and must
 * never collide with another cloud user's bucket on a shared/public machine. Only when neither
 * session exists does storage fall back to the shared `:local` bucket — the exact same data every
 * existing anonymous user already had before either auth mission, at the exact same effective key
 * shape, so nothing already saved becomes unreachable. The one-time migration below moves it under
 * `:local` explicitly on first read, so the legacy bare key is never silently read from in two
 * different places.
 */

import { getCurrentUserId } from "@/lib/auth/auth-store";
import { getSyncedCloudUserId } from "@/lib/supabase/cloud-session-sync";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

/** The real, namespaced key for a given base storage key and the current session. */
export function namespacedKey(baseKey: string): string {
  const cloudUserId = getSyncedCloudUserId();
  if (cloudUserId) return `${baseKey}:cloud:${cloudUserId}`;
  const userId = getCurrentUserId();
  return userId ? `${baseKey}:u:${userId}` : `${baseKey}:local`;
}

/**
 * One-time migration: if the namespaced local-bucket key has never been written, but the
 * original (pre-auth) bare key has real data, copy it forward. Only ever migrates into the
 * shared `:local` bucket — a signed-in user's private key is never auto-populated from anonymous
 * browser data, since that would silently attribute someone else's data to whoever happens to
 * sign in first.
 */
export function migrateLegacyKeyIfNeeded(baseKey: string): void {
  if (!isBrowser()) return;
  const userId = getCurrentUserId();
  if (userId) return;

  const localKey = `${baseKey}:local`;
  if (window.localStorage.getItem(localKey) !== null) return;

  const legacyValue = window.localStorage.getItem(baseKey);
  if (legacyValue === null) return;

  window.localStorage.setItem(localKey, legacyValue);
}

/** Convenience: the real key to read/write for a base storage key right now, migrating legacy
 * data into the local bucket first when needed. */
export function resolveStorageKey(baseKey: string): string {
  migrateLegacyKeyIfNeeded(baseKey);
  return namespacedKey(baseKey);
}
