export const OPEN_QUESTION_CATEGORIES = [
  "Unknown mechanism",
  "Replication needed",
  "Missing dataset",
  "Clinical validation",
  "Field validation",
  "Method comparison",
  "Safety verification",
  "Policy implications",
] as const;

export type OpenQuestionCategory = (typeof OPEN_QUESTION_CATEGORIES)[number];

export type OpenQuestionStatus = "not_connected_yet" | "future_workspace";

export type OpenResearchQuestion = {
  questionId: string;
  relatedTopicIds: readonly string[];
  questionCategory: OpenQuestionCategory;
  futureEvidenceSources: readonly string[];
  humanReviewRequired: boolean;
  status: OpenQuestionStatus;
};

export const OPEN_QUESTION_STATUS_LABELS: Record<OpenQuestionStatus, string> = {
  not_connected_yet: "Not connected yet",
  future_workspace: "Future workspace",
};

export const OPEN_QUESTION_CATEGORY_DESCRIPTIONS: Record<OpenQuestionCategory, string> = {
  "Unknown mechanism":
    "Mechanisms not yet established will require future evidence before any claim is supported.",
  "Replication needed":
    "Findings that need independent replication will be tracked when study records connect.",
  "Missing dataset":
    "Evidence gaps from unavailable datasets will be documented without inventing data.",
  "Clinical validation":
    "Clinical questions will await official study records and human scientific review.",
  "Field validation":
    "Field evidence requirements will be tracked when observational sources connect.",
  "Method comparison":
    "Open method comparisons will be structured without recommending a preferred approach.",
  "Safety verification":
    "Safety-related open areas will require verified sources and human review.",
  "Policy implications":
    "Policy-relevant open questions will link to official guidance when sources connect.",
};

export const OPEN_QUESTION_MODEL_VERSION = "1.0.0";

export const OPEN_QUESTIONS_NOT_CONNECTED_MESSAGE =
  "Open research questions are not connected yet — no live question records exist for this topic.";
