import type { ResearchEntity, ResearchEntityType } from "@/lib/research/entities";
import { RESEARCH_ENTITY_REGISTRY } from "@/lib/research/entities";
import type { Relationship } from "@/lib/foundation/foundation-model";
import type {
  IntelligenceEntityKind,
  IntelligenceNetwork,
  IntelligenceNetworkNode,
} from "@/lib/foundation/network-types";
import { buildRelationship } from "@/lib/relationships/relationship-builder";
import { buildIntelligenceNetwork } from "@/lib/network/network-builder";

/**
 * Maps the pre-existing lib/research/entities/ catalog onto the universal Global Intelligence
 * Network — pure translation, no new entity data, no rewrite of the entity registry. Only the
 * research entity types with an honest, direct match in INTELLIGENCE_ENTITY_KINDS are mapped;
 * "research_topic" maps to "mission" (a ResearchTopic is exactly what a Mission is about — the
 * same relationship toMission() already expresses for the topic-based adapter). "organism",
 * "disease", "method", "experiment", "open_question", and "negative_result" have no honest
 * match in the sixteen-kind vocabulary and are deliberately excluded, not forced.
 */
const RESEARCH_ENTITY_TYPE_TO_NETWORK_KIND: Partial<Record<ResearchEntityType, IntelligenceEntityKind>> =
  {
    research_topic: "mission",
    researcher: "researcher",
    laboratory: "laboratory",
    university: "university",
    technology: "technology",
    publication: "publication",
    dataset: "dataset",
    patent: "patent",
  };

export function toIntelligenceNetworkNode(
  entity: ResearchEntity,
): IntelligenceNetworkNode | undefined {
  const entityKind = RESEARCH_ENTITY_TYPE_TO_NETWORK_KIND[entity.entityType];
  if (!entityKind) {
    return undefined;
  }

  return {
    subject: {
      subjectId: entity.entityId,
      subjectLabel: entity.displayName,
      subjectKind: entity.entityType,
    },
    entityKind,
  };
}

export function toIntelligenceNetworkNodes(
  entities: readonly ResearchEntity[],
): readonly IntelligenceNetworkNode[] {
  return entities
    .map(toIntelligenceNetworkNode)
    .filter((node): node is IntelligenceNetworkNode => node !== undefined);
}

/**
 * Edges from the registry's own relatedEntityIds cross-references — real catalog links, not
 * inferred or fabricated. Only connects entities that both mapped to a real network node; an
 * edge to an excluded entity type (e.g. a research_topic's link to a "method" entity) is
 * honestly omitted rather than pointing at a node the network doesn't contain. Built through
 * buildRelationship (lib/relationships/) so confidence/limitations stay consistent with every
 * other ecosystem's edges — never constructed by hand.
 */
export function toIntelligenceNetworkEdges(
  entities: readonly ResearchEntity[],
): readonly Relationship[] {
  const networkEntityIds = new Set(
    entities
      .filter((entity) => RESEARCH_ENTITY_TYPE_TO_NETWORK_KIND[entity.entityType] !== undefined)
      .map((entity) => entity.entityId),
  );

  const seenPairs = new Set<string>();
  const edges: Relationship[] = [];

  for (const entity of entities) {
    if (!networkEntityIds.has(entity.entityId)) {
      continue;
    }

    for (const relatedId of entity.relatedEntityIds) {
      if (!networkEntityIds.has(relatedId)) {
        continue;
      }

      const pairKey = [entity.entityId, relatedId].sort().join("::");
      if (seenPairs.has(pairKey)) {
        continue;
      }
      seenPairs.add(pairKey);

      edges.push(
        buildRelationship({
          sourceId: entity.entityId,
          targetId: relatedId,
          relationshipType: "related_to",
          explanation: `"${entity.displayName}" is cross-referenced with a related entity in the Research entity registry.`,
          source: "research-entity-registry",
        }),
      );
    }
  }

  return edges;
}

/**
 * Build the Global Intelligence Network from Research Intelligence's real, already-shipped
 * entity registry. Demonstrates lib/network/ against real data without adding any new entities
 * or connections beyond what the registry already declares.
 */
export function buildResearchIntelligenceNetwork(): IntelligenceNetwork {
  const entities = RESEARCH_ENTITY_REGISTRY;
  return buildIntelligenceNetwork({
    nodes: toIntelligenceNetworkNodes(entities),
    edges: toIntelligenceNetworkEdges(entities),
  });
}
