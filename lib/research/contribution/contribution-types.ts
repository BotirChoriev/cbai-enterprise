export type ContributionType =
  | "publication"
  | "experiment"
  | "dataset"
  | "method"
  | "negative_result"
  | "open_question"
  | "patent"
  | "technology";

export type ContributionWorkflowStage =
  | "choose_topic"
  | "choose_contribution_type"
  | "describe_contribution"
  | "evidence_requirements"
  | "human_scientific_review"
  | "knowledge_network_integration";

export type ContributionStatus =
  | "catalog_defined"
  | "evidence_incomplete"
  | "metadata_incomplete"
  | "verification_required"
  | "human_review_required"
  | "integration_ready";
