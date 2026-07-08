import { RESEARCH_TOPICS } from "@/lib/research/research-topics";
import {
  LABORATORY_LAYER_EVIDENCE_STATUS_LABELS,
  LABORATORY_LAYER_SOURCE_STATUS_LABELS,
  type LaboratoryLayerEvidenceStatus,
  type LaboratoryLayerSourceStatus,
  type LaboratoryLayer,
} from "@/lib/research/laboratories/laboratory-types";

export type LaboratoryLayerValidationIssue = {
  code:
    | "duplicate_laboratory_layer_id"
    | "broken_related_topic_id"
    | "invalid_source_status"
    | "invalid_evidence_status"
    | "empty_supported_lab_types"
    | "empty_expected_metadata";
  message: string;
  laboratoryLayerId?: string;
};

export type LaboratoryLayerValidationReport = {
  valid: boolean;
  issues: LaboratoryLayerValidationIssue[];
};

const KNOWN_TOPIC_IDS = new Set(RESEARCH_TOPICS.map((topic) => topic.topicId));

/** Validate a laboratory layer registry snapshot. */
export function validateLaboratoryLayerRegistry(
  layers: readonly LaboratoryLayer[],
): LaboratoryLayerValidationReport {
  const issues: LaboratoryLayerValidationIssue[] = [];
  const seenIds = new Set<string>();

  for (const layer of layers) {
    if (seenIds.has(layer.laboratoryLayerId)) {
      issues.push({
        code: "duplicate_laboratory_layer_id",
        message: `Duplicate laboratoryLayerId "${layer.laboratoryLayerId}".`,
        laboratoryLayerId: layer.laboratoryLayerId,
      });
    }
    seenIds.add(layer.laboratoryLayerId);

    if (!(layer.sourceStatus in LABORATORY_LAYER_SOURCE_STATUS_LABELS)) {
      issues.push({
        code: "invalid_source_status",
        message: `Invalid sourceStatus "${layer.sourceStatus}" for "${layer.laboratoryLayerId}".`,
        laboratoryLayerId: layer.laboratoryLayerId,
      });
    }

    if (!(layer.evidenceStatus in LABORATORY_LAYER_EVIDENCE_STATUS_LABELS)) {
      issues.push({
        code: "invalid_evidence_status",
        message: `Invalid evidenceStatus "${layer.evidenceStatus}" for "${layer.laboratoryLayerId}".`,
        laboratoryLayerId: layer.laboratoryLayerId,
      });
    }

    if (layer.supportedLabTypes.length === 0) {
      issues.push({
        code: "empty_supported_lab_types",
        message: `No supportedLabTypes defined for "${layer.laboratoryLayerId}".`,
        laboratoryLayerId: layer.laboratoryLayerId,
      });
    }

    if (layer.expectedMetadata.length === 0) {
      issues.push({
        code: "empty_expected_metadata",
        message: `No expectedMetadata defined for "${layer.laboratoryLayerId}".`,
        laboratoryLayerId: layer.laboratoryLayerId,
      });
    }

    for (const topicId of layer.relatedTopicIds) {
      if (!KNOWN_TOPIC_IDS.has(topicId)) {
        issues.push({
          code: "broken_related_topic_id",
          message: `Broken relatedTopicId "${topicId}" on "${layer.laboratoryLayerId}" — not in research topic catalog.`,
          laboratoryLayerId: layer.laboratoryLayerId,
        });
      }
    }
  }

  return { valid: issues.length === 0, issues };
}

export function isValidLaboratoryLayerSourceStatus(
  value: string,
): value is LaboratoryLayerSourceStatus {
  return value in LABORATORY_LAYER_SOURCE_STATUS_LABELS;
}

export function isValidLaboratoryLayerEvidenceStatus(
  value: string,
): value is LaboratoryLayerEvidenceStatus {
  return value in LABORATORY_LAYER_EVIDENCE_STATUS_LABELS;
}
