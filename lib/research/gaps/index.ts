export {
  RESEARCH_GAP_TYPES,
  RESEARCH_GAP_MODEL_VERSION,
  RESEARCH_GAP_TYPE_LABELS,
  RESEARCH_GAP_STATUS_LABELS,
  RESEARCH_GAP_HONEST_NOTICE,
  RESEARCH_GAP_HUMAN_REVIEW_NOTICE,
  WORKSPACE_GAP_TYPES,
  TOPIC_GAP_PRIORITY,
  type ResearchGapType,
  type ResearchGapStatus,
  type ResearchGap,
  type ResearchGapSummaryData,
  type ResearchGapContext,
} from "@/lib/research/gaps/research-gap-types";

export {
  buildResearchGapsForTopic,
  buildResearchGapContext,
  selectTopicDetailGaps,
  listTopicMissingAreas,
} from "@/lib/research/gaps/research-gap-builder";

export {
  getResearchGapContextForTopic,
  getResearchGapContext,
  getResearchGapsForTopic,
  getResearchGapsByType,
  getTopicDetailResearchGaps,
  getWorkspaceResearchGaps,
  findResearchGapByType,
} from "@/lib/research/gaps/research-gap-query";

export {
  validateResearchGaps,
  type ResearchGapValidationIssue,
  type ResearchGapValidationReport,
} from "@/lib/research/gaps/research-gap-validation";
