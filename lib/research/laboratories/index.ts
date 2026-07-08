export {
  LABORATORY_FUTURE_TYPES,
  LABORATORY_EXPECTED_METADATA_FIELDS,
  LABORATORY_LAYER_SOURCE_STATUS_LABELS,
  LABORATORY_LAYER_EVIDENCE_STATUS_LABELS,
  LABORATORY_EXPECTED_METADATA_LABELS,
  LABORATORY_LAYER_VERSION,
  LABORATORY_LAYER_GLOBAL_LIMITATIONS,
  LABORATORY_LAYER_FUTURE_CAPABILITIES,
  LABORATORY_TOPIC_NOT_CONNECTED_MESSAGE,
  type LaboratoryFutureType,
  type LaboratoryExpectedMetadataField,
  type LaboratoryLayerSourceStatus,
  type LaboratoryLayerEvidenceStatus,
  type LaboratoryLayer,
} from "@/lib/research/laboratories/laboratory-types";

export { LABORATORY_LAYER_REGISTRY } from "@/lib/research/laboratories/laboratory-registry";

export {
  findLaboratoryLayerById,
  findLaboratoryLayerByTopic,
  listLaboratoryTypes,
  listExpectedLaboratoryMetadataFields,
  getLaboratoryReadinessForTopic,
  listLaboratoryLayers,
  getDefaultLaboratoryLimitations,
  getDefaultLaboratoryFutureCapabilities,
  type LaboratoryTopicReadiness,
} from "@/lib/research/laboratories/laboratory-query";

export {
  validateLaboratoryLayerRegistry,
  isValidLaboratoryLayerSourceStatus,
  isValidLaboratoryLayerEvidenceStatus,
  type LaboratoryLayerValidationIssue,
  type LaboratoryLayerValidationReport,
} from "@/lib/research/laboratories/laboratory-validation";
