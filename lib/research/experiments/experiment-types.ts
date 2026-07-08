export const EXPERIMENT_FUTURE_TYPES = [
  "Laboratory experiment",
  "Field experiment",
  "Clinical experiment",
  "Computational experiment",
  "Simulation",
  "Replication study",
  "Longitudinal study",
  "Pilot study",
  "Negative result",
  "Protocol comparison",
] as const;

export type ExperimentFutureType = (typeof EXPERIMENT_FUTURE_TYPES)[number];

export const EXPERIMENT_EXPECTED_METADATA_FIELDS = [
  "experimentTitle",
  "researchQuestion",
  "method",
  "materials",
  "variables",
  "controls",
  "sampleSize",
  "environment",
  "duration",
  "results",
  "limitations",
  "replicationStatus",
  "negativeResultStatus",
  "datasetReference",
  "ethicsApproval",
  "sourceUrl",
] as const;

export type ExperimentExpectedMetadataField =
  (typeof EXPERIMENT_EXPECTED_METADATA_FIELDS)[number];

export type ExperimentLayerSourceStatus =
  | "source_not_connected"
  | "metadata_not_available"
  | "future_integration_required";

export type ExperimentLayerEvidenceStatus =
  | "source_not_connected"
  | "metadata_not_available"
  | "future_integration_required";

export type ExperimentLayer = {
  experimentLayerId: string;
  relatedTopicIds: readonly string[];
  supportedExperimentTypes: readonly ExperimentFutureType[];
  expectedMetadata: readonly ExperimentExpectedMetadataField[];
  sourceStatus: ExperimentLayerSourceStatus;
  evidenceStatus: ExperimentLayerEvidenceStatus;
  limitations: readonly string[];
  futureCapabilities: readonly string[];
  negativeResultsSupported: boolean;
  replicationSupported: boolean;
  humanReviewRequired: boolean;
  version: string;
};

export const EXPERIMENT_LAYER_SOURCE_STATUS_LABELS: Record<
  ExperimentLayerSourceStatus,
  string
> = {
  source_not_connected: "Source not connected",
  metadata_not_available: "Metadata not available",
  future_integration_required: "Future integration required",
};

export const EXPERIMENT_LAYER_EVIDENCE_STATUS_LABELS: Record<
  ExperimentLayerEvidenceStatus,
  string
> = {
  source_not_connected: "Source not connected",
  metadata_not_available: "Metadata not available",
  future_integration_required: "Future integration required",
};

export const EXPERIMENT_EXPECTED_METADATA_LABELS: Record<
  ExperimentExpectedMetadataField,
  string
> = {
  experimentTitle: "Experiment title",
  researchQuestion: "Research question",
  method: "Method",
  materials: "Materials",
  variables: "Variables",
  controls: "Controls",
  sampleSize: "Sample size",
  environment: "Environment",
  duration: "Duration",
  results: "Results",
  limitations: "Limitations",
  replicationStatus: "Replication status",
  negativeResultStatus: "Negative result status",
  datasetReference: "Dataset reference",
  ethicsApproval: "Ethics approval",
  sourceUrl: "Source URL",
};

export const EXPERIMENT_LAYER_VERSION = "1.0.0";

export const EXPERIMENT_LAYER_GLOBAL_LIMITATIONS = [
  "No live experiment records in the catalog",
  "No researcher profiles connected to experiments",
  "No methods recorded as completed studies",
  "No results or sample sizes available",
  "No replication or negative result records connected",
  "Human review required before any future experiment claim",
] as const;

export const EXPERIMENT_LAYER_FUTURE_CAPABILITIES = [
  "Connect experiment record feeds when official integrations are approved",
  "Track methods, variables, controls, and environment metadata",
  "Document replication status and negative results honestly",
  "Link experiment records to topics, datasets, and publications",
  "Surface limitations and ethics approval when sources connect",
] as const;

export const EXPERIMENT_TOPIC_NOT_CONNECTED_MESSAGE =
  "Experiment records are not connected yet.";
