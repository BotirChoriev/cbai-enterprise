export type ResearchReadinessState =
  | "ready"
  | "partially_ready"
  | "needs_evidence"
  | "review_required"
  | "unknown";

export const RESEARCH_READINESS_LABELS: Record<ResearchReadinessState, string> = {
  ready: "Ready",
  partially_ready: "Partially Ready",
  needs_evidence: "Needs Evidence",
  review_required: "Review Required",
  unknown: "Unknown",
};

export type ResearchNextAction =
  | "open_evidence_review"
  | "connect_evidence_source"
  | "review_existing_evidence";

export const RESEARCH_NEXT_ACTION_LABELS: Record<ResearchNextAction, string> = {
  open_evidence_review: "Open Evidence Review",
  connect_evidence_source: "Connect Evidence Source",
  review_existing_evidence: "Review Existing Evidence",
};
