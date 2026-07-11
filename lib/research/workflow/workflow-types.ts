// Mirrors the exact discipline already established by ResearchReadinessState (5 values) and
// ResearchHealthState (4 values): only the stages the current 3-value ResearchTopicStatus
// model can honestly drive, plus one reserved future stage and one defensive "unknown".
// No "review_in_progress" / "findings_required" / "validation_required" / "decision_required"
// stages are included — nothing in the current data model can distinguish between them, and
// inventing that granularity would be inventing unsupported research states.
export type WorkflowStage =
  | "evidence_connection_required"
  | "evidence_ready_for_review"
  | "review_required"
  | "monitoring_required"
  | "unknown";

export const WORKFLOW_STAGE_LABELS: Record<WorkflowStage, string> = {
  evidence_connection_required: "Evidence Connection Required",
  evidence_ready_for_review: "Evidence Ready For Review",
  review_required: "Review Required",
  monitoring_required: "Monitoring Required",
  unknown: "Unknown",
};

// Only actions with a real, honestly-linkable route or an honest non-interactive requirement
// are included. "record_findings", "resolve_blocking_gap", and "review_decision" from the
// mission's example list are deliberately omitted — no route, workspace, or field in the
// current data model supports them today, even in reserved form.
export type WorkflowNextAction =
  | "connect_evidence"
  | "open_evidence_review"
  | "continue_review"
  | "monitor_for_new_evidence"
  | "no_valid_action"
  | "unknown";

export const WORKFLOW_NEXT_ACTION_LABELS: Record<WorkflowNextAction, string> = {
  connect_evidence: "Connect Evidence",
  open_evidence_review: "Open Evidence Review",
  continue_review: "Continue Review",
  monitor_for_new_evidence: "Monitor For New Evidence",
  no_valid_action: "No Valid Action",
  unknown: "Unknown",
};
