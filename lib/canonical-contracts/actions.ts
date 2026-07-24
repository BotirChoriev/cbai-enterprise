/**
 * Canonical action / navigation contracts (Stage 1).
 * Re-exports existing VoiceActionLevel — registry in lib/platform-actions remains source of truth.
 * No executor behavior changes.
 */

import type { VoiceActionLevel } from "@/lib/voice-operator/identity/action-levels";
import {
  classifyVoiceActionLevel,
  levelMayExecuteImmediately,
  levelRequiresConfirmation,
} from "@/lib/voice-operator/identity/action-levels";

/** Formal ActionLevel 0–3 (alias of existing VoiceActionLevel). */
export type CanonicalActionLevel = VoiceActionLevel;

export const ACTION_LEVEL_MEANING = {
  0: "answer_explain — no confirmation",
  1: "navigate_filter_select — may execute directly",
  2: "create_edit_draft — confirmation before persistence",
  3: "publish_share_invite_delete — explicit confirmation with summary",
} as const satisfies Record<CanonicalActionLevel, string>;

export {
  classifyVoiceActionLevel as classifyCanonicalActionLevel,
  levelMayExecuteImmediately,
  levelRequiresConfirmation,
};

export type { VoiceActionLevel };

/** Navigation must use allowlisted internal hrefs only (enforced in platform-actions). */
export const NAVIGATION_CONTRACT = {
  rejectArbitraryModelUrls: true,
  allowlistedInternalRoutesOnly: true,
  announceAfterSuccessfulRouteChange: true,
  sessionSurvivesInternalNavigation: true,
} as const;
