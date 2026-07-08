import {
  DISCOVERY_RELATIONSHIP_REASONS,
  DISCOVERY_STATUS_LABELS,
  type CrossTopicDiscovery,
  type DiscoveryRelationshipReason,
  type DiscoveryStatus,
} from "@/lib/research/discovery/discovery-types";
import { getResearchTopicById } from "@/lib/research/research-topics";

export type DiscoveryValidationIssue = {
  code:
    | "duplicate_discovery_id"
    | "self_reference"
    | "unknown_source_topic"
    | "unknown_related_topic"
    | "invalid_relationship_reason"
    | "invalid_status"
    | "missing_relationship_reason"
    | "reason_without_shared_data"
    | "mismatched_discovery_id";
  message: string;
  discoveryId?: string;
};

export type DiscoveryValidationReport = {
  valid: boolean;
  issues: DiscoveryValidationIssue[];
};

const RELATIONSHIP_REASONS = new Set<string>(DISCOVERY_RELATIONSHIP_REASONS);

function isValidRelationshipReason(value: string): value is DiscoveryRelationshipReason {
  return RELATIONSHIP_REASONS.has(value);
}

function isValidDiscoveryStatus(value: string): value is DiscoveryStatus {
  return value in DISCOVERY_STATUS_LABELS;
}

/** Validate a batch of cross-topic discovery records. */
export function validateCrossTopicDiscoveries(
  discoveries: readonly CrossTopicDiscovery[],
): DiscoveryValidationReport {
  const issues: DiscoveryValidationIssue[] = [];
  const seenIds = new Set<string>();

  for (const discovery of discoveries) {
    const expectedId = `discovery:${discovery.sourceTopicId}:${discovery.relatedTopicId}`;

    if (seenIds.has(discovery.discoveryId)) {
      issues.push({
        code: "duplicate_discovery_id",
        message: `Duplicate discoveryId "${discovery.discoveryId}".`,
        discoveryId: discovery.discoveryId,
      });
    }
    seenIds.add(discovery.discoveryId);

    if (discovery.discoveryId !== expectedId) {
      issues.push({
        code: "mismatched_discovery_id",
        message: `Expected discoveryId "${expectedId}" but found "${discovery.discoveryId}".`,
        discoveryId: discovery.discoveryId,
      });
    }

    if (discovery.sourceTopicId === discovery.relatedTopicId) {
      issues.push({
        code: "self_reference",
        message: `Discovery "${discovery.discoveryId}" references the same topic twice.`,
        discoveryId: discovery.discoveryId,
      });
    }

    if (!getResearchTopicById(discovery.sourceTopicId)) {
      issues.push({
        code: "unknown_source_topic",
        message: `Unknown sourceTopicId "${discovery.sourceTopicId}".`,
        discoveryId: discovery.discoveryId,
      });
    }

    if (!getResearchTopicById(discovery.relatedTopicId)) {
      issues.push({
        code: "unknown_related_topic",
        message: `Unknown relatedTopicId "${discovery.relatedTopicId}".`,
        discoveryId: discovery.discoveryId,
      });
    }

    if (discovery.relationshipReasons.length === 0) {
      issues.push({
        code: "missing_relationship_reason",
        message: `Discovery "${discovery.discoveryId}" has no relationship reasons.`,
        discoveryId: discovery.discoveryId,
      });
    }

    for (const reason of discovery.relationshipReasons) {
      if (!isValidRelationshipReason(reason)) {
        issues.push({
          code: "invalid_relationship_reason",
          message: `Invalid relationship reason "${reason}" on "${discovery.discoveryId}".`,
          discoveryId: discovery.discoveryId,
        });
      }
    }

    if (!isValidDiscoveryStatus(discovery.status)) {
      issues.push({
        code: "invalid_status",
        message: `Invalid status "${discovery.status}" on "${discovery.discoveryId}".`,
        discoveryId: discovery.discoveryId,
      });
    }

    if (
      discovery.relationshipReasons.includes("same_domain") &&
      discovery.sharedDomain === null
    ) {
      issues.push({
        code: "reason_without_shared_data",
        message: `Discovery "${discovery.discoveryId}" claims same_domain without sharedDomain.`,
        discoveryId: discovery.discoveryId,
      });
    }

    if (
      discovery.relationshipReasons.includes("shared_method") &&
      discovery.sharedMethods.length === 0
    ) {
      issues.push({
        code: "reason_without_shared_data",
        message: `Discovery "${discovery.discoveryId}" claims shared_method without sharedMethods.`,
        discoveryId: discovery.discoveryId,
      });
    }

    if (
      discovery.relationshipReasons.includes("shared_evidence_type") &&
      discovery.sharedEvidenceTypes.length === 0
    ) {
      issues.push({
        code: "reason_without_shared_data",
        message: `Discovery "${discovery.discoveryId}" claims shared_evidence_type without sharedEvidenceTypes.`,
        discoveryId: discovery.discoveryId,
      });
    }

    if (
      discovery.relationshipReasons.includes("shared_future_object") &&
      discovery.futureObjects.length === 0
    ) {
      issues.push({
        code: "reason_without_shared_data",
        message: `Discovery "${discovery.discoveryId}" claims shared_future_object without futureObjects.`,
        discoveryId: discovery.discoveryId,
      });
    }
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}
