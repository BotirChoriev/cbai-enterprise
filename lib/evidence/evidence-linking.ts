import type { Evidence } from "@/lib/foundation/foundation-model";

function addUniqueId(ids: readonly string[] | undefined, id: string): readonly string[] {
  const set = new Set(ids ?? []);
  set.add(id);
  return Array.from(set);
}

/** Link supporting evidence by id — deduplicated, additive, never removes existing links. */
export function linkSupportingEvidence(
  evidence: Evidence,
  supportingEvidenceId: string,
): Evidence {
  return {
    ...evidence,
    supportingEvidenceIds: addUniqueId(evidence.supportingEvidenceIds, supportingEvidenceId),
  };
}

/** Link conflicting evidence by id — deduplicated, additive, never removes existing links. */
export function linkConflictingEvidence(
  evidence: Evidence,
  conflictingEvidenceId: string,
): Evidence {
  return {
    ...evidence,
    conflictingEvidenceIds: addUniqueId(evidence.conflictingEvidenceIds, conflictingEvidenceId),
  };
}
