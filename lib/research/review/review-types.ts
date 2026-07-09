export type ResearchReviewStatus =
  | "draft"
  | "pending_review"
  | "in_review"
  | "completed"
  | "archived";

export type ResearchReviewDecision =
  | "approved"
  | "rejected"
  | "needs_revision"
  | "deferred";

export type ReviewPriority = "low" | "medium" | "high" | "critical";

export type ReviewRecommendation =
  | "proceed"
  | "proceed_with_changes"
  | "hold"
  | "escalate";

export type ResearchReviewVisibility =
  | "private"
  | "team"
  | "organization"
  | "public";

export type ResearchReviewKind =
  | "methodology_review"
  | "evidence_review"
  | "ethics_review"
  | "peer_review";
