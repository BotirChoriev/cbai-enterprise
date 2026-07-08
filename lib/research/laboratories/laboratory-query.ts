import type { ResearchTopic } from "@/lib/research/research-topics";
import { LABORATORY_LAYER_REGISTRY } from "@/lib/research/laboratories/laboratory-registry";
import {
  LABORATORY_EXPECTED_METADATA_FIELDS,
  LABORATORY_FUTURE_TYPES,
  LABORATORY_LAYER_GLOBAL_LIMITATIONS,
  LABORATORY_LAYER_FUTURE_CAPABILITIES,
  type LaboratoryExpectedMetadataField,
  type LaboratoryFutureType,
  type LaboratoryLayer,
} from "@/lib/research/laboratories/laboratory-types";

export type LaboratoryTopicReadiness = {
  topic: ResearchTopic;
  layer: LaboratoryLayer;
  isTopicSpecific: boolean;
  hasLaboratoryEvidenceType: boolean;
};

const GLOBAL_LAYER_ID = "lab-layer-readiness-global";

const LABORATORY_EVIDENCE_KEYWORDS = [
  "laboratory",
  "lab",
  "clinical",
  "facility",
  "hospital",
  "field station",
] as const;

function topicReferencesLaboratoryEvidence(topic: ResearchTopic): boolean {
  return topic.relatedEvidenceTypes.some((evidenceType) =>
    LABORATORY_EVIDENCE_KEYWORDS.some((keyword) =>
      evidenceType.toLowerCase().includes(keyword),
    ),
  );
}

/** Find a laboratory layer entry by ID. */
export function findLaboratoryLayerById(
  laboratoryLayerId: string,
): LaboratoryLayer | undefined {
  return LABORATORY_LAYER_REGISTRY.find(
    (layer) => layer.laboratoryLayerId === laboratoryLayerId,
  );
}

/** Find the most specific laboratory layer entry for a topic. */
export function findLaboratoryLayerByTopic(topicId: string): LaboratoryLayer | undefined {
  const topicSpecific = LABORATORY_LAYER_REGISTRY.find((layer) =>
    layer.relatedTopicIds.includes(topicId),
  );

  if (topicSpecific) {
    return topicSpecific;
  }

  return findLaboratoryLayerById(GLOBAL_LAYER_ID);
}

/** List supported future laboratory types. */
export function listLaboratoryTypes(): readonly LaboratoryFutureType[] {
  return LABORATORY_FUTURE_TYPES;
}

/** List expected laboratory metadata fields for future integration. */
export function listExpectedLaboratoryMetadataFields(): readonly LaboratoryExpectedMetadataField[] {
  return LABORATORY_EXPECTED_METADATA_FIELDS;
}

/** Resolve laboratory readiness context for a research topic. */
export function getLaboratoryReadinessForTopic(
  topic: ResearchTopic,
): LaboratoryTopicReadiness {
  const topicSpecific = LABORATORY_LAYER_REGISTRY.find((layer) =>
    layer.relatedTopicIds.includes(topic.topicId),
  );
  const layer = topicSpecific ?? findLaboratoryLayerById(GLOBAL_LAYER_ID)!;

  return {
    topic,
    layer,
    isTopicSpecific: topicSpecific !== undefined,
    hasLaboratoryEvidenceType: topicReferencesLaboratoryEvidence(topic),
  };
}

/** List all laboratory layer readiness entries. */
export function listLaboratoryLayers(): readonly LaboratoryLayer[] {
  return LABORATORY_LAYER_REGISTRY;
}

export function getDefaultLaboratoryLimitations(): readonly string[] {
  return LABORATORY_LAYER_GLOBAL_LIMITATIONS;
}

export function getDefaultLaboratoryFutureCapabilities(): readonly string[] {
  return LABORATORY_LAYER_FUTURE_CAPABILITIES;
}
