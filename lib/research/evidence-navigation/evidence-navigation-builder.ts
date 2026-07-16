import type { ResearchTopic } from "@/lib/research/research-topics";
import { getResearchGapsForTopic } from "@/lib/research/gaps/research-gap-query";
import { RESEARCH_GAP_TYPE_LABELS } from "@/lib/research/gaps/research-gap-types";
import type { ResearchGapStatus, ResearchGapType } from "@/lib/research/gaps/research-gap-types";
import { getMethodComparisonForTopic } from "@/lib/research/method-comparison/method-comparison-query";
import type { MethodComparisonStatus } from "@/lib/research/method-comparison/method-comparison-types";
import { getNegativeResultsForTopic } from "@/lib/research/negative-results/negative-result-query";
import type { NegativeResultStatus } from "@/lib/research/negative-results/negative-result-types";
import { getOpenQuestionsForTopic } from "@/lib/research/open-questions/question-query";
import type { OpenQuestionStatus } from "@/lib/research/open-questions/question-types";
import type {
  EvidenceNavigationEdge,
  EvidenceNavigationNode,
  EvidenceNavigationPath,
} from "@/lib/research/evidence-navigation/evidence-navigation-model";
import type {
  EvidenceNavigationObjectKind,
  EvidenceNavigationRelationshipType,
  EvidenceNavigationStatus,
} from "@/lib/research/evidence-navigation/evidence-navigation-types";
import { WORKSPACE_PATH } from "@/lib/research/workspace/workspace-types";

function pathIdFor(topicId: string): string {
  return `evidence-navigation:${topicId}`;
}

function nodeIdFor(objectKind: EvidenceNavigationObjectKind, objectId: string): string {
  return `nav-node:${objectKind}:${objectId}`;
}

function edgeIdFor(
  sourceNodeId: string,
  targetNodeId: string,
  relationshipType: EvidenceNavigationRelationshipType,
): string {
  return `nav-edge:${sourceNodeId}:${targetNodeId}:${relationshipType}`;
}

