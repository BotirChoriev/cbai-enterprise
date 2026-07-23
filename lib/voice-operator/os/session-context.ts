/**
 * Session context memory for the Digital Assistant OS layer.
 * Syncs platform selection into existing voice session memory — no parallel store.
 */

import { getCurrentMission } from "@/lib/intelligence-os/mission-engine";
import { getPrimaryEntity, type PlatformContextSnapshot } from "@/lib/context";
import { patchVoiceSessionMemory, readVoiceSessionMemory } from "@/lib/voice-operator/session-memory";

export type AssistantOsContext = {
  readonly countryName: string | null;
  readonly companyName: string | null;
  readonly universityName: string | null;
  readonly missionProblem: string | null;
  readonly researchTopicId: string | null;
  readonly pathname: string;
  readonly summary: string;
};

export function buildAssistantOsContext(
  platform: PlatformContextSnapshot | null,
  pathname: string,
): AssistantOsContext {
  const mission = getCurrentMission();
  const primary = platform ? getPrimaryEntity(platform) : null;
  const topicMatch = /^\/research\/([^/]+)/.exec(pathname);
  const researchTopicId = topicMatch?.[1] ?? null;

  const countryName =
    platform?.country?.name ?? (primary?.kind === "country" ? primary.name : null);
  const companyName =
    platform?.company?.name ?? (primary?.kind === "company" ? primary.name : null);
  const universityName =
    platform?.university?.name ?? (primary?.kind === "university" ? primary.name : null);

  const parts: string[] = [];
  if (countryName) parts.push(`Country: ${countryName}`);
  if (companyName) parts.push(`Company: ${companyName}`);
  if (universityName) parts.push(`University: ${universityName}`);
  if (mission) parts.push(`Mission: ${mission.problem.slice(0, 80)}`);
  if (researchTopicId) parts.push(`Research topic: ${researchTopicId}`);
  if (pathname.startsWith("/reports")) parts.push("Module: Reports");
  if (pathname.startsWith("/knowledge") || pathname.startsWith("/evidence")) {
    parts.push("Module: Evidence");
  }
  if (pathname.startsWith("/trust")) parts.push("Module: Trust");

  return {
    countryName,
    companyName,
    universityName,
    missionProblem: mission?.problem ?? null,
    researchTopicId,
    pathname,
    summary: parts.length > 0 ? parts.join(" · ") : "No entity selected yet",
  };
}

/** Persist OS context into the existing Voice Operator session memory. */
export function syncAssistantOsContext(
  platform: PlatformContextSnapshot | null,
  pathname: string,
): AssistantOsContext {
  const os = buildAssistantOsContext(platform, pathname);
  if (readVoiceSessionMemory()) {
    patchVoiceSessionMemory({ activeContextSummary: os.summary });
  }
  return os;
}
