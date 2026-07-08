import type { ResearchTopic } from "@/lib/research/research-topics";
import {
  RESEARCH_TOPIC_AVAILABLE_TODAY,
  RESEARCH_TOPIC_NOT_AVAILABLE_YET,
} from "@/lib/research/research-topics";
import {
  getExperimentReadinessForTopic,
  getLaboratoryReadinessForTopic,
  getPublicationReadinessForTopic,
  getResearcherReadinessForTopic,
} from "@/lib/research";
import { getOpenQuestionsForTopic } from "@/lib/research/open-questions/question-query";
import {
  OPEN_QUESTION_CATEGORY_DESCRIPTIONS,
} from "@/lib/research/open-questions/question-types";
import { getNegativeResultsForTopic } from "@/lib/research/negative-results/negative-result-query";
import { NEGATIVE_RESULTS_NOT_CONNECTED_MESSAGE } from "@/lib/research/negative-results/negative-result-types";
import { PUBLICATION_FUTURE_SOURCE_TYPES } from "@/lib/research/publications/publication-types";
import { EXPERIMENT_FUTURE_TYPES } from "@/lib/research/experiments/experiment-types";
import { RESEARCHER_VERIFICATION_SOURCES } from "@/lib/research/researchers/researcher-types";
import type {
  ResearchGap,
  ResearchGapContext,
  ResearchGapStatus,
  ResearchGapSummaryData,
  ResearchGapType,
} from "@/lib/research/gaps/research-gap-types";
import {
  RESEARCH_GAP_MODEL_VERSION,
  TOPIC_GAP_PRIORITY,
} from "@/lib/research/gaps/research-gap-types";

function gapIdFor(topicId: string, gapType: ResearchGapType): string {
  return `gap:${topicId}:${gapType}`;
}

function resolveGapStatus(
  sourceStatus: string,
  hasCatalogCue: boolean,
): ResearchGapStatus {
  if (sourceStatus === "future_integration_required") {
    return "future_workspace";
  }
  if (hasCatalogCue || sourceStatus === "metadata_not_available") {
    return "available_catalog_only";
  }
  return "not_connected_yet";
}

function topicReferencesDatasetEvidence(topic: ResearchTopic): boolean {
  return topic.relatedEvidenceTypes.some((evidence) =>
    evidence.toLowerCase().includes("dataset"),
  );
}

function buildPublicationGap(topic: ResearchTopic): ResearchGap {
  const readiness = getPublicationReadinessForTopic(topic);
  const { layer } = readiness;

  return {
    gapId: gapIdFor(topic.topicId, "publication_gap"),
    topicId: topic.topicId,
    gapType: "publication_gap",
    currentStatus: resolveGapStatus(layer.sourceStatus, readiness.hasPublicationEvidenceType),
    missingReason:
      layer.limitations[0] ??
      "Live publication records are not connected — missing evidence from peer-reviewed sources.",
    futureEvidenceNeeded: layer.supportedSourceTypes.length > 0
      ? layer.supportedSourceTypes
      : PUBLICATION_FUTURE_SOURCE_TYPES,
    relatedWorkspaceArea: "Publications",
    humanReviewRequired: layer.humanReviewRequired,
    version: RESEARCH_GAP_MODEL_VERSION,
  };
}

function buildExperimentGap(topic: ResearchTopic): ResearchGap {
  const readiness = getExperimentReadinessForTopic(topic);
  const { layer } = readiness;

  return {
    gapId: gapIdFor(topic.topicId, "experiment_gap"),
    topicId: topic.topicId,
    gapType: "experiment_gap",
    currentStatus: resolveGapStatus(layer.sourceStatus, readiness.hasExperimentEvidenceType),
    missingReason:
      layer.limitations[0] ??
      "Live experiment records are not connected — missing evidence from structured study data.",
    futureEvidenceNeeded: layer.supportedExperimentTypes.length > 0
      ? layer.supportedExperimentTypes
      : EXPERIMENT_FUTURE_TYPES,
    relatedWorkspaceArea: "Experiments",
    humanReviewRequired: layer.humanReviewRequired,
    version: RESEARCH_GAP_MODEL_VERSION,
  };
}

