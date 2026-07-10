export type ResearchDecision =
  | "open_evidence_review"
  | "continue_existing_review"
  | "connect_missing_evidence_source"
  | "no_action_required"
  | "unknown";

export const RESEARCH_DECISION_LABELS: Record<ResearchDecision, string> = {
  open_evidence_review: "Open Evidence Review",
  continue_existing_review: "Continue Existing Review",
  connect_missing_evidence_source: "Connect Missing Evidence Source",
  no_action_required: "No Action Required",
  unknown: "Unknown",
};
