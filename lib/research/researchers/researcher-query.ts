import type { ResearchTopic } from "@/lib/research/research-topics";
import { RESEARCHER_LAYER_REGISTRY } from "@/lib/research/researchers/researcher-registry";
import {
  RESEARCHER_EXPECTED_PROFILE_METADATA,
  RESEARCHER_FUTURE_TYPES,
  RESEARCHER_LAYER_GLOBAL_LIMITATIONS,
  RESEARCHER_LAYER_FUTURE_CAPABILITIES,
  RESEARCHER_VERIFICATION_SOURCES,
  type ResearcherExpectedProfileMetadata,
  type ResearcherFutureType,
  type ResearcherLayer,
  type ResearcherVerificationSource,
} from "@/lib/research/researchers/researcher-types";

export type ResearcherTopicReadiness = {
  topic: ResearchTopic;
  layer: ResearcherLayer;
  isTopicSpecific: boolean;
};

const GLOBAL_LAYER_ID = "researcher-readiness-global";

/** Find a researcher readiness entry by ID. */
export function findResearcherLayerById(
  researcherLayerId: string,
): ResearcherLayer | undefined {
  return RESEARCHER_LAYER_REGISTRY.find(
    (layer) => layer.researcherLayerId === researcherLayerId,
  );
}

/** Find the most specific researcher readiness entry for a topic. */
export function findResearcherLayerByTopic(topicId: string): ResearcherLayer | undefined {
  const topicSpecific = RESEARCHER_LAYER_REGISTRY.find((layer) =>
    layer.relatedTopicIds.includes(topicId),
  );

  if (topicSpecific) {
    return topicSpecific;
  }

  return findResearcherLayerById(GLOBAL_LAYER_ID);
}

/** List supported future researcher types. */
export function listResearcherTypes(): readonly ResearcherFutureType[] {
  return RESEARCHER_FUTURE_TYPES;
}

/** List expected profile metadata fields for future integration. */
export function listExpectedProfileMetadataFields(): readonly ResearcherExpectedProfileMetadata[] {
  return RESEARCHER_EXPECTED_PROFILE_METADATA;
}

/** List supported verification sources. */
export function listVerificationSources(): readonly ResearcherVerificationSource[] {
  return RESEARCHER_VERIFICATION_SOURCES;
}

/** Resolve researcher readiness context for a research topic. */
export function getResearcherReadinessForTopic(topic: ResearchTopic): ResearcherTopicReadiness {
  const topicSpecific = RESEARCHER_LAYER_REGISTRY.find((layer) =>
    layer.relatedTopicIds.includes(topic.topicId),
  );
  const layer = topicSpecific ?? findResearcherLayerById(GLOBAL_LAYER_ID)!;

  return {
    topic,
    layer,
    isTopicSpecific: topicSpecific !== undefined,
  };
}

/** List all researcher readiness entries. */
export function listResearcherLayers(): readonly ResearcherLayer[] {
  return RESEARCHER_LAYER_REGISTRY;
}

export function getDefaultResearcherLimitations(): readonly string[] {
  return RESEARCHER_LAYER_GLOBAL_LIMITATIONS;
}

export function getDefaultResearcherFutureCapabilities(): readonly string[] {
  return RESEARCHER_LAYER_FUTURE_CAPABILITIES;
}
