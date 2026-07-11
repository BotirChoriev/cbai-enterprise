import { RESEARCH_ENTITY_KINDS } from "@/lib/research-domain/research-entity-base";
import type { ResearchEntityBase } from "@/lib/research-domain/research-entity-base";
import type { PlatformValidationResult } from "@/lib/foundation/validation-types";

/**
 * Deterministic structural validation only — confirms a Research Domain entity is internally
 * honest and well-formed, not that its content is scientifically correct. Reuses the Platform
 * Core's own PlatformValidationResult (lib/foundation/validation-types.ts, EPIC-10) rather than
 * declaring a seventh independent `{ valid, issues }` interface. Empty relationships, evidence,
 * missions, organizationIds, or timeline are never issues — "missing data must remain NULL or
 * EMPTY" is the mission's own rule, not a defect this validator should flag.
 */
export function validateResearchDomainEntity(
  entity: ResearchEntityBase,
): PlatformValidationResult {
  const issues: string[] = [];

  if (!entity.entityId.trim()) {
    issues.push("Research Domain entity is missing an identity (entityId).");
  }
  if (!entity.label.trim()) {
    issues.push("Research Domain entity is missing a label.");
  }
  if (!RESEARCH_ENTITY_KINDS.includes(entity.entityKind)) {
    issues.push(`Research Domain entity has an unrecognized entityKind ("${entity.entityKind}").`);
  }

  return { valid: issues.length === 0, issues };
}

/** Validate a whole collection at once, returning only the entities that failed, paired with why. */
export function validateResearchDomainEntities(
  entities: readonly ResearchEntityBase[],
): readonly { entity: ResearchEntityBase; result: PlatformValidationResult }[] {
  return entities
    .map((entity) => ({ entity, result: validateResearchDomainEntity(entity) }))
    .filter(({ result }) => !result.valid);
}
