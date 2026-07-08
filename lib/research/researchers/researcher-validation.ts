import { RESEARCH_TOPICS } from "@/lib/research/research-topics";
import {
  RESEARCHER_LAYER_EVIDENCE_STATUS_LABELS,
  RESEARCHER_LAYER_SOURCE_STATUS_LABELS,
  type ResearcherLayerEvidenceStatus,
  type ResearcherLayerSourceStatus,
  type ResearcherLayer,
} from "@/lib/research/researchers/researcher-types";

export type ResearcherLayerValidationIssue = {
  code:
    | "duplicate_researcher_layer_id"
    | "broken_related_topic_id"
    | "invalid_source_status"
    | "invalid_evidence_status"
    | "empty_supported_researcher_types"
    | "empty_expected_profile_metadata"
    | "empty_verification_sources";
  message: string;
  researcherLayerId?: string;
};

export type ResearcherLayerValidationReport = {
  valid: boolean;
  issues: ResearcherLayerValidationIssue[];
};

const KNOWN_TOPIC_IDS = new Set(RESEARCH_TOPICS.map((topic) => topic.topicId));

/** Validate a researcher layer registry snapshot. */
export function validateResearcherLayerRegistry(
  layers: readonly ResearcherLayer[],
): ResearcherLayerValidationReport {
  const issues: ResearcherLayerValidationIssue[] = [];
  const seenIds = new Set<string>();

  for (const layer of layers) {
    if (seenIds.has(layer.researcherLayerId)) {
      issues.push({
        code: "duplicate_researcher_layer_id",
        message: `Duplicate researcherLayerId "${layer.researcherLayerId}".`,
        researcherLayerId: layer.researcherLayerId,
      });
    }
    seenIds.add(layer.researcherLayerId);

    if (!(layer.sourceStatus in RESEARCHER_LAYER_SOURCE_STATUS_LABELS)) {
      issues.push({
        code: "invalid_source_status",
        message: `Invalid sourceStatus "${layer.sourceStatus}" for "${layer.researcherLayerId}".`,
        researcherLayerId: layer.researcherLayerId,
      });
    }

    if (!(layer.evidenceStatus in RESEARCHER_LAYER_EVIDENCE_STATUS_LABELS)) {
      issues.push({
        code: "invalid_evidence_status",
        message: `Invalid evidenceStatus "${layer.evidenceStatus}" for "${layer.researcherLayerId}".`,
        researcherLayerId: layer.researcherLayerId,
      });
    }

    if (layer.supportedResearcherTypes.length === 0) {
      issues.push({
        code: "empty_supported_researcher_types",
        message: `No supportedResearcherTypes defined for "${layer.researcherLayerId}".`,
        researcherLayerId: layer.researcherLayerId,
      });
    }

    if (layer.expectedProfileMetadata.length === 0) {
      issues.push({
        code: "empty_expected_profile_metadata",
        message: `No expectedProfileMetadata defined for "${layer.researcherLayerId}".`,
        researcherLayerId: layer.researcherLayerId,
      });
    }

    if (layer.verificationSources.length === 0) {
      issues.push({
        code: "empty_verification_sources",
        message: `No verificationSources defined for "${layer.researcherLayerId}".`,
        researcherLayerId: layer.researcherLayerId,
      });
    }

    for (const topicId of layer.relatedTopicIds) {
      if (!KNOWN_TOPIC_IDS.has(topicId)) {
        issues.push({
          code: "broken_related_topic_id",
          message: `Broken relatedTopicId "${topicId}" on "${layer.researcherLayerId}" — not in research topic catalog.`,
          researcherLayerId: layer.researcherLayerId,
        });
      }
    }
  }

  return { valid: issues.length === 0, issues };
}

export function isValidResearcherLayerSourceStatus(
  value: string,
): value is ResearcherLayerSourceStatus {
  return value in RESEARCHER_LAYER_SOURCE_STATUS_LABELS;
}

export function isValidResearcherLayerEvidenceStatus(
  value: string,
): value is ResearcherLayerEvidenceStatus {
  return value in RESEARCHER_LAYER_EVIDENCE_STATUS_LABELS;
}
