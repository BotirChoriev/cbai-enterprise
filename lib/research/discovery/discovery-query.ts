import type { ResearchTopic } from "@/lib/research/research-topics";
import { getResearchTopicById } from "@/lib/research/research-topics";
import { buildCrossTopicDiscoveriesForTopic } from "@/lib/research/discovery/discovery-builder";
import type {
  CrossTopicDiscovery,
  CrossTopicDiscoveryContext,
} from "@/lib/research/discovery/discovery-types";

/** List catalog connections from a source topic to related topics. */
export function getCrossTopicDiscoveriesForTopic(
  topic: ResearchTopic,
  limit?: number,
): readonly CrossTopicDiscovery[] {
  return buildCrossTopicDiscoveriesForTopic(topic, limit);
}

/** Resolve cross-topic discovery context for a topic ID. */
export function getCrossTopicDiscoveryContext(
  topicId: string,
  limit?: number,
): CrossTopicDiscoveryContext | undefined {
  const topic = getResearchTopicById(topicId);
  if (!topic) {
    return undefined;
  }

  return {
    sourceTopicId: topic.topicId,
    discoveries: getCrossTopicDiscoveriesForTopic(topic, limit),
  };
}

/** Find a single discovery record between two topics. */
export function findCrossTopicDiscovery(
  sourceTopicId: string,
  relatedTopicId: string,
): CrossTopicDiscovery | undefined {
  const source = getResearchTopicById(sourceTopicId);
  const related = getResearchTopicById(relatedTopicId);
  if (!source || !related) {
    return undefined;
  }

  return getCrossTopicDiscoveriesForTopic(source).find(
    (entry) => entry.relatedTopicId === relatedTopicId,
  );
}
