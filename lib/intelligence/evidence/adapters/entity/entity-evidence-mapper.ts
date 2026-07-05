import type { Entity } from "@/lib/entity/entity.types";
import type { Evidence } from "@/lib/intelligence/evidence.types";
import type { EntityEvidenceMapperOptions } from "@/lib/intelligence/evidence/adapters/entity/types";

/** Maximum evidence items emitted per resolved entity (BUILD-030). */
export const MAX_EVIDENCE_ITEMS_PER_ENTITY = 6;

const SOURCE_LABEL = "CBAI Entity Profile";

interface EvidenceDraft {
  id: string;
  relevance: number;
  excerpt: string;
}

/**
 * Deterministic mapper from universal {@link Entity} records to {@link Evidence} items.
 *
 * Excerpts are quoted or templated from entity fields only — no LLM synthesis.
 */
export class EntityEvidenceMapper {
  /**
   * Map a resolved entity to up to {@link MAX_EVIDENCE_ITEMS_PER_ENTITY} evidence items.
   */
  mapEntity(
    entity: Entity,
    options: EntityEvidenceMapperOptions,
    relationshipsSummary?: string,
  ): Evidence[] {
    const baseId = `${entity.type}:${entity.id}`;
    const sourceBase = {
      class: "entity-profile" as const,
      ref: baseId,
      label: SOURCE_LABEL,
      provenanceStrength: "inferred" as const,
      retrievedAt: options.retrievedAt,
    };

    const drafts: EvidenceDraft[] = [
      {
        id: `${baseId}:overview`,
        relevance: 75,
        excerpt: entity.overview,
      },
      {
        id: `${baseId}:ai-summary`,
        relevance: 70,
        excerpt: `Platform assessment: ${entity.aiSummary}`,
      },
      {
        id: `${baseId}:scores`,
        relevance: 65,
        excerpt: formatScoresExcerpt(entity),
      },
      {
        id: `${baseId}:classification`,
        relevance: 55,
        excerpt: formatClassificationExcerpt(entity),
      },
    ];

    if (relationshipsSummary) {
      drafts.push({
        id: `${baseId}:relationships`,
        relevance: 50,
        excerpt: relationshipsSummary,
      });
    }

    drafts.push({
      id: `${baseId}:signals`,
      relevance: 50,
      excerpt: formatRiskOpportunitySignals(entity),
    });

    return drafts.slice(0, MAX_EVIDENCE_ITEMS_PER_ENTITY).map((draft) => ({
      id: draft.id,
      entityId: entity.id,
      entityType: entity.type,
      entityName: entity.name,
      source: { ...sourceBase },
      relevance: draft.relevance,
      excerpt: draft.excerpt,
      staleness: "fresh" as const,
    }));
  }
}

function formatScoresExcerpt(entity: Entity): string {
  return `AI Score: ${entity.scores.aiScore}/100. Investment Score: ${entity.scores.investmentScore}/100. Risk Score: ${entity.scores.riskScore}/100.`;
}

function formatClassificationExcerpt(entity: Entity): string {
  const subtitle = entity.subtitle ? ` · ${entity.subtitle}` : "";
  return `Classification: ${entity.category}${subtitle}. Entity status: ${entity.status}.`;
}

function formatRiskOpportunitySignals(entity: Entity): string {
  return [
    `Investment signal (platform-assessed): ${entity.scores.investmentScore}/100.`,
    `Risk signal (platform-assessed): ${entity.scores.riskScore}/100.`,
    `AI readiness signal (platform-assessed): ${entity.scores.aiScore}/100.`,
  ].join(" ");
}

/** Shared default mapper singleton. */
export const defaultEntityEvidenceMapper = new EntityEvidenceMapper();
