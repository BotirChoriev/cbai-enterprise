import type { ResearchTopic } from "@/lib/research/research-topics";
import { PUBLICATION_LAYER_REGISTRY } from "@/lib/research/publications/publication-registry";
import {
  PUBLICATION_EXPECTED_METADATA_FIELDS,
  PUBLICATION_FUTURE_SOURCE_TYPES,
  PUBLICATION_LAYER_GLOBAL_LIMITATIONS,
  PUBLICATION_LAYER_FUTURE_CAPABILITIES,
  type PublicationExpectedMetadataField,
  type PublicationFutureSourceType,
  type PublicationLayer,
} from "@/lib/research/publications/publication-types";

export type PublicationTopicReadiness = {
  topic: ResearchTopic;
  layer: PublicationLayer;
  isTopicSpecific: boolean;
  hasPublicationEvidenceType: boolean;
};

const GLOBAL_LAYER_ID = "pub-layer-readiness-global";

const PUBLICATION_EVIDENCE_KEYWORDS = [
  "peer-reviewed",
  "publication",
  "paper",
  "study",
  "literature",
  "methods paper",
] as const;

function topicReferencesPublicationEvidence(topic: ResearchTopic): boolean {
  return topic.relatedEvidenceTypes.some((evidenceType) =>
    PUBLICATION_EVIDENCE_KEYWORDS.some((keyword) =>
      evidenceType.toLowerCase().includes(keyword),
    ),
  );
}

/** Find a publication layer entry by ID. */
export function findPublicationLayerById(
  publicationLayerId: string,
): PublicationLayer | undefined {
  return PUBLICATION_LAYER_REGISTRY.find(
    (layer) => layer.publicationLayerId === publicationLayerId,
  );
}

/** Find the most specific publication layer entry for a topic. */
export function findPublicationLayerByTopic(topicId: string): PublicationLayer | undefined {
  const topicSpecific = PUBLICATION_LAYER_REGISTRY.find((layer) =>
    layer.relatedTopicIds.includes(topicId),
  );

  if (topicSpecific) {
    return topicSpecific;
  }

  return findPublicationLayerById(GLOBAL_LAYER_ID);
}

/** List supported future publication source types. */
export function listPublicationSourceTypes(): readonly PublicationFutureSourceType[] {
  return PUBLICATION_FUTURE_SOURCE_TYPES;
}

/** List expected publication metadata fields for future integration. */
export function listExpectedMetadataFields(): readonly PublicationExpectedMetadataField[] {
  return PUBLICATION_EXPECTED_METADATA_FIELDS;
}

/** Resolve publication readiness context for a research topic. */
export function getPublicationReadinessForTopic(
  topic: ResearchTopic,
): PublicationTopicReadiness {
  const topicSpecific = PUBLICATION_LAYER_REGISTRY.find((layer) =>
    layer.relatedTopicIds.includes(topic.topicId),
  );
  const layer = topicSpecific ?? findPublicationLayerById(GLOBAL_LAYER_ID)!;

  return {
    topic,
    layer,
    isTopicSpecific: topicSpecific !== undefined,
    hasPublicationEvidenceType: topicReferencesPublicationEvidence(topic),
  };
}

/** List all publication layer readiness entries. */
export function listPublicationLayers(): readonly PublicationLayer[] {
  return PUBLICATION_LAYER_REGISTRY;
}

/** Default limitations and capabilities when no layer resolves. */
export function getDefaultPublicationLimitations(): readonly string[] {
  return PUBLICATION_LAYER_GLOBAL_LIMITATIONS;
}

export function getDefaultPublicationFutureCapabilities(): readonly string[] {
  return PUBLICATION_LAYER_FUTURE_CAPABILITIES;
}
