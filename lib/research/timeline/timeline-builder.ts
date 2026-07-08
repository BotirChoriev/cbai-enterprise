import type { ResearchTopic } from "@/lib/research/research-topics";
import { RESEARCH_TOPIC_FUTURE_SUPPORTS } from "@/lib/research/research-topics";
import { getOpenQuestionsForTopic } from "@/lib/research/open-questions/question-query";
import type {
  KnowledgeTimeline,
  KnowledgeTimelineStage,
  TimelineOverallStatus,
  TimelineStageId,
  TimelineStageStatus,
} from "@/lib/research/timeline/timeline-types";
import {
  TIMELINE_STAGE_DEFINITIONS,
  TIMELINE_STAGE_IDS,
  TIMELINE_VERSION,
} from "@/lib/research/timeline/timeline-types";
import { validateKnowledgeTimeline } from "@/lib/research/timeline/timeline-validation";

function mapOverallStatus(topic: ResearchTopic): TimelineOverallStatus {
  switch (topic.status) {
    case "catalog_available":
      return "catalog_available";
    case "workspace_not_available":
      return "future_workspace";
    case "evidence_not_connected":
      return "not_connected_yet";
  }
}

function buildStage(
  stageId: TimelineStageId,
  stageNumber: number,
  status: TimelineStageStatus,
  explanation: string,
  description: string,
): KnowledgeTimelineStage {
  const definition = TIMELINE_STAGE_DEFINITIONS[stageId];
  return {
    stageId,
    stageNumber,
    title: definition.title,
    purpose: definition.purpose,
    description,
    explanation,
    status,
  };
}

function buildStages(topic: ResearchTopic): KnowledgeTimelineStage[] {
  const openQuestions = getOpenQuestionsForTopic(topic);
  const questionCategories = openQuestions.questions.map((q) => q.questionCategory).join(", ");
  const futureEvidenceItems = ["Publications", "Experiments", "Datasets", "Laboratories"].filter(
    (item) => RESEARCH_TOPIC_FUTURE_SUPPORTS.includes(item as (typeof RESEARCH_TOPIC_FUTURE_SUPPORTS)[number]),
  );

  return [
    buildStage(
      "research_topic",
      1,
      "catalog_available",
      `${topic.topicName} is defined in the ${topic.domain} catalog.`,
      topic.description,
    ),
    buildStage(
      "current_knowledge",
      2,
      "catalog_available",
      "Available catalog information includes domain classification and topic profile.",
      `Review the read-only catalog profile for ${topic.topicName} — not live evidence.`,
    ),
    buildStage(
      "methods",
      3,
      "catalog_available",
      `Catalog methods: ${topic.relatedMethods.join(", ")}.`,
      "Understand which methods are listed for structured review when sources connect.",
    ),
    buildStage(
      "evidence",
      4,
      "not_connected_yet",
      `Catalog evidence types: ${topic.relatedEvidenceTypes.join(", ")}.`,
      "Evidence types are listed in the catalog — live sources are not connected yet.",
    ),
    buildStage(
      "open_questions",
      5,
      openQuestions.questions.length > 0 ? "future_workspace" : "not_connected_yet",
      questionCategories
        ? `Open question categories tracked: ${questionCategories}.`
        : "Open question categories will be tracked when records are added.",
      "Identify unanswered questions as structured categories — not live discussion.",
    ),
    buildStage(
      "future_evidence",
      6,
      "future_workspace",
      `Future evidence may include ${futureEvidenceItems.join(", ").toLowerCase()}.`,
      "Future publications, experiments, datasets, and laboratories — not connected yet.",
    ),
    buildStage(
      "research_workspace",
      7,
      "future_workspace",
      topic.futureWorkspace,
      "Future collaboration space for evidence review — not active today.",
    ),
  ];
}

/** Build a knowledge evolution timeline for one topic. */
export function buildKnowledgeTimeline(topic: ResearchTopic): KnowledgeTimeline {
  const timeline: KnowledgeTimeline = {
    timelineId: `timeline:${topic.topicId}`,
    topicId: topic.topicId,
    stages: buildStages(topic),
    status: mapOverallStatus(topic),
    humanReviewRequired: true,
    version: TIMELINE_VERSION,
  };

  const validation = validateKnowledgeTimeline(timeline);
  if (!validation.valid) {
    const summary = validation.issues.map((issue) => issue.message).join("; ");
    throw new Error(`Knowledge timeline validation failed for "${topic.topicId}": ${summary}`);
  }

  return timeline;
}

/** Verify all required stages are present. */
export function getRequiredTimelineStageIds(): readonly TimelineStageId[] {
  return TIMELINE_STAGE_IDS;
}
