export const TIMELINE_STAGE_IDS = [
  "research_topic",
  "current_knowledge",
  "methods",
  "evidence",
  "open_questions",
  "future_evidence",
  "research_workspace",
] as const;

export type TimelineStageId = (typeof TIMELINE_STAGE_IDS)[number];

export type TimelineStageStatus = "catalog_available" | "future_workspace" | "not_connected_yet";

export type TimelineOverallStatus = TimelineStageStatus;

export type KnowledgeTimelineStage = {
  stageId: TimelineStageId;
  stageNumber: number;
  title: string;
  purpose: string;
  description: string;
  explanation: string;
  status: TimelineStageStatus;
};

export type KnowledgeTimeline = {
  timelineId: string;
  topicId: string;
  stages: readonly KnowledgeTimelineStage[];
  status: TimelineOverallStatus;
  humanReviewRequired: boolean;
  version: string;
};

export const TIMELINE_STAGE_STATUS_LABELS: Record<TimelineStageStatus, string> = {
  catalog_available: "Available today",
  future_workspace: "Future workspace",
  not_connected_yet: "Not connected yet",
};

export const TIMELINE_STAGE_DEFINITIONS: Record<
  TimelineStageId,
  { title: string; purpose: string }
> = {
  research_topic: {
    title: "Research Topic",
    purpose: "Define the scientific subject.",
  },
  current_knowledge: {
    title: "Current Knowledge",
    purpose: "Review available catalog information.",
  },
  methods: {
    title: "Methods",
    purpose: "Understand research methods.",
  },
  evidence: {
    title: "Evidence",
    purpose: "Review evidence types.",
  },
  open_questions: {
    title: "Open Questions",
    purpose: "Identify unanswered questions.",
  },
  future_evidence: {
    title: "Future Evidence",
    purpose: "Future publications, experiments, datasets, laboratories.",
  },
  research_workspace: {
    title: "Research Workspace",
    purpose: "Future collaboration space.",
  },
};

export const TIMELINE_VERSION = "1.0.0";

export const TIMELINE_WORKFLOW_NOTICE =
  "This timeline represents the research workflow inside CBAI. It is not a historical record.";

export const TIMELINE_HUMAN_REVIEW_NOTICE =
  "Human scientific review is required before any workflow stage supports a decision.";
