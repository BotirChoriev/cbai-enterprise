import type { ResearchTopic } from "@/lib/research/research-topics";
import { EXPERIMENT_LAYER_REGISTRY } from "@/lib/research/experiments/experiment-registry";
import {
  EXPERIMENT_EXPECTED_METADATA_FIELDS,
  EXPERIMENT_FUTURE_TYPES,
  EXPERIMENT_LAYER_GLOBAL_LIMITATIONS,
  EXPERIMENT_LAYER_FUTURE_CAPABILITIES,
  type ExperimentExpectedMetadataField,
  type ExperimentFutureType,
  type ExperimentLayer,
} from "@/lib/research/experiments/experiment-types";

export type ExperimentTopicReadiness = {
  topic: ResearchTopic;
  layer: ExperimentLayer;
  isTopicSpecific: boolean;
  hasExperimentEvidenceType: boolean;
};

const GLOBAL_LAYER_ID = "exp-layer-readiness-global";

const EXPERIMENT_EVIDENCE_KEYWORDS = [
  "laboratory",
  "clinical",
  "experiment",
  "trial",
  "study",
  "field",
  "simulation",
] as const;

function topicReferencesExperimentEvidence(topic: ResearchTopic): boolean {
  const methodMatch = topic.relatedMethods.some((method) =>
    EXPERIMENT_EVIDENCE_KEYWORDS.some((keyword) => method.toLowerCase().includes(keyword)),
  );
  const evidenceMatch = topic.relatedEvidenceTypes.some((evidenceType) =>
    EXPERIMENT_EVIDENCE_KEYWORDS.some((keyword) => evidenceType.toLowerCase().includes(keyword)),
  );
  return methodMatch || evidenceMatch;
}

/** Find an experiment layer entry by ID. */
export function findExperimentLayerById(
  experimentLayerId: string,
): ExperimentLayer | undefined {
  return EXPERIMENT_LAYER_REGISTRY.find(
    (layer) => layer.experimentLayerId === experimentLayerId,
  );
}

/** Find the most specific experiment layer entry for a topic. */
export function findExperimentLayerByTopic(topicId: string): ExperimentLayer | undefined {
  const topicSpecific = EXPERIMENT_LAYER_REGISTRY.find((layer) =>
    layer.relatedTopicIds.includes(topicId),
  );

  if (topicSpecific) {
    return topicSpecific;
  }

  return findExperimentLayerById(GLOBAL_LAYER_ID);
}

/** List supported future experiment types. */
export function listExperimentTypes(): readonly ExperimentFutureType[] {
  return EXPERIMENT_FUTURE_TYPES;
}

/** List expected experiment metadata fields for future integration. */
export function listExpectedExperimentMetadataFields(): readonly ExperimentExpectedMetadataField[] {
  return EXPERIMENT_EXPECTED_METADATA_FIELDS;
}

/** Resolve experiment readiness context for a research topic. */
export function getExperimentReadinessForTopic(
  topic: ResearchTopic,
): ExperimentTopicReadiness {
  const topicSpecific = EXPERIMENT_LAYER_REGISTRY.find((layer) =>
    layer.relatedTopicIds.includes(topic.topicId),
  );
  const layer = topicSpecific ?? findExperimentLayerById(GLOBAL_LAYER_ID)!;

  return {
    topic,
    layer,
    isTopicSpecific: topicSpecific !== undefined,
    hasExperimentEvidenceType: topicReferencesExperimentEvidence(topic),
  };
}

/** List all experiment layer readiness entries. */
export function listExperimentLayers(): readonly ExperimentLayer[] {
  return EXPERIMENT_LAYER_REGISTRY;
}

export function getDefaultExperimentLimitations(): readonly string[] {
  return EXPERIMENT_LAYER_GLOBAL_LIMITATIONS;
}

export function getDefaultExperimentFutureCapabilities(): readonly string[] {
  return EXPERIMENT_LAYER_FUTURE_CAPABILITIES;
}
