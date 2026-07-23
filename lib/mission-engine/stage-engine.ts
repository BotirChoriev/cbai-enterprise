/**
 * Pure stage / completion / decision gates for the Phase 5 mission engine.
 */

import type {
  MissionCompletionGateResult,
  MissionEngineRuntime,
  MissionEngineStage,
  MissionStageTransitionResult,
} from "@/lib/mission-engine/types";
import { MISSION_ENGINE_STAGES } from "@/lib/mission-engine/types";

export function isMissionEngineStage(value: unknown): value is MissionEngineStage {
  return typeof value === "string" && (MISSION_ENGINE_STAGES as readonly string[]).includes(value);
}

export function stageIndex(stage: MissionEngineStage): number {
  return MISSION_ENGINE_STAGES.indexOf(stage);
}

export function requiredEvidenceIncomplete(runtime: MissionEngineRuntime): boolean {
  return runtime.evidenceRequirements.some((req) => req.required && !req.satisfied);
}

export function requiredHumanReviewsIncomplete(runtime: MissionEngineRuntime): boolean {
  return runtime.humanReviewCheckpoints.some((cp) => cp.required && !cp.approvedAt);
}

/**
 * Completion is blocked when required evidence is incomplete — honest gate.
 */
export function canCompleteMissionEngine(runtime: MissionEngineRuntime): MissionCompletionGateResult {
  if (requiredEvidenceIncomplete(runtime)) {
    return {
      ok: false,
      reason: "Completion blocked: required evidence is incomplete.",
    };
  }
  if (requiredHumanReviewsIncomplete(runtime)) {
    return {
      ok: false,
      reason: "Completion blocked: required human review checkpoints are incomplete.",
    };
  }
  if (!runtime.decision?.approvedByHuman) {
    return {
      ok: false,
      reason: "Completion blocked: final decision requires human approval.",
    };
  }
  return { ok: true };
}

export function canRecordFinalDecision(
  runtime: MissionEngineRuntime,
  approvedByHuman: boolean,
): MissionCompletionGateResult {
  if (!approvedByHuman) {
    return {
      ok: false,
      reason: "Final decision requires human approval flag to be true.",
    };
  }
  if (requiredEvidenceIncomplete(runtime)) {
    return {
      ok: false,
      reason: "Cannot record final decision while required evidence is incomplete.",
    };
  }
  return { ok: true };
}

export function canTransitionMissionStage(
  runtime: MissionEngineRuntime,
  toStage: MissionEngineStage,
): MissionCompletionGateResult {
  if (runtime.stage === toStage) {
    return { ok: false, reason: "Already at that stage." };
  }

  if (toStage === "complete") {
    return canCompleteMissionEngine(runtime);
  }

  // Moving into review/complete from earlier stages still allows forward progress,
  // but verify → later stages warn if evidence incomplete (soft for non-complete).
  if (
    stageIndex(toStage) > stageIndex("verify") &&
    requiredEvidenceIncomplete(runtime) &&
    toStage !== "collect" &&
    toStage !== "verify"
  ) {
    // Allow analyze/compare/scenario/review with incomplete evidence, but not complete.
    // Honest: do not block mid-pipeline exploration — only completion.
  }

  return { ok: true };
}

export function applyMissionStageTransition(
  runtime: MissionEngineRuntime,
  toStage: MissionEngineStage,
  changedBy: string,
  note?: string | null,
): MissionStageTransitionResult {
  const gate = canTransitionMissionStage(runtime, toStage);
  if (!gate.ok) return gate;

  const now = new Date().toISOString();
  const auditId = `audit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  return {
    ok: true,
    runtime: {
      ...runtime,
      stage: toStage,
      updatedAt: now,
      stageAudit: [
        ...runtime.stageAudit,
        {
          id: auditId,
          fromStage: runtime.stage,
          toStage,
          changedBy: changedBy.trim() || "local-user",
          changedAt: now,
          note: note ?? null,
        },
      ],
    },
  };
}

export function missionEngineStageLabel(stage: MissionEngineStage): string {
  switch (stage) {
    case "define":
      return "Define";
    case "collect":
      return "Collect";
    case "verify":
      return "Verify";
    case "analyze":
      return "Analyze";
    case "compare":
      return "Compare";
    case "scenario":
      return "Scenario";
    case "review":
      return "Review";
    case "complete":
      return "Complete";
    default: {
      const _exhaustive: never = stage;
      return _exhaustive;
    }
  }
}
