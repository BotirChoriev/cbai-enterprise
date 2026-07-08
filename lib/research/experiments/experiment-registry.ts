import type { ExperimentLayer } from "@/lib/research/experiments/experiment-types";
import {
  EXPERIMENT_EXPECTED_METADATA_FIELDS,
  EXPERIMENT_FUTURE_TYPES,
  EXPERIMENT_LAYER_FUTURE_CAPABILITIES,
  EXPERIMENT_LAYER_GLOBAL_LIMITATIONS,
  EXPERIMENT_LAYER_VERSION,
} from "@/lib/research/experiments/experiment-types";
import { validateExperimentLayerRegistry } from "@/lib/research/experiments/experiment-validation";

const LAYER_VERSION = EXPERIMENT_LAYER_VERSION;

/** Readiness-only layer entries — no actual experiment records. */
export const EXPERIMENT_LAYER_REGISTRY: readonly ExperimentLayer[] = [
  {
    experimentLayerId: "exp-layer-readiness-global",
    relatedTopicIds: [],
    supportedExperimentTypes: EXPERIMENT_FUTURE_TYPES,
    expectedMetadata: EXPERIMENT_EXPECTED_METADATA_FIELDS,
    sourceStatus: "source_not_connected",
    evidenceStatus: "metadata_not_available",
    limitations: EXPERIMENT_LAYER_GLOBAL_LIMITATIONS,
    futureCapabilities: EXPERIMENT_LAYER_FUTURE_CAPABILITIES,
    negativeResultsSupported: true,
    replicationSupported: true,
    humanReviewRequired: true,
    version: LAYER_VERSION,
  },
  {
    experimentLayerId: "exp-layer-readiness-microbiology",
    relatedTopicIds: ["microbiology"],
    supportedExperimentTypes: EXPERIMENT_FUTURE_TYPES,
    expectedMetadata: EXPERIMENT_EXPECTED_METADATA_FIELDS,
    sourceStatus: "source_not_connected",
    evidenceStatus: "metadata_not_available",
    limitations: [
      ...EXPERIMENT_LAYER_GLOBAL_LIMITATIONS,
      "Laboratory records listed in catalog — experiment feeds not connected yet",
    ],
    futureCapabilities: [
      ...EXPERIMENT_LAYER_FUTURE_CAPABILITIES,
      "Support laboratory experiment and culture method metadata when sources connect",
    ],
    negativeResultsSupported: true,
    replicationSupported: true,
    humanReviewRequired: true,
    version: LAYER_VERSION,
  },
  {
    experimentLayerId: "exp-layer-readiness-antibiotic-resistance",
    relatedTopicIds: ["antibiotic-resistance"],
    supportedExperimentTypes: EXPERIMENT_FUTURE_TYPES,
    expectedMetadata: EXPERIMENT_EXPECTED_METADATA_FIELDS,
    sourceStatus: "source_not_connected",
    evidenceStatus: "metadata_not_available",
    limitations: [
      ...EXPERIMENT_LAYER_GLOBAL_LIMITATIONS,
      "Clinical studies and surveillance methods referenced — experiment metadata not available",
    ],
    futureCapabilities: [
      ...EXPERIMENT_LAYER_FUTURE_CAPABILITIES,
      "Support clinical experiment and replication study metadata when approved",
    ],
    negativeResultsSupported: true,
    replicationSupported: true,
    humanReviewRequired: true,
    version: LAYER_VERSION,
  },
  {
    experimentLayerId: "exp-layer-readiness-crispr",
    relatedTopicIds: ["crispr"],
    supportedExperimentTypes: EXPERIMENT_FUTURE_TYPES,
    expectedMetadata: EXPERIMENT_EXPECTED_METADATA_FIELDS,
    sourceStatus: "future_integration_required",
    evidenceStatus: "future_integration_required",
    limitations: [
      ...EXPERIMENT_LAYER_GLOBAL_LIMITATIONS,
      "Gene editing protocols referenced in catalog — future integration required",
    ],
    futureCapabilities: [
      ...EXPERIMENT_LAYER_FUTURE_CAPABILITIES,
      "Support protocol comparison and off-target analysis metadata when sources connect",
    ],
    negativeResultsSupported: true,
    replicationSupported: true,
    humanReviewRequired: true,
    version: LAYER_VERSION,
  },
] as const;

const registryValidation = validateExperimentLayerRegistry(EXPERIMENT_LAYER_REGISTRY);

if (!registryValidation.valid) {
  const summary = registryValidation.issues.map((issue) => issue.message).join("; ");
  throw new Error(`Experiment layer registry validation failed: ${summary}`);
}
