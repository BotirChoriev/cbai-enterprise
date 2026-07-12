/**
 * Real ownership for existing localStorage-backed stores (Authentication + User Platform
 * Foundation mission) — every Project, Bookmark, and Recent-Activity entry now belongs to the
 * signed-in user's own key, without duplicating any storage shape or function. Each store keeps
 * its exact same read/write functions; only the raw key string changes, computed here from the
 * real current session (lib/auth/auth-store.ts).
 *
 * Signed out (or during static generation, where there is never a session): every store falls
 * back to one shared `:local` bucket — the exact same data every existing user already had before
 * this mission, at the exact same effective key shape, so nothing already saved becomes
 * unreachable. The one-time migration below moves it under `:local` explicitly on first read, so
 * the legacy bare key is never silently read from in two different places.
 */

import { getCurrentUserId } from "@/lib/auth/auth-store";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

/** The real, namespaced key for a given base storage key and the current session. */
export function namespacedKey(baseKey: string): string {
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
