/**
 * BUILD-030A — Relationship type pair validation.
 */

import type { LivingObjectType, LivingRelationshipType } from "@/lib/living-object-network/living-object.types";

const VALID_PAIRS: Partial<Record<LivingRelationshipType, readonly { source: LivingObjectType; target: LivingObjectType }[]>> = {
  member_of: [
    { source: "user", target: "organization" },
  ],
  contains: [
    { source: "organization", target: "mission" },
    { source: "mission", target: "project" },
    { source: "project", target: "research_question" },
  ],
  linked_to: [
    { source: "mission", target: "source" },
    { source: "project", target: "evidence" },
  ],
  derived_from: [{ source: "evidence", target: "source" }],
  supports: [
    { source: "evidence", target: "claim" },
    { source: "source", target: "claim" },
  ],
  contradicts: [
    { source: "evidence", target: "claim" },
  ],
  retrieved_from: [
    { source: "source", target: "publication" },
  ],
  reviewed_by: [
    { source: "evidence", target: "user" },
    { source: "source", target: "user" },
  ],
  shared_with: [
    { source: "source", target: "collaboration" },
    { source: "evidence", target: "collaboration" },
  ],
  participates_in: [
    { source: "user", target: "collaboration" },
  ],
  produced_report: [
    { source: "mission", target: "report" },
    { source: "project", target: "report" },
  ],
};

export function isValidRelationshipPair(
  type: LivingRelationshipType,
  sourceType: LivingObjectType,
  targetType: LivingObjectType,
): boolean {
  const pairs = VALID_PAIRS[type];
  if (!pairs) return false;
  return pairs.some((p) => p.source === sourceType && p.target === targetType);
}

export function assertValidRelationshipPair(
  type: LivingRelationshipType,
  sourceType: LivingObjectType,
  targetType: LivingObjectType,
): void {
  if (!isValidRelationshipPair(type, sourceType, targetType)) {
    throw new Error(`Invalid relationship pair: ${sourceType} --${type}--> ${targetType}`);
  }
}