function slugFromLabel(label: string): string {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function mapTopicStatus(topic: ResearchTopic): EvidenceNavigationStatus {
  switch (topic.status) {
    case "catalog_available":
      return "available_catalog";
    case "evidence_not_connected":
      return "not_connected_yet";
    case "workspace_not_available":
      return "future_workspace";
  }
}

function mapGapStatus(status: ResearchGapStatus): EvidenceNavigationStatus {
  switch (status) {
    case "available_catalog_only":
      return "available_catalog";
    case "not_connected_yet":
      return "not_connected_yet";
    case "future_workspace":
      return "future_workspace";
  }
}

function mapMethodComparisonStatus(status: MethodComparisonStatus): EvidenceNavigationStatus {
  switch (status) {
    case "catalog_available":
      return "available_catalog";
    case "evidence_not_connected":
      return "not_connected_yet";
    case "human_review_required":
      return "human_review_required";
  }
}

function mapOpenQuestionStatus(status: OpenQuestionStatus): EvidenceNavigationStatus {
  switch (status) {
    case "not_connected_yet":
      return "not_connected_yet";
    case "future_workspace":
      return "future_workspace";
  }
}

function mapNegativeResultStatus(status: NegativeResultStatus): EvidenceNavigationStatus {
  switch (status) {
    case "not_connected_yet":
      return "not_connected_yet";
    case "future_workspace":
      return "future_workspace";
  }
}

function withHumanReview(
  status: EvidenceNavigationStatus,
  humanReviewRequired: boolean,
): EvidenceNavigationStatus {
  return humanReviewRequired ? "human_review_required" : status;
}

function buildTopicNode(topic: ResearchTopic): EvidenceNavigationNode {
  return {
    nodeId: nodeIdFor("research_topic", topic.topicId),
    objectKind: "research_topic",
    objectId: topic.topicId,
    label: topic.topicName,
    status: mapTopicStatus(topic),
  };
}

function buildMethodNodes(
  topic: ResearchTopic,
  methodComparisonStatus: MethodComparisonStatus,
): EvidenceNavigationNode[] {
  const methodComparison = getMethodComparisonForTopic(topic);
  const rowStatusByMethod = new Map(
    methodComparison.methodEvidenceRows.map((row) => [row.methodName, row.status]),
  );

  return methodComparison.methods.map((methodName) => {
    const rowStatus = rowStatusByMethod.get(methodName) ?? methodComparisonStatus;
    return {
      nodeId: nodeIdFor("method", `${topic.topicId}:${slugFromLabel(methodName)}`),
      objectKind: "method",
      objectId: methodName,
      label: methodName,
      status: mapMethodComparisonStatus(rowStatus),
    };
  });
}

function buildEvidenceTypeNodes(topic: ResearchTopic): EvidenceNavigationNode[] {
  const methodComparison = getMethodComparisonForTopic(topic);

  return methodComparison.evidenceTypes.map((evidenceType) => ({
    nodeId: nodeIdFor("evidence_type", `${topic.topicId}:${slugFromLabel(evidenceType)}`),
    objectKind: "evidence_type",
    objectId: evidenceType,
    label: evidenceType,
    status: mapMethodComparisonStatus(methodComparison.status),
  }));
}

function gapObjectKind(gapType: ResearchGapType): EvidenceNavigationObjectKind {
  switch (gapType) {
    case "publication_gap":
      return "publication";
    case "experiment_gap":
    case "replication_gap":
      return "experiment";
    case "dataset_gap":
      return "dataset";
    case "laboratory_gap":
      return "laboratory";
    case "researcher_gap":
      return "researcher";
    case "method_gap":
      return "method";
    case "negative_result_gap":
      return "negative_result";
    case "open_question_gap":
      return "open_question";
  }
}

function buildGapNodes(topic: ResearchTopic): EvidenceNavigationNode[] {
  return getResearchGapsForTopic(topic).map((gap) => ({
    nodeId: nodeIdFor(gapObjectKind(gap.gapType), gap.gapId),
    objectKind: gapObjectKind(gap.gapType),
    objectId: gap.gapId,
    label: RESEARCH_GAP_TYPE_LABELS[gap.gapType],
    status: withHumanReview(mapGapStatus(gap.currentStatus), gap.humanReviewRequired),
  }));
}

function buildOpenQuestionNodes(topic: ResearchTopic): EvidenceNavigationNode[] {
  return getOpenQuestionsForTopic(topic).questions.map((question) => ({
    nodeId: nodeIdFor("open_question", question.questionId),
    objectKind: "open_question",
    objectId: question.questionId,
    label: question.questionCategory,
    status: withHumanReview(
      mapOpenQuestionStatus(question.status),
      question.humanReviewRequired,
    ),
  }));
}

function buildNegativeResultNode(topic: ResearchTopic): EvidenceNavigationNode {
  const { readiness } = getNegativeResultsForTopic(topic);

  return {
    nodeId: nodeIdFor("negative_result", readiness.negativeResultId),
    objectKind: "negative_result",
    objectId: readiness.negativeResultId,
    label: "Negative result readiness",
    status: withHumanReview(
      mapNegativeResultStatus(readiness.status),
      readiness.humanReviewRequired,
    ),
  };
}

function buildWorkspaceNode(topic: ResearchTopic): EvidenceNavigationNode {
  return {
    nodeId: nodeIdFor("workspace", topic.topicId),
    objectKind: "workspace",
    objectId: `${WORKSPACE_PATH}?topic=${topic.topicId}`,
    label: "Research Workspace",
    status: topic.status === "workspace_not_available" ? "future_workspace" : "available_catalog",
  };
}

function buildEdge(
  sourceNodeId: string,
  targetNodeId: string,
  relationshipType: EvidenceNavigationRelationshipType,
  status: EvidenceNavigationStatus,
): EvidenceNavigationEdge {
  return {
    edgeId: edgeIdFor(sourceNodeId, targetNodeId, relationshipType),
    sourceNodeId,
    targetNodeId,
    relationshipType,
    status,
  };
}

function resolvePathStatus(
  topic: ResearchTopic,
  nodes: readonly EvidenceNavigationNode[],
): EvidenceNavigationStatus {
  if (nodes.some((node) => node.status === "human_review_required")) {
    return "human_review_required";
  }
  return mapTopicStatus(topic);
}

/** Build catalog navigation paths from a research topic. */
export function buildEvidenceNavigationPathForTopic(
  topic: ResearchTopic,
): EvidenceNavigationPath {
  const topicNode = buildTopicNode(topic);
  const methodComparison = getMethodComparisonForTopic(topic);

  const methodNodes = buildMethodNodes(topic, methodComparison.status);
  const evidenceTypeNodes = buildEvidenceTypeNodes(topic);
  const gapNodes = buildGapNodes(topic);
  const openQuestionNodes = buildOpenQuestionNodes(topic);
  const negativeResultNode = buildNegativeResultNode(topic);
  const workspaceNode = buildWorkspaceNode(topic);

  const nodes: EvidenceNavigationNode[] = [
    topicNode,
    ...methodNodes,
    ...evidenceTypeNodes,
    ...gapNodes,
    ...openQuestionNodes,
    negativeResultNode,
    workspaceNode,
  ];

  const edges: EvidenceNavigationEdge[] = [
    ...methodNodes.map((node) =>
      buildEdge(topicNode.nodeId, node.nodeId, "uses_method", node.status),
    ),
    ...evidenceTypeNodes.map((node) =>
      buildEdge(topicNode.nodeId, node.nodeId, "requires_evidence", node.status),
    ),
    ...gapNodes.map((node) =>
      buildEdge(topicNode.nodeId, node.nodeId, "connects_to_gap", node.status),
    ),
    ...openQuestionNodes.map((node) =>
      buildEdge(topicNode.nodeId, node.nodeId, "connects_to_question", node.status),
    ),
    buildEdge(
      topicNode.nodeId,
      negativeResultNode.nodeId,
      "connects_to_negative_result",
      negativeResultNode.status,
    ),
    buildEdge(topicNode.nodeId, workspaceNode.nodeId, "opens_workspace", workspaceNode.status),
  ];

  const humanReviewRequired =
    methodComparison.humanReviewRequired ||
    nodes.some((node) => node.status === "human_review_required");

  return {
    pathId: pathIdFor(topic.topicId),
    nodes,
    edges,
    status: resolvePathStatus(topic, nodes),
    humanReviewRequired,
  };
}