export {
  PUBLICATION_FUTURE_SOURCE_TYPES,
  PUBLICATION_EXPECTED_METADATA_FIELDS,
  PUBLICATION_LAYER_SOURCE_STATUS_LABELS,
  PUBLICATION_LAYER_EVIDENCE_STATUS_LABELS,
  PUBLICATION_EXPECTED_METADATA_LABELS,
  PUBLICATION_LAYER_VERSION,
  PUBLICATION_LAYER_GLOBAL_LIMITATIONS,
  PUBLICATION_LAYER_FUTURE_CAPABILITIES,
  PUBLICATION_TOPIC_NOT_CONNECTED_MESSAGE,
  type PublicationFutureSourceType,
  type PublicationExpectedMetadataField,
  type PublicationLayerSourceStatus,
  type PublicationLayerEvidenceStatus,
  type PublicationLayer,
} from "@/lib/research/publications/publication-types";

export { PUBLICATION_LAYER_REGISTRY } from "@/lib/research/publications/publication-registry";

export {
  findPublicationLayerById,
  findPublicationLayerByTopic,
  listPublicationSourceTypes,
  listExpectedMetadataFields,
  getPublicationReadinessForTopic,
  listPublicationLayers,
  getDefaultPublicationLimitations,
  getDefaultPublicationFutureCapabilities,
  type PublicationTopicReadiness,
} from "@/lib/research/publications/publication-query";

export {
  validatePublicationLayerRegistry,
  isValidPublicationLayerSourceStatus,
  isValidPublicationLayerEvidenceStatus,
  type PublicationLayerValidationIssue,
  type PublicationLayerValidationReport,
} from "@/lib/research/publications/publication-validation";
