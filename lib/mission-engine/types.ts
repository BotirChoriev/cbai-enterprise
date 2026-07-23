/**
 * Phase 5 — Mission engine stage runtime (additive to Mission OS).
 * Links to existing Mission by missionId; does not replace MissionStatus.
 */

export type MissionEngineStage =
  | "define"
  | "collect"
  | "verify"
  | "analyze"
  | "compare"
  | "scenario"
  | "review"
  | "complete";

export const MISSION_ENGINE_STAGES: readonly MissionEngineStage[] = [
  "define",
  "collect",
  "verify",
  "analyze",
  "compare",
  "scenario",
  "review",
  "complete",
] as const;

export type MissionTaskStatus = "pending" | "in_progress" | "done" | "blocked";

export type MissionEngineTask = {
  readonly id: string;
  readonly title: string;
  readonly assigneeId: string | null;
  readonly status: MissionTaskStatus;
  readonly createdAt: string;
};

export type MissionEvidenceRequirement = {
  readonly id: string;
  readonly description: string;
  readonly evidenceId: string | null;
  readonly required: boolean;
  readonly satisfied: boolean;
};

export type MissionHumanReviewCheckpoint = {
  readonly id: string;
  readonly label: string;
  readonly required: boolean;
  readonly approvedBy: string | null;
  readonly approvedAt: string | null;
  readonly notes: string | null;
};

export type MissionDecisionRecord = {
  readonly summary: string;
  readonly approvedByHuman: boolean;
  readonly approvedBy: string | null;
  readonly approvedAt: string | null;
  readonly notes: string | null;
};

export type MissionStageAuditEntry = {
  readonly id: string;
  readonly fromStage: MissionEngineStage | null;
  readonly toStage: MissionEngineStage;
  readonly changedBy: string;
  readonly changedAt: string;
  readonly note: string | null;
};

export type MissionEngineRuntime = {
  readonly missionId: string;
  readonly stage: MissionEngineStage;
  readonly tasks: readonly MissionEngineTask[];
  readonly assignees: readonly string[];
  readonly evidenceRequirements: readonly MissionEvidenceRequirement[];
  readonly humanReviewCheckpoints: readonly MissionHumanReviewCheckpoint[];
  readonly decision: MissionDecisionRecord | null;
  readonly stageAudit: readonly MissionStageAuditEntry[];
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type MissionStageTransitionResult =
  | { readonly ok: true; readonly runtime: MissionEngineRuntime }
  | { readonly ok: false; readonly reason: string };

export type MissionCompletionGateResult =
  | { readonly ok: true }
  | { readonly ok: false; readonly reason: string };
