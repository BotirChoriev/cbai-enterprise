export type NegativeResultStatus = "not_connected_yet" | "future_workspace";

export type NegativeResultReadiness = {
  negativeResultId: string;
  relatedTopicIds: readonly string[];
  futureExperimentTypes: readonly string[];
  futureEvidenceSources: readonly string[];
  humanReviewRequired: boolean;
  status: NegativeResultStatus;
};

export const NEGATIVE_RESULT_STATUS_LABELS: Record<NegativeResultStatus, string> = {
  not_connected_yet: "Not connected yet",
  future_workspace: "Future workspace",
};

export const NEGATIVE_RESULT_PRESERVATION_PURPOSE = [
  "Unsuccessful approaches preserved for honest evidence review",
  "Failed replications documented without overstating conclusions",
  "Abandoned methods tracked to reduce duplicated effort",
  "Conflicting evidence surfaced for human scientific review",
] as const;

export const NEGATIVE_RESULT_MODEL_VERSION = "1.0.0";

export const NEGATIVE_RESULTS_NOT_CONNECTED_MESSAGE =
  "Negative result records are not connected yet — no live study outcomes exist for this topic.";
