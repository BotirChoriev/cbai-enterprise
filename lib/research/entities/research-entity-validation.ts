import { RESEARCH_TOPICS } from "@/lib/research/research-topics";
import {
  RESEARCH_ENTITY_EVIDENCE_STATUS_LABELS,
  RESEARCH_ENTITY_SOURCE_STATUS_LABELS,
  RESEARCH_ENTITY_TYPES,
  RESEARCH_ENTITY_WORKSPACE_STATUS_LABELS,
  type ResearchEntity,
  type ResearchEntityType,
} from "@/lib/research/entities/research-entity-types";

export type ResearchEntityValidationIssue = {
  code:
    | "duplicate_entity_id"
    | "unknown_entity_type"
    | "broken_related_topic_id"
    | "broken_related_entity_id"
    | "invalid_evidence_status"
    | "invalid_source_status"
    | "invalid_workspace_status";
  message: string;
  entityId?: string;
};

export type ResearchEntityValidationReport = {
  valid: boolean;
  issues: ResearchEntityValidationIssue[];
};

const KNOWN_TOPIC_IDS = new Set(RESEARCH_TOPICS.map((topic) => topic.topicId));
const KNOWN_ENTITY_TYPES = new Set<string>(RESEARCH_ENTITY_TYPES);

function isKnownEntityType(value: string): value is ResearchEntityType {
  return KNOWN_ENTITY_TYPES.has(value);
}

/** Validate a research entity registry snapshot. */
export function validateResearchEntityRegistry(
  entities: readonly ResearchEntity[],
): ResearchEntityValidationReport {
  const issues: ResearchEntityValidationIssue[] = [];
  const seenIds = new Set<string>();
  const knownEntityIds = new Set(entities.map((entity) => entity.entityId));

  for (const entity of entities) {
    if (seenIds.has(entity.entityId)) {
      issues.push({
        code: "duplicate_entity_id",
        message: `Duplicate entity ID "${entity.entityId}".`,
        entityId: entity.entityId,
      });
    }
    seenIds.add(entity.entityId);

    if (!isKnownEntityType(entity.entityType)) {
      issues.push({
        code: "unknown_entity_type",
        message: `Unknown entity type "${entity.entityType}" for "${entity.entityId}".`,
        entityId: entity.entityId,
      });
    }

    if (!(entity.evidenceStatus in RESEARCH_ENTITY_EVIDENCE_STATUS_LABELS)) {
      issues.push({
        code: "invalid_evidence_status",
        message: `Invalid evidenceStatus "${entity.evidenceStatus}" for "${entity.entityId}".`,
        entityId: entity.entityId,
      });
    }

    if (!(entity.sourceStatus in RESEARCH_ENTITY_SOURCE_STATUS_LABELS)) {
      issues.push({
        code: "invalid_source_status",
        message: `Invalid sourceStatus "${entity.sourceStatus}" for "${entity.entityId}".`,
        entityId: entity.entityId,
      });
    }

    if (!(entity.workspaceStatus in RESEARCH_ENTITY_WORKSPACE_STATUS_LABELS)) {
      issues.push({
        code: "invalid_workspace_status",
        message: `Invalid workspaceStatus "${entity.workspaceStatus}" for "${entity.entityId}".`,
        entityId: entity.entityId,
      });
    }

    for (const topicId of entity.relatedTopicIds) {
      if (!KNOWN_TOPIC_IDS.has(topicId)) {
        issues.push({
          code: "broken_related_topic_id",
          message: `Broken relatedTopicId "${topicId}" on "${entity.entityId}" — not in research topic catalog.`,
          entityId: entity.entityId,
        });
      }
    }

    for (const relatedEntityId of entity.relatedEntityIds) {
      if (!knownEntityIds.has(relatedEntityId)) {
        issues.push({
          code: "broken_related_entity_id",
          message: `Broken relatedEntityId "${relatedEntityId}" on "${entity.entityId}" — not in entity registry.`,
          entityId: entity.entityId,
        });
      }
    }
  }

  return { valid: issues.length === 0, issues };
}
