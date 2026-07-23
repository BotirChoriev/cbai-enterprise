/**
 * Proactive Digital Assistant suggestions — registry honesty only, never invented evidence.
 */

import { buildGlobalStatus } from "@/lib/enterprise/global-status";
import { getCurrentMission } from "@/lib/intelligence-os/mission-engine";
import { myWorkHrefForMission } from "@/lib/intelligence-os/mission-operating-context";
import { getMissionNextAction } from "@/lib/intelligence-os/mission-lifecycle";
import type { AssistantOsContext } from "@/lib/voice-operator/os/session-context";

export type OsSuggestion = {
  readonly id: string;
  readonly prompt: string;
  readonly actionLabel: string;
  readonly href: string;
  readonly command?: string;
};

export function buildProactiveSuggestions(os: AssistantOsContext): readonly OsSuggestion[] {
  const suggestions: OsSuggestion[] = [];
  const status = buildGlobalStatus();
  const mission = getCurrentMission();

  if (status.missingSources > 0) {
    suggestions.push({
      id: "review-missing-sources",
      prompt: `This catalog has ${status.missingSources} missing official sources (${status.connectedSources} connected).`,
      actionLabel: "Review missing sources",
      href: "/trust",
      command: "Show official sources",
    });
  }

  if (status.coveragePercent !== null && status.coveragePercent < 40) {
    suggestions.push({
      id: "evidence-report",
      prompt: `Evidence coverage is ${status.coveragePercent}% (${status.coverageBasis}). An evidence report can list gaps honestly.`,
      actionLabel: "Open evidence report",
      href: "/reports",
      command: "Generate evidence summary",
    });
  }

  if (mission) {
    const next = getMissionNextAction(mission);
    suggestions.push({
      id: "continue-mission",
      prompt: next
        ? `Mission “${mission.problem.slice(0, 72)}” has a next step awaiting review.`
        : `Mission “${mission.problem.slice(0, 72)}” is active and may need continuation.`,
      actionLabel: "Continue mission",
      href: myWorkHrefForMission(mission),
      command: "Continue my last mission",
    });
  } else if (os.countryName || os.companyName || os.universityName) {
    suggestions.push({
      id: "start-mission-from-context",
      prompt: `You are focused on ${os.summary}. Structure this as Mission work?`,
      actionLabel: "Start mission",
      href: "/?create=1",
      command: "Start a mission",
    });
  }

  if (os.countryName) {
    suggestions.push({
      id: "country-companies",
      prompt: `Explore companies linked to ${os.countryName}?`,
      actionLabel: "Open companies",
      href: "/companies",
      command: "Open Companies",
    });
  }

  return suggestions.slice(0, 3);
}
