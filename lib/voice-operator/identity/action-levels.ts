/**
 * Voice Operating Navigator — safe action levels 0–3.
 */

import type { PlatformActionId } from "@/lib/platform-actions/types";
import { riskForAction } from "@/lib/voice-operator/commands/voice-command-policy";

export type VoiceActionLevel = 0 | 1 | 2 | 3;

const LEVEL_3 = new Set<string>([
  "delete",
  "share",
  "publish",
  "send",
  "overwrite",
]);

const LEVEL_2_ACTIONS = new Set<PlatformActionId>([
  "operational_object.compose",
  "operational_object.confirm_create",
  "project.compose",
  "mission.compose",
  "report.compose",
  "evidence_request.compose",
  "scientific_intake.compose",
  "team.compose",
  "team.invite",
  "object.share",
  "publication.prepare",
  "engine.research.start",
  "engine.evidence.start",
  "engine.country.start",
  "engine.organization.start",
  "engine.mission.start",
  "engine.governance.start",
  "engine.meeting.start",
]);

export function classifyVoiceActionLevel(
  actionId: PlatformActionId | null,
  transcript = "",
): VoiceActionLevel {
  const lower = transcript.toLowerCase();
  if (LEVEL_3.has(lower) || /(o'chir|delete|share|ulash|публик|sil|gönder)/i.test(transcript)) {
    return 3;
  }
  if (actionId && LEVEL_2_ACTIONS.has(actionId)) return 2;
  if (actionId && riskForAction(actionId) === "needs_confirmation") return 2;
  if (actionId && (actionId.startsWith("navigate.") || actionId.startsWith("entity.") || actionId === "research.open_topic")) {
    return 1;
  }
  if (!actionId) return 0;
  return 1;
}

export function levelRequiresConfirmation(level: VoiceActionLevel): boolean {
  return level >= 2;
}

export function levelMayExecuteImmediately(level: VoiceActionLevel): boolean {
  return level <= 1;
}
