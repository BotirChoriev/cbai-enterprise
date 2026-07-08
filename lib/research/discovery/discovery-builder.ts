import type { ResearchTopic } from "@/lib/research/research-topics";
import { RESEARCH_TOPIC_FUTURE_SUPPORTS, RESEARCH_TOPICS } from "@/lib/research/research-topics";
import type {
  CrossTopicDiscovery,
  DiscoveryRelationshipReason,
} from "@/lib/research/discovery/discovery-types";
import { DISCOVERY_MODEL_VERSION } from "@/lib/research/discovery/discovery-types";

function discoveryIdFor(sourceTopicId: string, relatedTopicId: string): string {
  return `discovery:${sourceTopicId}:${relatedTopicId}`;
}

function intersectCatalogValues(
  left: readonly string[],
  right: readonly string[],
): readonly string[] {
  return left.filter((value) => right.includes(value));
}

/** Build a single catalog connection between two research topics. */
export function buildCrossTopicDiscovery(
  source: ResearchTopic,
  related: ResearchTopic,
): CrossTopicDiscovery | undefined {
  if (source.topicId === related.topicId) {
    return undefined;
  }

  const sharedMethods = intersectCatalogValues(source.relatedMethods, related.relatedMethods);
  const sharedEvidenceTypes = intersectCatalogValues(
    source.relatedEvidenceTypes,
    related.relatedEvidenceTypes,
  );
  const sharedDomain = source.domainId === related.domainId ? source.domain : null;
  const futureObjects = intersectCatalogValues(
    RESEARCH_TOPIC_FUTURE_SUPPORTS,
    RESEARCH_TOPIC_FUTURE_SUPPORTS,
  );

  const relationshipReasons: DiscoveryRelationshipReason[] = [];
  if (sharedDomain) {
    relationshipReasons.push("same_domain");
  }
  if (sharedMethods.length > 0) {
    relationshipReasons.push("shared_method");
  }
  if (sharedEvidenceTypes.length > 0) {
    relationshipReasons.push("shared_evidence_type");
  }

  const hasPrimaryLink = relationshipReasons.length > 0;
  if (!hasPrimaryLink) {
    return undefined;
  }

  if (futureObjects.length > 0) {
    relationshipReasons.push("shared_future_object");
  }

  return {
    discoveryId: discoveryIdFor(source.topicId, related.topicId),
    sourceTopicId: source.topicId,
    relatedTopicId: related.topicId,
    relationshipReasons,
    sharedMethods,
    sharedEvidenceTypes,
    sharedDomain,
    futureObjects,
    status: "catalog_connection",
    humanReviewRequired: true,
    version: DISCOVERY_MODEL_VERSION,
  };
}

function discoveryStrength(discovery: CrossTopicDiscovery): number {
  return (
    discovery.relationshipReasons.length * 10 +
    discovery.sharedMethods.length +
    discovery.sharedEvidenceTypes.length
  );
}

/** Build and order related topic discoveries for a source topic. */
export function buildCrossTopicDiscoveriesForTopic(
  source: ResearchTopic,
  limit?: number,
): readonly CrossTopicDiscovery[] {
  const discoveries = RESEARCH_TOPICS.map((related) => buildCrossTopicDiscovery(source, related))
    .filter((entry): entry is CrossTopicDiscovery => entry !== undefined)
    .sort((left, right) => {
      const strengthDelta = discoveryStrength(right) - discoveryStrength(left);
      if (strengthDelta !== 0) {
        return strengthDelta;
      }
      return left.relatedTopicId.localeCompare(right.relatedTopicId);
    });

  if (limit === undefined) {
    return discoveries;
  }

  return discoveries.slice(0, limit);
}
