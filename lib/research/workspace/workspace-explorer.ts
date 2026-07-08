import type { ResearchTopic } from "@/lib/research/research-topics";
import {
  RESEARCH_TOPIC_FUTURE_SUPPORTS,
  RESEARCH_TOPICS,
  getResearchTopicById,
} from "@/lib/research/research-topics";
import { getOpenQuestionsForTopic } from "@/lib/research/open-questions/question-query";
import { getResearchNotebookForTopicObject } from "@/lib/research/notebook/notebook-query";
import { getKnowledgeTimelineForTopicObject } from "@/lib/research/timeline/timeline-query";
import { getResearchGraphForTopicObject } from "@/lib/research/graph/research-graph-query";
import {
  getExperimentReadinessForTopic,
  getLaboratoryReadinessForTopic,
  getPublicationReadinessForTopic,
  getResearcherReadinessForTopic,
} from "@/lib/research";
import {
  PUBLICATION_LAYER_SOURCE_STATUS_LABELS,
  EXPERIMENT_LAYER_SOURCE_STATUS_LABELS,
  LABORATORY_LAYER_SOURCE_STATUS_LABELS,
  RESEARCHER_LAYER_SOURCE_STATUS_LABELS,
} from "@/lib/research";
import type { ResearchNotebook } from "@/lib/research/notebook/notebook-types";
import type { KnowledgeTimeline } from "@/lib/research/timeline/timeline-types";
import type { ResearchGraph } from "@/lib/research/graph/research-graph-types";

export type WorkspaceKnowledgeSummary = {
  topicName: string;
  domain: string;
  description: string;
  methods: readonly string[];
  evidenceTypes: readonly string[];
  openQuestionCategories: readonly string[];
  futureObjects: readonly string[];
};

export type WorkspaceEvidenceStatus = {
  label: string;
  status: string;
  statusKind: "catalog_available" | "not_connected_yet" | "future_workspace";
};

function mapLayerSourceToStatusKind(
  sourceStatus: string,
): WorkspaceEvidenceStatus["statusKind"] {
  if (sourceStatus === "future_integration_required") {
    return "future_workspace";
  }
  if (sourceStatus === "metadata_not_available") {
    return "catalog_available";
  }
  return "not_connected_yet";
}

export const WORKSPACE_EVIDENCE_STATUS_KIND_LABELS: Record<
  WorkspaceEvidenceStatus["statusKind"],
  string
> = {
  catalog_available: "Catalog available",
  not_connected_yet: "Not connected yet",
  future_workspace: "Future workspace",
};

export type WorkspaceExplorerContext = {
  topic: ResearchTopic;
  knowledgeSummary: WorkspaceKnowledgeSummary;
  evidenceStatuses: readonly WorkspaceEvidenceStatus[];
  notebook: ResearchNotebook;
  timeline: KnowledgeTimeline;
  graph: ResearchGraph;
  openQuestionCategories: readonly string[];
};

export const WORKSPACE_EXPLORER_DEFAULT_TOPIC_ID = "microbiology";

/** Build explorer context for a research topic from existing catalog data. */
export function buildWorkspaceExplorerContext(topic: ResearchTopic): WorkspaceExplorerContext {
  const openQuestions = getOpenQuestionsForTopic(topic);
  const publication = getPublicationReadinessForTopic(topic);
  const experiment = getExperimentReadinessForTopic(topic);
  const laboratory = getLaboratoryReadinessForTopic(topic);
  const researcher = getResearcherReadinessForTopic(topic);

  const openQuestionCategories = openQuestions.questions.map((q) => q.questionCategory);

  return {
    topic,
    knowledgeSummary: {
      topicName: topic.topicName,
      domain: topic.domain,
      description: topic.description,
      methods: topic.relatedMethods,
      evidenceTypes: topic.relatedEvidenceTypes,
      openQuestionCategories,
      futureObjects: RESEARCH_TOPIC_FUTURE_SUPPORTS,
    },
    evidenceStatuses: [
      {
        label: "Publications",
        status: PUBLICATION_LAYER_SOURCE_STATUS_LABELS[publication.layer.sourceStatus],
        statusKind: mapLayerSourceToStatusKind(publication.layer.sourceStatus),
      },
      {
        label: "Experiments",
        status: EXPERIMENT_LAYER_SOURCE_STATUS_LABELS[experiment.layer.sourceStatus],
        statusKind: mapLayerSourceToStatusKind(experiment.layer.sourceStatus),
      },
      {
        label: "Laboratories",
        status: LABORATORY_LAYER_SOURCE_STATUS_LABELS[laboratory.layer.sourceStatus],
        statusKind: mapLayerSourceToStatusKind(laboratory.layer.sourceStatus),
      },
      {
        label: "Researchers",
        status: RESEARCHER_LAYER_SOURCE_STATUS_LABELS[researcher.layer.sourceStatus],
        statusKind: mapLayerSourceToStatusKind(researcher.layer.sourceStatus),
      },
    ],
    notebook: getResearchNotebookForTopicObject(topic),
    timeline: getKnowledgeTimelineForTopicObject(topic),
    graph: getResearchGraphForTopicObject(topic),
    openQuestionCategories,
  };
}

export function getWorkspaceExplorerContext(topicId: string): WorkspaceExplorerContext | undefined {
  const topic = getResearchTopicById(topicId);
  if (!topic) {
    return undefined;
  }
  return buildWorkspaceExplorerContext(topic);
}

export function getDefaultWorkspaceTopic(): ResearchTopic {
  return getResearchTopicById(WORKSPACE_EXPLORER_DEFAULT_TOPIC_ID) ?? RESEARCH_TOPICS[0]!;
}

export function filterWorkspaceTopics(
  query: string,
): readonly ResearchTopic[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return RESEARCH_TOPICS;
  }

  return RESEARCH_TOPICS.filter((topic) => {
    const haystack = [
      topic.topicName,
      topic.domain,
      topic.description,
      ...topic.relatedMethods,
      ...topic.relatedEvidenceTypes,
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(normalized);
  });
}

export function listWorkspaceTopics(): readonly ResearchTopic[] {
  return RESEARCH_TOPICS;
}
