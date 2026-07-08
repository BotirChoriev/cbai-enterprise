import type { ResearchTopic } from "@/lib/research/research-topics";
import { getResearchTopicById } from "@/lib/research/research-topics";
import {
  buildMethodComparisonForTopic,
  buildMethodEvidenceMatrix,
  selectWorkspaceMethodRows,
} from "@/lib/research/method-comparison/method-comparison-builder";
import type {
  MethodComparison,
  MethodEvidenceMatrixCell,
  MethodEvidenceRow,
} from "@/lib/research/method-comparison/method-comparison-types";

/** Resolve method comparison for a topic object. */
export function getMethodComparisonForTopic(topic: ResearchTopic): MethodComparison {
  return buildMethodComparisonForTopic(topic);
}

/** Resolve method comparison for a topic ID. */
export function getMethodComparison(topicId: string): MethodComparison | undefined {
  const topic = getResearchTopicById(topicId);
  if (!topic) {
    return undefined;
  }
  return buildMethodComparisonForTopic(topic);
}

/** Evidence matrix cells for a topic. */
export function getMethodEvidenceMatrixForTopic(
  topic: ResearchTopic,
): readonly MethodEvidenceMatrixCell[] {
  return buildMethodEvidenceMatrix(buildMethodComparisonForTopic(topic));
}

/** Method rows for workspace preview panel. */
export function getWorkspaceMethodRows(topic: ResearchTopic): readonly MethodEvidenceRow[] {
  return selectWorkspaceMethodRows(buildMethodComparisonForTopic(topic));
}
