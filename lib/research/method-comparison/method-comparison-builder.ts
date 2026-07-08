import type { ResearchTopic } from "@/lib/research/research-topics";
import {
  RESEARCH_TOPIC_AVAILABLE_TODAY,
  RESEARCH_TOPIC_NOT_AVAILABLE_YET,
  RESEARCH_TOPIC_STATUS_LABELS,
} from "@/lib/research/research-topics";
import {
  getExperimentReadinessForTopic,
  getPublicationReadinessForTopic,
} from "@/lib/research";
import { EXPERIMENT_LAYER_GLOBAL_LIMITATIONS } from "@/lib/research/experiments/experiment-types";
import { PUBLICATION_LAYER_GLOBAL_LIMITATIONS } from "@/lib/research/publications/publication-types";
import type {
  MethodComparison,
  MethodComparisonStatus,
  MethodEvidenceMatrixCell,
  MethodEvidenceRow,
} from "@/lib/research/method-comparison/method-comparison-types";
import {
  METHOD_COMPARISON_LIMITATIONS,
  METHOD_COMPARISON_MODEL_VERSION,
  WORKSPACE_METHOD_PREVIEW_LIMIT,
} from "@/lib/research/method-comparison/method-comparison-types";

function comparisonIdFor(topicId: string): string {
  return `method-comparison:${topicId}`;
}

function resolveRowStatus(topic: ResearchTopic): MethodComparisonStatus {
  if (topic.status === "evidence_not_connected") {
    return "evidence_not_connected";
  }
  return "catalog_available";
}

function resolveComparisonStatus(
  topic: ResearchTopic,
  methods: readonly string[],
): MethodComparisonStatus {
  if (methods.length === 0) {
    return "evidence_not_connected";
  }
  if (topic.status === "evidence_not_connected") {
    return "evidence_not_connected";
  }
  return "human_review_required";
}

function buildMissingEvidence(topic: ResearchTopic): readonly string[] {
  const publication = getPublicationReadinessForTopic(topic);
  const experiment = getExperimentReadinessForTopic(topic);

  return [
    ...RESEARCH_TOPIC_NOT_AVAILABLE_YET,
    publication.layer.limitations[0] ?? "Live publication records not connected",
    experiment.layer.limitations[0] ?? "Live experiment records not connected",
  ].slice(0, 6);
}

function buildMethodEvidenceRow(topic: ResearchTopic, methodName: string): MethodEvidenceRow {
  return {
    methodName,
    relatedEvidenceTypes: topic.relatedEvidenceTypes,
    availableCatalogInfo: [
      "Method listed in topic catalog",
      `Domain: ${topic.domain}`,
      `Topic status: ${RESEARCH_TOPIC_STATUS_LABELS[topic.status]}`,
      ...RESEARCH_TOPIC_AVAILABLE_TODAY.slice(0, 2),
    ],
    missingEvidence: buildMissingEvidence(topic),
    status: resolveRowStatus(topic),
  };
}

function createMethodEvidenceMatrixCells(
  rows: readonly MethodEvidenceRow[],
  evidenceTypes: readonly string[],
): readonly MethodEvidenceMatrixCell[] {
  const cells: MethodEvidenceMatrixCell[] = [];

  for (const row of rows) {
    for (const evidenceType of evidenceTypes) {
      cells.push({
        methodName: row.methodName,
        evidenceType,
        catalogListed: row.relatedEvidenceTypes.includes(evidenceType),
        status: row.relatedEvidenceTypes.includes(evidenceType)
          ? "catalog_available"
          : "evidence_not_connected",
      });
    }
  }

  return cells;
}

function buildLimitations(): readonly string[] {
  return [
    ...METHOD_COMPARISON_LIMITATIONS,
    PUBLICATION_LAYER_GLOBAL_LIMITATIONS[0] ?? "",
    EXPERIMENT_LAYER_GLOBAL_LIMITATIONS[0] ?? "",
  ].filter(Boolean);
}

/** Build a method comparison snapshot for a research topic. */
export function buildMethodComparisonForTopic(topic: ResearchTopic): MethodComparison {
  const methods = topic.relatedMethods;
  const evidenceTypes = topic.relatedEvidenceTypes;
  const methodEvidenceRows = methods.map((methodName) =>
    buildMethodEvidenceRow(topic, methodName),
  );

  return {
    comparisonId: comparisonIdFor(topic.topicId),
    topicId: topic.topicId,
    methods,
    evidenceTypes,
    methodEvidenceRows,
    status: resolveComparisonStatus(topic, methods),
    limitations: buildLimitations(),
    humanReviewRequired: true,
    version: METHOD_COMPARISON_MODEL_VERSION,
  };
}

/** Build evidence matrix cells for a comparison. */
export function buildMethodEvidenceMatrix(
  comparison: MethodComparison,
): readonly MethodEvidenceMatrixCell[] {
  return createMethodEvidenceMatrixCells(
    comparison.methodEvidenceRows,
    comparison.evidenceTypes,
  );
}

/** Select method rows for workspace preview (3–5 methods when available). */
export function selectWorkspaceMethodRows(
  comparison: MethodComparison,
): readonly MethodEvidenceRow[] {
  const count = comparison.methodEvidenceRows.length;
  if (count === 0) {
    return comparison.methodEvidenceRows;
  }
  const limit = Math.min(WORKSPACE_METHOD_PREVIEW_LIMIT, count);
  return comparison.methodEvidenceRows.slice(0, limit);
}
