import type { EntityType } from "@/lib/entity/entity.types";
import type { Entity } from "@/lib/entity/entity.types";
import type { EntityRef } from "@/lib/intelligence/request.types";

/** Entity types connected in BUILD-030. */
export type SupportedEntityType = Extract<
  EntityType,
  "country" | "company" | "university"
>;

export const SUPPORTED_ENTITY_TYPES: readonly SupportedEntityType[] = [
  "country",
  "company",
  "university",
];

/** Semantic version of the entity profile evidence adapter. */
export const ENTITY_PROFILE_ADAPTER_VERSION = "0.1.0-entity-profile";

/** Stable adapter identifier — matches registry entry. */
export const ENTITY_PROFILE_ADAPTER_ID = "entity-profile";

/**
 * Result of resolving a single {@link EntityRef} against domain stores.
 */
export interface EntityResolutionResult {
  /** Composite ref key `{type}:{id}`. */
  refKey: string;
  /** Original request ref. */
  ref: EntityRef;
  /** Resolved universal entity when lookup succeeded. */
  entity?: Entity;
  /** Pre-formatted relationships summary for evidence mapping. */
  relationshipsSummary?: string;
  /** Non-fatal resolution warnings. */
  warnings: string[];
}

/**
 * Aggregated output from {@link EntityResolver.resolveSubjectEntities}.
 */
export interface EntityResolutionBatch {
  /** Successfully resolved entities ready for evidence mapping. */
  resolved: Array<{
    entity: Entity;
    relationshipsSummary?: string;
    refKey: string;
  }>;
  /** All warnings from the resolution pass. */
  warnings: string[];
}

/** Options for {@link EntityEvidenceMapper}. */
export interface EntityEvidenceMapperOptions {
  /** ISO-8601 timestamp applied to all emitted evidence sources. */
  retrievedAt: string;
}

/**
 * Returns true when the entity type is supported by BUILD-030.
 */
export function isSupportedEntityType(
  type: EntityType,
): type is SupportedEntityType {
  return (SUPPORTED_ENTITY_TYPES as readonly string[]).includes(type);
}

/**
 * Build stable composite key for an entity ref.
 */
export function entityRefKey(ref: EntityRef): string {
  return `${ref.type}:${ref.id}`;
}
