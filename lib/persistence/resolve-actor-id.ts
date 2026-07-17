/**
 * BUILD-039 — Resolve authenticated actor id for org/collaboration mutations.
 */

import { getCurrentUserId } from "@/lib/auth/auth-store";
import { getSyncedCloudUserId } from "@/lib/supabase/cloud-session-sync";
import { isOrganizationCollaborationShared } from "@/lib/persistence/persistence-capability";

/** Cloud user when shared backend is active; otherwise device-local session user. */
export function resolveActorId(): string | null {
  if (isOrganizationCollaborationShared()) {
    return getSyncedCloudUserId();
  }
  return getCurrentUserId();
}

export function requireActorId(): string | { readonly error: string; readonly code: "not_authenticated" } {
  const id = resolveActorId();
  if (!id) return { error: "Sign in to perform this action.", code: "not_authenticated" };
  return id;
}
