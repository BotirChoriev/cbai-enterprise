import type { MissionLifecycleStage } from "@/lib/intelligence-os/mission-lifecycle";

export type CbaiCycleStageId =
  | "sense"
  | "structure"
  | "compare"
  | "human_decide"
  | "act"
  | "verify"
  | "learn";

export type CbaiCycleStageStatus =
  | "complete"
  | "active"
  | "blocked"
  | "locked";

export type CbaiCycleStage = {
  readonly id: CbaiCycleStageId;
  readonly status: CbaiCycleStageStatus;
  readonly href: string;
  readonly blocker: string | null;
  readonly humanCheckpoint: boolean;
};

export type CbaiGuideCycle = {
  readonly stages: readonly CbaiCycleStage[];
  readonly activeIndex: number;
  readonly completedCount: number;
  readonly unknownCount: number;
  readonly nextBlocker: string | null;
};

function findStage(
  lifecycle: readonly MissionLifecycleStage[],
  stage: MissionLifecycleStage["stage"],
): MissionLifecycleStage | null {
  return lifecycle.find((item) => item.stage === stage) ?? null;
}

function isComplete(stage: MissionLifecycleStage | null): boolean {
  return stage?.status === "complete";
}

function isStarted(stage: MissionLifecycleStage | null): boolean {
  return stage?.status === "complete" || stage?.status === "partial";
}

/**
 * Projects the existing, persisted Mission OS state into CBAI's canonical
 * cybernetic loop. It never invents completion: stages without a persisted
 * artifact remain blocked or locked until a human creates and confirms them.
 */
export function deriveCbaiGuideCycle(
  lifecycle: readonly MissionLifecycleStage[],
  confirmedDecisionCount = 0,
): CbaiGuideCycle {
  const mission = findStage(lifecycle, "mission");
  const question = findStage(lifecycle, "question");
  const evidence = findStage(lifecycle, "evidence");
  const reasoning = findStage(lifecycle, "reasoning");
  const impact = findStage(lifecycle, "impact");
  const report = findStage(lifecycle, "report");

  const senseComplete = isComplete(mission) && isStarted(question);
  const structureComplete = senseComplete && isComplete(evidence);
  const compareComplete = structureComplete && isComplete(reasoning);
  // Impact review and report readiness are prerequisites, not a human decision.
  // The current Mission OS has no persisted mission-linked decision record yet,
  // so the guide must stop here instead of inferring consent from adjacent data.
  const humanDecisionComplete =
    compareComplete && isComplete(impact) && confirmedDecisionCount > 0;
  const actComplete = false;

  const definitions: readonly Omit<CbaiCycleStage, "status" | "blocker">[] = [
    { id: "sense", href: "/problems", humanCheckpoint: false },
    { id: "structure", href: "/evidence", humanCheckpoint: false },
    { id: "compare", href: "/reasoning", humanCheckpoint: false },
    { id: "human_decide", href: "/reports", humanCheckpoint: true },
    { id: "act", href: "/workspace", humanCheckpoint: true },
    { id: "verify", href: "/trust", humanCheckpoint: true },
    { id: "learn", href: "/governance", humanCheckpoint: true },
  ];

  const complete = [
    senseComplete,
    structureComplete,
    compareComplete,
    humanDecisionComplete,
    actComplete,
    false,
    false,
  ] as const;

  const sourceBlockers = [
    mission?.missing ?? question?.missing ?? null,
    evidence?.missing ?? null,
    reasoning?.missing ?? null,
    impact?.missing ??
      (isComplete(impact)
        ? confirmedDecisionCount > 0
          ? null
          : "No mission-linked human decision record exists."
        : "A human decision has not been confirmed."),
    report?.missing ?? "No confirmed action record exists.",
    "Define a monitoring result before verification can complete.",
    "Record a verified outcome before the system can learn.",
  ] as const;

  const firstIncomplete = complete.findIndex((value) => !value);
  const activeIndex = firstIncomplete >= 0 ? firstIncomplete : complete.length - 1;
  const stages = definitions.map((definition, index): CbaiCycleStage => {
    if (complete[index]) {
      return { ...definition, status: "complete", blocker: null };
    }
    if (index === activeIndex) {
      return {
        ...definition,
        status: sourceBlockers[index] ? "blocked" : "active",
        blocker: sourceBlockers[index],
      };
    }
    return { ...definition, status: "locked", blocker: sourceBlockers[index] };
  });

  return {
    stages,
    activeIndex,
    completedCount: complete.filter(Boolean).length,
    unknownCount: lifecycle.filter((stage) => stage.status !== "complete").length,
    nextBlocker: stages[activeIndex]?.blocker ?? null,
  };
}