function buildDatasetGap(topic: ResearchTopic): ResearchGap {
  const hasDatasetCue = topicReferencesDatasetEvidence(topic);

  return {
    gapId: gapIdFor(topic.topicId, "dataset_gap"),
    topicId: topic.topicId,
    gapType: "dataset_gap",
    currentStatus: hasDatasetCue ? "available_catalog_only" : "not_connected_yet",
    missingReason: hasDatasetCue
      ? "Dataset evidence types appear in the catalog — live dataset records are not connected yet."
      : "Dataset records are not connected for this topic.",
    futureEvidenceNeeded: hasDatasetCue
      ? ["Dataset records", "Repository metadata", "Data repository links"]
      : ["Dataset catalog integration", "Repository metadata"],
    relatedWorkspaceArea: "Datasets",
    humanReviewRequired: true,
    version: RESEARCH_GAP_MODEL_VERSION,
  };
}

function buildLaboratoryGap(topic: ResearchTopic): ResearchGap {
  const readiness = getLaboratoryReadinessForTopic(topic);
  const { layer } = readiness;

  return {
    gapId: gapIdFor(topic.topicId, "laboratory_gap"),
    topicId: topic.topicId,
    gapType: "laboratory_gap",
    currentStatus: resolveGapStatus(layer.sourceStatus, readiness.hasLaboratoryEvidenceType),
    missingReason:
      layer.limitations[0] ??
      "Laboratory records are not connected — missing evidence from institutional lab profiles.",
    futureEvidenceNeeded: layer.futureCapabilities.length > 0
      ? layer.futureCapabilities
      : ["Laboratory profiles", "Institutional lab records"],
    relatedWorkspaceArea: "Laboratories",
    humanReviewRequired: layer.humanReviewRequired,
    version: RESEARCH_GAP_MODEL_VERSION,
  };
}

function buildResearcherGap(topic: ResearchTopic): ResearchGap {
  const readiness = getResearcherReadinessForTopic(topic);
  const { layer } = readiness;
  const hasCatalogCue = topic.status === "catalog_available";

  return {
    gapId: gapIdFor(topic.topicId, "researcher_gap"),
    topicId: topic.topicId,
    gapType: "researcher_gap",
    currentStatus: resolveGapStatus(layer.sourceStatus, hasCatalogCue),
    missingReason:
      layer.limitations[0] ??
      "Researcher profiles are not connected — missing evidence from verified researcher records.",
    futureEvidenceNeeded: layer.verificationSources.length > 0
      ? layer.verificationSources
      : RESEARCHER_VERIFICATION_SOURCES,
    relatedWorkspaceArea: "Researchers",
    humanReviewRequired: layer.humanReviewRequired,
    version: RESEARCH_GAP_MODEL_VERSION,
  };
}

function buildMethodGap(topic: ResearchTopic): ResearchGap {
  const hasMethods = topic.relatedMethods.length > 0;

  return {
    gapId: gapIdFor(topic.topicId, "method_gap"),
    topicId: topic.topicId,
    gapType: "method_gap",
    currentStatus: hasMethods ? "available_catalog_only" : "not_connected_yet",
    missingReason: hasMethods
      ? "Method names appear in the catalog — live method records and comparisons are not connected."
      : "Method records are not connected for this topic.",
    futureEvidenceNeeded: hasMethods
      ? topic.relatedMethods.map((method) => `Method records for ${method}`)
      : ["Method catalog integration"],
    relatedWorkspaceArea: "Methods",
    humanReviewRequired: true,
    version: RESEARCH_GAP_MODEL_VERSION,
  };
}

function buildReplicationGap(topic: ResearchTopic): ResearchGap {
  const { questions } = getOpenQuestionsForTopic(topic);
  const replicationQuestion = questions.find(
    (question) => question.questionCategory === "Replication needed",
  );

  return {
    gapId: gapIdFor(topic.topicId, "replication_gap"),
    topicId: topic.topicId,
    gapType: "replication_gap",
    currentStatus: replicationQuestion
      ? replicationQuestion.status === "future_workspace"
        ? "future_workspace"
        : "not_connected_yet"
      : "not_connected_yet",
    missingReason:
      OPEN_QUESTION_CATEGORY_DESCRIPTIONS["Replication needed"] ??
      "Replication evidence is not connected — independent study records are missing.",
    futureEvidenceNeeded: replicationQuestion?.futureEvidenceSources ?? [
      "Replication study records",
      "Independent experiment data",
    ],
    relatedWorkspaceArea: "Open Questions",
    humanReviewRequired: replicationQuestion?.humanReviewRequired ?? true,
    version: RESEARCH_GAP_MODEL_VERSION,
  };
}

