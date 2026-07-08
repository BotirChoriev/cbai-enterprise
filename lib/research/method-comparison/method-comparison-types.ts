export const METHOD_COMPARISON_STATUSES = [
  "catalog_available",
  "evidence_not_connected",
  "human_review_required",
] as const;

export type MethodComparisonStatus = (typeof METHOD_COMPARISON_STATUSES)[number];

export type MethodEvidenceRow = {
  methodName: string;
  relatedEvidenceTypes: readonly string[];
  availableCatalogInfo: readonly string[];
  missingEvidence: readonly string[];
  status: MethodComparisonStatus;
};

export type MethodEvidenceMatrixCell = {
  methodName: string;
  evidenceType: string;
  catalogListed: boolean;
  status: MethodComparisonStatus;
};

export type MethodComparison = {
  comparisonId: string;
  topicId: string;
  methods: readonly string[];
  evidenceTypes: readonly string[];
  methodEvidenceRows: readonly MethodEvidenceRow[];
  status: MethodComparisonStatus;
  limitations: readonly string[];
  humanReviewRequired: boolean;
  version: string;
};

export const METHOD_COMPARISON_MODEL_VERSION = "1.0.0";

export const METHOD_COMPARISON_STATUS_LABELS: Record<MethodComparisonStatus, string> = {
  catalog_available: "Catalog available",
  evidence_not_connected: "Evidence not connected",
  human_review_required: "Human review required",
};

export const METHOD_COMPARISON_HONEST_NOTICE =
  "This comparison uses catalog information only. It does not rank methods or prove outcomes.";

export const METHOD_COMPARISON_HUMAN_REVIEW_NOTICE =
  "Human scientific review is required before any method comparison supports a decision.";

export const METHOD_COMPARISON_LIMITATIONS = [
  "Method names come from the topic catalog — not live study records.",
  "Evidence type associations are topic-level catalog metadata, not method-specific outcomes.",
  "No experiment results, success rates, or rankings are included.",
  "Live publications, experiments, and datasets are not connected yet.",
] as const;

export const WORKSPACE_METHOD_PREVIEW_LIMIT = 5;

export const WORKSPACE_METHOD_PREVIEW_MIN = 3;
