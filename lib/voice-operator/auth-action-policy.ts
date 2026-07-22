/**
 * Guest / authenticated / team scopes for voice & typed platform actions.
 * Pending intents never retain file bytes or secrets.
 */

import type { CanonicalOsAction } from "@/lib/platform-actions/action-registry";
import { canonicalOsActionForPlatformId, requiresAuthForOsAction } from "@/lib/platform-actions/action-registry";
import type { PlatformActionId } from "@/lib/platform-actions/types";

export type AuthWorkspaceScope = "guest" | "personal" | "team";

export type PendingAuthIntent = {
  readonly id: string;
  readonly createdAt: string;
  readonly osAction: CanonicalOsAction;
  readonly platformActionId: PlatformActionId | null;
  readonly href: string | null;
  readonly titleHint: string | null;
  readonly originalText: string;
  readonly locale: string;
  /** Never store File / ArrayBuffer / secrets here. */
  readonly metadata: Record<string, string>;
};

const PENDING_KEY = "cbai-pending-auth-intent";
let memoryPending: PendingAuthIntent | null = null;

export function resolveWorkspaceScope(isSignedIn: boolean, teamId: string | null): AuthWorkspaceScope {
  if (!isSignedIn) return "guest";
  if (teamId) return "team";
  return "personal";
}

export function isProtectedPlatformAction(actionId: PlatformActionId | null): boolean {
  if (!actionId) return false;
  return requiresAuthForOsAction(canonicalOsActionForPlatformId(actionId));
}

export function guestMayExecute(actionId: PlatformActionId | null): boolean {
  if (!actionId) return true; // conversational / FAQ
  if (isProtectedPlatformAction(actionId)) return false;
  // Public navigation / search / identity
  return true;
}

export function createPendingAuthIntent(input: Omit<PendingAuthIntent, "id" | "createdAt">): PendingAuthIntent {
  return {
    ...input,
    id: `pending_${Date.now().toString(36)}`,
    createdAt: new Date().toISOString(),
  };
}

export function savePendingAuthIntent(intent: PendingAuthIntent): void {
  memoryPending = intent;
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(PENDING_KEY, JSON.stringify(intent));
  } catch {
    /* ignore */
  }
}

export function readPendingAuthIntent(): PendingAuthIntent | null {
  if (typeof window !== "undefined") {
    try {
      const raw = window.sessionStorage.getItem(PENDING_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as PendingAuthIntent;
        if (parsed?.id && parsed.osAction) return parsed;
      }
    } catch {
      /* fall through to memory */
    }
  }
  return memoryPending;
}

export function clearPendingAuthIntent(): void {
  memoryPending = null;
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(PENDING_KEY);
  } catch {
    /* ignore */
  }
}

/** Guest-facing explanation keys (resolved via i18n). */
export function guestGateMessageKey(os: CanonicalOsAction): string {
  switch (os) {
    case "prepare_upload":
      return "authCollab.guestNeedsSignInUpload";
    case "create_team":
      return "authCollab.guestNeedsSignInTeam";
    case "invite_member":
      return "authCollab.guestNeedsSignInInvite";
    case "share_object":
      return "authCollab.guestNeedsSignInShare";
    case "prepare_publication":
      return "authCollab.guestNeedsSignInPublish";
    case "create_draft":
      return "authCollab.guestNeedsSignInDraft";
    default:
      return "authCollab.guestNeedsSignInGeneric";
  }
}
