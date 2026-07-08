export const NOTEBOOK_SUMMARY_SECTION_IDS = [
  "topic_overview",
  "available_catalog_information",
  "methods_to_review",
  "evidence_types_to_connect",
  "open_question_categories",
  "negative_results_purpose",
  "future_workspace_support",
  "human_scientific_review",
] as const;

export type NotebookSummarySectionId = (typeof NOTEBOOK_SUMMARY_SECTION_IDS)[number];

export type NotebookStatus =
  | "catalog_notebook_available"
  | "live_evidence_not_connected"
  | "ai_generation_not_active";

export type NotebookSummarySection = {
  sectionId: NotebookSummarySectionId;
  title: string;
  content: string;
  items: readonly string[];
};

export type NotebookGraphConnection = {
  label: string;
  connectionType: string;
  status: string;
};

export type ResearchNotebook = {
  notebookId: string;
  topicId: string;
  topicName: string;
  domain: string;
  summarySections: readonly NotebookSummarySection[];
  evidenceFocus: readonly string[];
  openQuestionCategories: readonly string[];
  negativeResultPurpose: readonly string[];
  graphConnections: readonly NotebookGraphConnection[];
  limitations: readonly string[];
  futureWorkspaceSupport: readonly string[];
  humanReviewRequired: boolean;
  status: NotebookStatus;
  version: string;
};

export const NOTEBOOK_STATUS_LABELS: Record<NotebookStatus, string> = {
  catalog_notebook_available: "Catalog notebook available",
  live_evidence_not_connected: "Live evidence not connected",
  ai_generation_not_active: "AI generation not active",
};

export const NOTEBOOK_VERSION = "1.0.0";

export const NOTEBOOK_CATALOG_ONLY_NOTICE =
  "This notebook is built from catalog data only. Live AI generation is not active.";

export const NOTEBOOK_HUMAN_REVIEW_NOTICE =
  "Human scientific review is required before any catalog note supports a decision.";

export const NOTEBOOK_SUMMARY_SECTION_TITLES: Record<NotebookSummarySectionId, string> = {
  topic_overview: "Topic overview",
  available_catalog_information: "Available catalog information",
  methods_to_review: "Methods to review",
  evidence_types_to_connect: "Evidence types to connect",
  open_question_categories: "Open question categories",
  negative_results_purpose: "Negative results purpose",
  future_workspace_support: "Future workspace support",
  human_scientific_review: "Human scientific review",
};
