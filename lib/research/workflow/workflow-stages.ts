import type { ResearchReadinessState } from "@/lib/research/intelligence/intelligence-types";
import type { ResearchDecision } from "@/lib/research/intelligence/decision-types";
import type { WorkflowNextAction, WorkflowStage } from "@/lib/research/workflow/workflow-types";

// Deterministic: reuses the Health Engine's pass-through readiness stage — does not re-derive
// from ResearchTopicStatus or raw evidence data directly.
const STAGE_BY_READINESS: Record<ResearchReadinessState, WorkflowStage> = {
  needs_evidence: "evidence_connection_required",
  partially_ready: "evidence_ready_for_review",
  review_required: "review_required",
  ready: "monitoring_required",
  unknown: "unknown",
};

export function deriveWorkflowStage(readinessStage: ResearchReadinessState): WorkflowStage {
  return STAGE_BY_READINESS[readinessStage];
}

// Deterministic: reuses the Decision Engine's output (via the Health Engine) — does not
// re-derive a recommendation independently.
const NEXT_ACTION_BY_DECISION: Record<ResearchDecision, WorkflowNextAction> = {
  connect_missing_evidence_source: "connect_evidence",
  open_evidence_review: "open_evidence_review",
  continue_existing_review: "continue_review",
  no_action_required: "monitor_for_new_evidence",
  unknown: "no_valid_action",
};

export function deriveWorkflowNextAction(decision: ResearchDecision): WorkflowNextAction {
  return NEXT_ACTION_BY_DECISION[decision];
}
