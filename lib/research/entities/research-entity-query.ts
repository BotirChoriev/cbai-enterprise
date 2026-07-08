import type { ResearchTopic } from "@/lib/research/research-topics";
import { getResearchTopicById } from "@/lib/research/research-topics";
import { RESEARCH_ENTITY_REGISTRY } from "@/lib/research/entities/research-entity-registry";
import {
  RESEARCH_ENTITY_TYPE_DEFINITIONS,
  RESEARCH_ENTITY_TYPES,
  type ResearchEntity,
  type ResearchEntityType,
  type ResearchEntityTypeDefinition,
} from "@/lib/research/entities/research-entity-types";

export type ResearchEntityRelation = {
  entity: ResearchEntity;
  relatedEntities: ResearchEntity[];
  relatedTopics: ResearchTopic[];
};

/** Find a research entity by ID. */
export function findResearchEntityById(entityId: string): ResearchEntity | undefined {
  return RESEARCH_ENTITY_REGISTRY.find((entity) => entity.entityId === entityId);
}

/** Find all research entities of a given type. */
export function findResearchEntitiesByType(
  entityType: ResearchEntityType,
): readonly ResearchEntity[] {
  return RESEARCH_ENTITY_REGISTRY.filter((entity) => entity.entityType === entityType);
}

/** Find seed entities linked to a research topic catalog ID. */
export function findResearchEntitiesByTopic(topicId: string): readonly ResearchEntity[] {
  return RESEARCH_ENTITY_REGISTRY.filter(
    (entity) =>
      entity.relatedTopicIds.includes(topicId) ||
      (entity.entityType === "research_topic" && entity.relatedTopicIds.includes(topicId)),
  );
}

/** List all supported research entity type definitions. */
export function listResearchEntityTypes(): readonly ResearchEntityTypeDefinition[] {
  return RESEARCH_ENTITY_TYPES.map((entityType) => RESEARCH_ENTITY_TYPE_DEFINITIONS[entityType]);
}

/** Resolve related entities and topics for a research object. */
export function resolveResearchEntityRelations(entityId: string): ResearchEntityRelation | undefined {
  const entity = findResearchEntityById(entityId);
  if (!entity) {
    return undefined;
  }

  const relatedEntities = entity.relatedEntityIds
    .map((relatedId) => findResearchEntityById(relatedId))
    .filter((related): related is ResearchEntity => related !== undefined);

  const relatedTopics = entity.relatedTopicIds
    .map((topicId) => getResearchTopicById(topicId))
    .filter((topic): topic is ResearchTopic => topic !== undefined);

  return { entity, relatedEntities, relatedTopics };
}

/** Entity types represented in the static seed registry. */
export function listSeededResearchEntityTypes(): readonly ResearchEntityType[] {
  const seeded = new Set<ResearchEntityType>();
  for (const entity of RESEARCH_ENTITY_REGISTRY) {
    seeded.add(entity.entityType);
  }
  return RESEARCH_ENTITY_TYPES.filter((entityType) => seeded.has(entityType));
}
