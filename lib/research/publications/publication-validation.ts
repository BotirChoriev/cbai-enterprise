import { RESEARCH_TOPICS } from "@/lib/research/research-topics";
import {
  PUBLICATION_LAYER_EVIDENCE_STATUS_LABELS,
  PUBLICATION_LAYER_SOURCE_STATUS_LABELS,
  type PublicationLayerEvidenceStatus,
  type PublicationLayerSourceStatus,
  type PublicationLayer,
} from "@/lib/research/publications/publication-types";

export type PublicationLayerValidationIssue = {
  code:
    | "duplicate_publication_layer_id"
    | "broken_related_topic_id"
    | "invalid_source_status"
    | "invalid_evidence_status"
    | "empty_supported_source_types"
    | "empty_expected_metadata";
  message: string;
  publicationLayerId?: string;
};

export type PublicationLayerValidationReport = {
  valid: boolean;
  issues: PublicationLayerValidationIssue[];
};

const KNOWN_TOPIC_IDS = new Set(RESEARCH_TOPICS.map((topic) => topic.topicId));

/** Validate a publication layer registry snapshot. */
export function validatePublicationLayerRegistry(
  layers: readonly PublicationLayer[],
): PublicationLayerValidationReport {
  const issues: PublicationLayerValidationIssue[] = [];
  const seenIds = new Set<string>();

  for (const layer of layers) {
    if (seenIds.has(layer.publicationLayerId)) {
      issues.push({
        code: "duplicate_publication_layer_id",
        message: `Duplicate publicationLayerId "${layer.publicationLayerId}".`,
        publicationLayerId: layer.publicationLayerId,
      });
    }
    seenIds.add(layer.publicationLayerId);

    if (!(layer.sourceStatus in PUBLICATION_LAYER_SOURCE_STATUS_LABELS)) {
      issues.push({
        code: "invalid_source_status",
        message: `Invalid sourceStatus "${layer.sourceStatus}" for "${layer.publicationLayerId}".`,
        publicationLayerId: layer.publicationLayerId,
      });
    }

    if (!(layer.evidenceStatus in PUBLICATION_LAYER_EVIDENCE_STATUS_LABELS)) {
      issues.push({
        code: "invalid_evidence_status",
        message: `Invalid evidenceStatus "${layer.evidenceStatus}" for "${layer.publicationLayerId}".`,
        publicationLayerId: layer.publicationLayerId,
      });
    }

    if (layer.supportedSourceTypes.length === 0) {
      issues.push({
        code: "empty_supported_source_types",
        message: `No supportedSourceTypes defined for "${layer.publicationLayerId}".`,
        publicationLayerId: layer.publicationLayerId,
      });
    }

    if (layer.expectedMetadata.length === 0) {
      issues.push({
        code: "empty_expected_metadata",
        message: `No expectedMetadata defined for "${layer.publicationLayerId}".`,
        publicationLayerId: layer.publicationLayerId,
      });
    }

    for (const topicId of layer.relatedTopicIds) {
      if (!KNOWN_TOPIC_IDS.has(topicId)) {
        issues.push({
          code: "broken_related_topic_id",
          message: `Broken relatedTopicId "${topicId}" on "${layer.publicationLayerId}" — not in research topic catalog.`,
          publicationLayerId: layer.publicationLayerId,
        });
      }
    }
  }

  return { valid: issues.length === 0, issues };
}

export function isValidPublicationLayerSourceStatus(
  value: string,
): value is PublicationLayerSourceStatus {
  return value in PUBLICATION_LAYER_SOURCE_STATUS_LABELS;
}

export function isValidPublicationLayerEvidenceStatus(
  value: string,
): value is PublicationLayerEvidenceStatus {
  return value in PUBLICATION_LAYER_EVIDENCE_STATUS_LABELS;
}
