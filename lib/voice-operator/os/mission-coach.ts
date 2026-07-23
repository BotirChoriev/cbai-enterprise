/**
 * Mission coach — step-by-step guidance using existing mission lifecycle.
 */

import { getCurrentMission } from "@/lib/intelligence-os/mission-engine";
import { myWorkHrefForMission } from "@/lib/intelligence-os/mission-operating-context";
import { getMissionNextAction, deriveMissionLifecycle } from "@/lib/intelligence-os/mission-lifecycle";

export type MissionCoachResult = {
  readonly assistantText: string;
  readonly href: string;
};

const COACH_INTENT =
  /\b(mission coach|coach me|guide me|step by step|what('?s| is) (my )?next (mission )?step|mission steps?|walk me through|human approval)\b/i;

const COACH_STEPS = [
  "Understand the problem",
  "Collect evidence",
  "Review official sources",
  "Generate report",
  "Review confidence",
  "Human approval",
] as const;

export function detectMissionCoachIntent(raw: string): MissionCoachResult | null {
  if (!COACH_INTENT.test(raw)) return null;

  const mission = getCurrentMission();
  if (!mission) {
    return {
      href: "/?create=1",
      assistantText: [
        "Mission coach — six steps: Understand the problem → Collect evidence → Review official sources → Generate report → Review confidence → Human approval.",
        "No active mission yet. Opening Mission creation so we can start with the problem.",
      ].join(" "),
    };
  }

  const lifecycle = deriveMissionLifecycle(mission);
  const next = getMissionNextAction(mission);
  const stepList = COACH_STEPS.map((step, index) => `${index + 1}. ${step}`).join(" · ");
  const activeLabel =
    next?.label ?? lifecycle.find((s) => s.status === "partial" || s.status === "missing")?.label ?? "Continue work";

  return {
    href: myWorkHrefForMission(mission),
    assistantText: [
      `Mission coach for “${mission.problem.slice(0, 100)}”.`,
      `Path: ${stepList}.`,
      `Suggested next stage: ${activeLabel}. Continue in My Work — I advise only; human approval remains required.`,
    ].join(" "),
  };
}