function buildNegativeResultGap(topic: ResearchTopic): ResearchGap {
  const { readiness } = getNegativeResultsForTopic(topic);

  return {
    gapId: gapIdFor(topic.topicId, "negative_result_gap"),
    topicId: topic.topicId,
    gapType: "negative_result_gap",
    currentStatus:
      readiness.status === "future_workspace" ? "future_workspace" : "not_connected_yet",
    missingReason: NEGATIVE_RESULTS_NOT_CONNECTED_MESSAGE,
    futureEvidenceNeeded: [
      ...readiness.futureEvidenceSources,
      ...readiness.futureExperimentTypes,
    ],
    relatedWorkspaceArea: "Negative Results",
    humanReviewRequired: readiness.humanReviewRequired,
    version: RESEARCH_GAP_MODEL_VERSION,
  };
}

function buildOpenQuestionGap(topic: ResearchTopic): ResearchGap {
  const { questions } = getOpenQuestionsForTopic(topic);
  const futureSources = [...new Set(questions.flatMap((question) => question.futureEvidenceSources))];

  return {
    gapId: gapIdFor(topic.topicId, "open_question_gap"),
    topicId: topic.topicId,
    gapType: "open_question_gap",
    currentStatus: "not_connected_yet",
    missingReason:
      "Open research questions are not connected to live records — structured question categories only.",
    futureEvidenceNeeded:
      futureSources.length > 0
        ? futureSources
        : ["Peer-reviewed studies", "Experiment records", "Field observations"],
    relatedWorkspaceArea: "Open Questions",
    humanReviewRequired: questions.some((question) => question.humanReviewRequired),
    version: RESEARCH_GAP_MODEL_VERSION,
  };
}

function buildGapSummary(topic: ResearchTopic, gaps: readonly ResearchGap[]): ResearchGapSummaryData {
  return {
    topicId: topic.topicId,
    totalGaps: gaps.length,
    catalogOnlyCount: gaps.filter((gap) => gap.currentStatus === "available_catalog_only").length,
    notConnectedCount: gaps.filter((gap) => gap.currentStatus === "not_connected_yet").length,
    futureWorkspaceCount: gaps.filter((gap) => gap.currentStatus === "future_workspace").length,
    catalogAvailable: RESEARCH_TOPIC_AVAILABLE_TODAY,
    humanReviewRequired: gaps.some((gap) => gap.humanReviewRequired),
  };
}

/** Build all research gaps for a topic from existing catalog and readiness data. */
export function buildResearchGapsForTopic(topic: ResearchTopic): readonly ResearchGap[] {
  return [
    buildPublicationGap(topic),
    buildExperimentGap(topic),
    buildDatasetGap(topic),
    buildLaboratoryGap(topic),
    buildResearcherGap(topic),
    buildMethodGap(topic),
    buildReplicationGap(topic),
    buildOpenQuestionGap(topic),
    buildNegativeResultGap(topic),
  ];
}

/** Build full gap context for a research topic. */
export function buildResearchGapContext(topic: ResearchTopic): ResearchGapContext {
  const gaps = buildResearchGapsForTopic(topic);
  return {
    topicId: topic.topicId,
    gaps,
    summary: buildGapSummary(topic, gaps),
  };
}

/** Select prioritized gaps for topic detail display. */
export function selectTopicDetailGaps(
  gaps: readonly ResearchGap[],
  limit = 6,
): readonly ResearchGap[] {
  const ordered = TOPIC_GAP_PRIORITY.map((gapType) =>
    gaps.find((gap) => gap.gapType === gapType),
  ).filter((gap): gap is ResearchGap => gap !== undefined);

  return ordered.slice(0, limit);
}

/** List not-available-yet catalog areas for summary display. */
export function listTopicMissingAreas(): readonly string[] {
  return RESEARCH_TOPIC_NOT_AVAILABLE_YET;
}
