export const RESEARCH_GAP_TYPES = [
  "publication_gap",
  "experiment_gap",
  "dataset_gap",
  "laboratory_gap",
  "researcher_gap",
  "method_gap",
  "replication_gap",
  "negative_result_gap",
  "open_question_gap",
] as const;

export type ResearchGapType = (typeof RESEARCH_GAP_TYPES)[number];

export type ResearchGapStatus = "available_catalog_only" | "not_connected_yet" | "future_workspace";

export type ResearchGap = {
  gapId: string;
  topicId: string;
  gapType: ResearchGapType;
  currentStatus: ResearchGapStatus;
  missingReason: string;
  futureEvidenceNeeded: readonly string[];
  relatedWorkspaceArea: string;
  humanReviewRequired: boolean;
  version: string;
};

export type ResearchGapSummaryData = {
  topicId: string;
  totalGaps: number;
  catalogOnlyCount: number;
  notConnectedCount: number;
  futureWorkspaceCount: number;
  catalogAvailable: readonly string[];
  humanReviewRequired: boolean;
};

export type ResearchGapContext = {
  topicId: string;
  gaps: readonly ResearchGap[];
  summary: ResearchGapSummaryData;
};

export const RESEARCH_GAP_MODEL_VERSION = "1.0.0";

export const RESEARCH_GAP_TYPE_LABELS: Record<ResearchGapType, string> = {
  publication_gap: "Publication gap",
  experiment_gap: "Experiment gap",
  dataset_gap: "Dataset gap",
  laboratory_gap: "Laboratory gap",
  researcher_gap: "Researcher gap",
  method_gap: "Method gap",
  replication_gap: "Replication gap",
  negative_result_gap: "Negative result gap",
  open_question_gap: "Open question gap",
};

export const RESEARCH_GAP_STATUS_LABELS: Record<ResearchGapStatus, string> = {
  available_catalog_only: "Available catalog only",
  not_connected_yet: "Not connected yet",
  future_workspace: "Future workspace",
};

export const RESEARCH_GAP_HONEST_NOTICE =
  "These gaps reflect connected catalog status only. They do not judge scientific quality.";

export const RESEARCH_GAP_HUMAN_REVIEW_NOTICE =
  "Human scientific review is required before any future evidence supports a decision.";

export const WORKSPACE_GAP_TYPES: readonly ResearchGapType[] = [
  "publication_gap",
  "experiment_gap",
  "dataset_gap",
  "researcher_gap",
  "replication_gap",
];

export const TOPIC_GAP_PRIORITY: readonly ResearchGapType[] = [
  "publication_gap",
  "experiment_gap",
  "dataset_gap",
  "laboratory_gap",
  "researcher_gap",
  "method_gap",
  "replication_gap",
  "open_question_gap",
  "negative_result_gap",
];
