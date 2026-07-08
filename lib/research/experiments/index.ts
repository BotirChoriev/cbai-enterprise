export {
  EXPERIMENT_FUTURE_TYPES,
  EXPERIMENT_EXPECTED_METADATA_FIELDS,
  EXPERIMENT_LAYER_SOURCE_STATUS_LABELS,
  EXPERIMENT_LAYER_EVIDENCE_STATUS_LABELS,
  EXPERIMENT_EXPECTED_METADATA_LABELS,
  EXPERIMENT_LAYER_VERSION,
  EXPERIMENT_LAYER_GLOBAL_LIMITATIONS,
  EXPERIMENT_LAYER_FUTURE_CAPABILITIES,
  EXPERIMENT_TOPIC_NOT_CONNECTED_MESSAGE,
  type ExperimentFutureType,
  type ExperimentExpectedMetadataField,
  type ExperimentLayerSourceStatus,
  type ExperimentLayerEvidenceStatus,
  type ExperimentLayer,
} from "@/lib/research/experiments/experiment-types";

export { EXPERIMENT_LAYER_REGISTRY } from "@/lib/research/experiments/experiment-registry";

export {
  findExperimentLayerById,
  findExperimentLayerByTopic,
  listExperimentTypes,
  listExpectedExperimentMetadataFields,
  getExperimentReadinessForTopic,
  listExperimentLayers,
  getDefaultExperimentLimitations,
  getDefaultExperimentFutureCapabilities,
  type ExperimentTopicReadiness,
} from "@/lib/research/experiments/experiment-query";

export {
  validateExperimentLayerRegistry,
  isValidExperimentLayerSourceStatus,
  isValidExperimentLayerEvidenceStatus,
  type ExperimentLayerValidationIssue,
  type ExperimentLayerValidationReport,
} from "@/lib/research/experiments/experiment-validation";
