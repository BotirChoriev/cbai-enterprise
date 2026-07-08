import type { ResearchTopic } from "@/lib/research/research-topics";
import {
  RESEARCH_TOPIC_AVAILABLE_TODAY,
  RESEARCH_TOPIC_FUTURE_SUPPORTS,
  RESEARCH_TOPIC_NOT_AVAILABLE_YET,
  RESEARCH_TOPIC_STATUS_LABELS,
} from "@/lib/research/research-topics";
import { getOpenQuestionsForTopic } from "@/lib/research/open-questions/question-query";
import {
  NEGATIVE_RESULT_PRESERVATION_PURPOSE,
  NEGATIVE_RESULTS_NOT_CONNECTED_MESSAGE,
} from "@/lib/research/negative-results/negative-result-types";
import { getResearchGraphForTopicObject } from "@/lib/research/graph/research-graph-query";
import { RESEARCH_GRAPH_RELATIONSHIP_LABELS } from "@/lib/research/graph/research-graph-types";
import type {
  NotebookGraphConnection,
  NotebookStatus,
  NotebookSummarySection,
  ResearchNotebook,
} from "@/lib/research/notebook/notebook-types";
import {
  NOTEBOOK_CATALOG_ONLY_NOTICE,
  NOTEBOOK_HUMAN_REVIEW_NOTICE,
  NOTEBOOK_SUMMARY_SECTION_TITLES,
  NOTEBOOK_VERSION,
} from "@/lib/research/notebook/notebook-types";
import { validateResearchNotebook } from "@/lib/research/notebook/notebook-validation";

function mapNotebookStatus(topic: ResearchTopic): NotebookStatus {
  if (topic.status === "evidence_not_connected") {
    return "live_evidence_not_connected";
  }
  return "catalog_notebook_available";
}

function buildSummarySections(topic: ResearchTopic): NotebookSummarySection[] {
  const openQuestions = getOpenQuestionsForTopic(topic);

  return [
    {
      sectionId: "topic_overview",
      title: NOTEBOOK_SUMMARY_SECTION_TITLES.topic_overview,
      content: topic.description,
      items: [`Domain: ${topic.domain}`, `Status: ${RESEARCH_TOPIC_STATUS_LABELS[topic.status]}`],
    },
    {
      sectionId: "available_catalog_information",
      title: NOTEBOOK_SUMMARY_SECTION_TITLES.available_catalog_information,
      content: "Available catalog information for this research topic — not live evidence.",
      items: RESEARCH_TOPIC_AVAILABLE_TODAY,
    },
    {
      sectionId: "methods_to_review",
      title: NOTEBOOK_SUMMARY_SECTION_TITLES.methods_to_review,
      content: "Methods listed in the catalog for structured review.",
      items: topic.relatedMethods,
    },
    {
      sectionId: "evidence_types_to_connect",
      title: NOTEBOOK_SUMMARY_SECTION_TITLES.evidence_types_to_connect,
      content: "Evidence types that will matter when sources connect — not connected yet.",
      items: topic.relatedEvidenceTypes,
    },
    {
      sectionId: "open_question_categories",
      title: NOTEBOOK_SUMMARY_SECTION_TITLES.open_question_categories,
      content: "Open research question categories tracked for future evidence — no live records.",
      items: openQuestions.questions.map((question) => question.questionCategory),
    },
    {
      sectionId: "negative_results_purpose",
      title: NOTEBOOK_SUMMARY_SECTION_TITLES.negative_results_purpose,
      content: NEGATIVE_RESULTS_NOT_CONNECTED_MESSAGE,
      items: NEGATIVE_RESULT_PRESERVATION_PURPOSE,
    },
    {
      sectionId: "future_workspace_support",
      title: NOTEBOOK_SUMMARY_SECTION_TITLES.future_workspace_support,
      content: topic.futureWorkspace,
      items: RESEARCH_TOPIC_FUTURE_SUPPORTS,
    },
    {
      sectionId: "human_scientific_review",
      title: NOTEBOOK_SUMMARY_SECTION_TITLES.human_scientific_review,
      content: NOTEBOOK_HUMAN_REVIEW_NOTICE,
      items: [NOTEBOOK_CATALOG_ONLY_NOTICE],
    },
  ];
}

function buildGraphConnections(topic: ResearchTopic): NotebookGraphConnection[] {
  const graph = getResearchGraphForTopicObject(topic);

  return graph.edges
    .filter((edge) => edge.sourceNodeId === graph.focusNodeId)
    .slice(0, 8)
    .map((edge) => {
      const target = graph.nodes.find((node) => node.nodeId === edge.targetNodeId);
      return {
        label: target?.label ?? edge.targetNodeId,
        connectionType: RESEARCH_GRAPH_RELATIONSHIP_LABELS[edge.relationshipType],
        status: target?.status ?? edge.status,
      };
    });
}

function buildLimitations(topic: ResearchTopic): string[] {
  return [
    NOTEBOOK_CATALOG_ONLY_NOTICE,
    "Live AI generation is not active.",
    ...RESEARCH_TOPIC_NOT_AVAILABLE_YET.filter((item) => item !== "AI Notebook not connected"),
    topic.status === "evidence_not_connected"
      ? "Live evidence for this topic is not connected yet."
      : "Live evidence sources are not connected for this topic.",
  ];
}

/** Build a structured research notebook from catalog data for one topic. */
export function buildResearchNotebook(topic: ResearchTopic): ResearchNotebook {
  const openQuestions = getOpenQuestionsForTopic(topic);

  const notebook: ResearchNotebook = {
    notebookId: `notebook:${topic.topicId}`,
    topicId: topic.topicId,
    topicName: topic.topicName,
    domain: topic.domain,
    summarySections: buildSummarySections(topic),
    evidenceFocus: topic.relatedEvidenceTypes,
    openQuestionCategories: openQuestions.questions.map((q) => q.questionCategory),
    negativeResultPurpose: [...NEGATIVE_RESULT_PRESERVATION_PURPOSE],
    graphConnections: buildGraphConnections(topic),
    limitations: buildLimitations(topic),
    futureWorkspaceSupport: [...RESEARCH_TOPIC_FUTURE_SUPPORTS],
    humanReviewRequired: true,
    status: mapNotebookStatus(topic),
    version: NOTEBOOK_VERSION,
  };

  const validation = validateResearchNotebook(notebook);
  if (!validation.valid) {
    const summary = validation.issues.map((issue) => issue.message).join("; ");
    throw new Error(`Research notebook validation failed for "${topic.topicId}": ${summary}`);
  }

  return notebook;
}
