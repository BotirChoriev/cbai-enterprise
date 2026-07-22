/**
 * Voice command policy — risk gates and confirmation boundaries.
 */

import type { PlatformActionId } from "@/lib/platform-actions/types";
import { getVoiceCommandEntry } from "@/lib/voice-operator/commands/voice-command-registry";
import type { VoiceCommandRisk } from "@/lib/voice-operator/commands/voice-command-types";

const CONFIRMATION_REQUIRED = new Set<PlatformActionId>([
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
  "engine.research.confirm",
  "engine.evidence.confirm",
  "engine.country.confirm",
  "engine.organization.confirm",
  "engine.mission.confirm",
  "engine.governance.confirm",
  "engine.meeting.confirm",
]);

/** Profile identity / profession must never be silently persisted. */
export function mayPersistProfileIdentity(): boolean {
  return false;
}

export function riskForAction(actionId: PlatformActionId | null): VoiceCommandRisk {
  if (!actionId) return "blocked";
  if (CONFIRMATION_REQUIRED.has(actionId)) return "needs_confirmation";
  const entry = getVoiceCommandEntry(actionId);
  return entry?.risk ?? "blocked";
}

export function requiresConfirmation(actionId: PlatformActionId | null): boolean {
  return riskForAction(actionId) === "needs_confirmation";
}

export function isSafeReversible(actionId: PlatformActionId | null): boolean {
  return riskForAction(actionId) === "safe_reversible";
}

/** Reject model-provided arbitrary URLs — only allowlisted platform hrefs. */
export function rejectArbitraryModelUrl(href: string | null | undefined): boolean {
  if (!href) return true;
  if (!href.startsWith("/")) return true;
  if (/javascript:/i.test(href)) return true;
  if (/^https?:/i.test(href)) return true;
  return false;
}
