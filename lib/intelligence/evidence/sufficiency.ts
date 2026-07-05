import type {
  Evidence,
  EvidenceClaimType,
  EvidenceSufficiencyStatus,
} from "@/lib/intelligence/evidence.types";
import type { EntityRef } from "@/lib/intelligence/request.types";

/**
 * Returns true when the claim type requires per-entity evidence coverage.
 */
export function isComparativeClaimType(claimType: EvidenceClaimType): boolean {
  return claimType === "comparative";
}

/**
 * Count distinct subject entities that have at least one evidence item.
 */
export function countCoveredSubjectEntities(
  items: Evidence[],
  subjectEntities: EntityRef[],
): number {
  const covered = new Set<string>();

  for (const ref of subjectEntities) {
    const hasItem = items.some(
      (item) => item.entityType === ref.type && item.entityId === ref.id,
    );

    if (hasItem) {
      covered.add(`${ref.type}:${ref.id}`);
    }
  }

  return covered.size;
}

/**
 * Conservative evidence sufficiency evaluation (BUILD-030).
 *
 * | Items | Status |
 * |-------|--------|
 * | 0 | insufficient |
 * | 1 | minimum |
 * | 2–3 | partial |
 * | 4+ | adequate (sufficient tier) |
 *
 * Comparative requests with multiple subject entities require at least one
 * evidence item per subject entity to reach `partial` or above.
 */
export function evaluateEvidenceSufficiency(
  items: Evidence[],
  claimType: EvidenceClaimType,
  subjectEntities?: EntityRef[],
): EvidenceSufficiencyStatus {
  if (items.length === 0) {
    return "insufficient";
  }

  let status = sufficiencyFromItemCount(items.length);

  if (
    isComparativeClaimType(claimType) &&
    subjectEntities &&
    subjectEntities.length > 1
  ) {
    const coveredCount = countCoveredSubjectEntities(items, subjectEntities);

    if (coveredCount < subjectEntities.length) {
      return "minimum";
    }

    status = sufficiencyFromItemCount(items.length);
  }

  return status;
}

function sufficiencyFromItemCount(count: number): EvidenceSufficiencyStatus {
  if (count <= 0) {
    return "insufficient";
  }

  if (count === 1) {
    return "minimum";
  }

  if (count <= 3) {
    return "partial";
  }

  return "adequate";
}
