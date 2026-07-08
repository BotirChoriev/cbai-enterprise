import { RESEARCH_TOPICS } from "@/lib/research/research-topics";
import {
  EXPERIMENT_LAYER_EVIDENCE_STATUS_LABELS,
  EXPERIMENT_LAYER_SOURCE_STATUS_LABELS,
  type ExperimentLayerEvidenceStatus,
  type ExperimentLayerSourceStatus,
  type ExperimentLayer,
} from "@/lib/research/experiments/experiment-types";

export type ExperimentLayerValidationIssue = {
  code:
    | "duplicate_experiment_layer_id"
    | "broken_related_topic_id"
    | "invalid_source_status"
    | "invalid_evidence_status"
    | "empty_supported_experiment_types"
    | "empty_expected_metadata";
  message: string;
  experimentLayerId?: string;
};

export type ExperimentLayerValidationReport = {
  valid: boolean;
  issues: ExperimentLayerValidationIssue[];
};

const KNOWN_TOPIC_IDS = new Set(RESEARCH_TOPICS.map((topic) => topic.topicId));

/** Validate an experiment layer registry snapshot. */
export function validateExperimentLayerRegistry(
  layers: readonly ExperimentLayer[],
): ExperimentLayerValidationReport {
  const issues: ExperimentLayerValidationIssue[] = [];
  const seenIds = new Set<string>();

  for (const layer of layers) {
    if (seenIds.has(layer.experimentLayerId)) {
      issues.push({
        code: "duplicate_experiment_layer_id",
        message: `Duplicate experimentLayerId "${layer.experimentLayerId}".`,
        experimentLayerId: layer.experimentLayerId,
      });
    }
    seenIds.add(layer.experimentLayerId);

    if (!(layer.sourceStatus in EXPERIMENT_LAYER_SOURCE_STATUS_LABELS)) {
      issues.push({
        code: "invalid_source_status",
        message: `Invalid sourceStatus "${layer.sourceStatus}" for "${layer.experimentLayerId}".`,
        experimentLayerId: layer.experimentLayerId,
      });
    }

    if (!(layer.evidenceStatus in EXPERIMENT_LAYER_EVIDENCE_STATUS_LABELS)) {
      issues.push({
        code: "invalid_evidence_status",
        message: `Invalid evidenceStatus "${layer.evidenceStatus}" for "${layer.experimentLayerId}".`,
        experimentLayerId: layer.experimentLayerId,
      });
    }

    if (layer.supportedExperimentTypes.length === 0) {
      issues.push({
        code: "empty_supported_experiment_types",
        message: `No supportedExperimentTypes defined for "${layer.experimentLayerId}".`,
        experimentLayerId: layer.experimentLayerId,
      });
    }

    if (layer.expectedMetadata.length === 0) {
      issues.push({
        code: "empty_expected_metadata",
        message: `No expectedMetadata defined for "${layer.experimentLayerId}".`,
        experimentLayerId: layer.experimentLayerId,
      });
    }

    for (const topicId of layer.relatedTopicIds) {
      if (!KNOWN_TOPIC_IDS.has(topicId)) {
        issues.push({
          code: "broken_related_topic_id",
          message: `Broken relatedTopicId "${topicId}" on "${layer.experimentLayerId}" — not in research topic catalog.`,
          experimentLayerId: layer.experimentLayerId,
        });
      }
    }
  }

  return { valid: issues.length === 0, issues };
}

export function isValidExperimentLayerSourceStatus(
  value: string,
): value is ExperimentLayerSourceStatus {
  return value in EXPERIMENT_LAYER_SOURCE_STATUS_LABELS;
}

export function isValidExperimentLayerEvidenceStatus(
  value: string,
): value is ExperimentLayerEvidenceStatus {
  return value in EXPERIMENT_LAYER_EVIDENCE_STATUS_LABELS;
}
