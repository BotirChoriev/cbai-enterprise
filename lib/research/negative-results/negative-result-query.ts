import type { ResearchTopic } from "@/lib/research/research-topics";
import { NEGATIVE_RESULT_REGISTRY } from "@/lib/research/negative-results/negative-result-registry";
import type { NegativeResultReadiness } from "@/lib/research/negative-results/negative-result-types";

export type NegativeResultTopicContext = {
  topic: ResearchTopic;
  readiness: NegativeResultReadiness;
  isTopicSpecific: boolean;
};

/** Find a negative result readiness entry by ID. */
export function findNegativeResultById(
  negativeResultId: string,
): NegativeResultReadiness | undefined {
  return NEGATIVE_RESULT_REGISTRY.find((entry) => entry.negativeResultId === negativeResultId);
}

/** Find negative result readiness for a topic. */
export function findNegativeResultsByTopic(topicId: string): NegativeResultReadiness | undefined {
  const topicSpecific = NEGATIVE_RESULT_REGISTRY.find((entry) =>
    entry.relatedTopicIds.includes(topicId),
  );

  if (topicSpecific) {
    return topicSpecific;
  }

  return NEGATIVE_RESULT_REGISTRY.find((entry) => entry.relatedTopicIds.length === 0);
}

/** Resolve negative result context for a research topic. */
export function getNegativeResultsForTopic(topic: ResearchTopic): NegativeResultTopicContext {
  const topicSpecific = NEGATIVE_RESULT_REGISTRY.find((entry) =>
    entry.relatedTopicIds.includes(topic.topicId),
  );
  const readiness =
    topicSpecific ?? NEGATIVE_RESULT_REGISTRY.find((entry) => entry.relatedTopicIds.length === 0)!;

  return {
    topic,
    readiness,
    isTopicSpecific: topicSpecific !== undefined,
  };
}

/** List all negative result readiness entries. */
export function listNegativeResults(): readonly NegativeResultReadiness[] {
  return NEGATIVE_RESULT_REGISTRY;
}
