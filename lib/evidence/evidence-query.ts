import type { Evidence } from "@/lib/foundation/foundation-model";
import type { EvidenceSourceType, VerificationStatus } from "@/lib/foundation/evidence-types";

/** Every evidence record that names the given subject among its related subjects. */
export function findEvidenceForSubject(
  evidenceList: readonly Evidence[],
  subjectId: string,
): readonly Evidence[] {
  return evidenceList.filter((item) => item.relatedSubjectIds?.includes(subjectId) ?? false);
}

/** Group evidence by source type; evidence with no known source type is grouped under "unknown". */
export function groupEvidenceBySourceType(
  evidenceList: readonly Evidence[],
): Record<EvidenceSourceType | "unknown", readonly Evidence[]> {
  const groups: Record<string, Evidence[]> = {};
  for (const item of evidenceList) {
    const key = item.sourceType ?? "unknown";
    (groups[key] ??= []).push(item);
  }
  return groups as Record<EvidenceSourceType | "unknown", readonly Evidence[]>;
}

/** Group evidence by verification status; evidence with no known status is grouped under "unknown". */
export function groupEvidenceByVerificationStatus(
  evidenceList: readonly Evidence[],
): Record<VerificationStatus | "unknown", readonly Evidence[]> {
  const groups: Record<string, Evidence[]> = {};
  for (const item of evidenceList) {
    const key = item.verificationStatus ?? "unknown";
    (groups[key] ??= []).push(item);
  }
  return groups as Record<VerificationStatus | "unknown", readonly Evidence[]>;
}

export type EvidenceComparisonRelation = "supports" | "conflicts" | "unrelated";

export interface EvidenceComparison {
  left: string;
  right: string;
  relation: EvidenceComparisonRelation;
}

/**
 * Compare two evidence records using only their own declared supporting/conflicting links —
 * never inferred from content or label similarity, which this platform cannot honestly assess.
 */
export function compareEvidence(left: Evidence, right: Evidence): EvidenceComparison {
  const supports =
    (left.supportingEvidenceIds?.includes(right.evidenceId) ?? false) ||
    (right.supportingEvidenceIds?.includes(left.evidenceId) ?? false);
  const conflicts =
    (left.conflictingEvidenceIds?.includes(right.evidenceId) ?? false) ||
    (right.conflictingEvidenceIds?.includes(left.evidenceId) ?? false);

  let relation: EvidenceComparisonRelation = "unrelated";
  if (supports) {
    relation = "supports";
  } else if (conflicts) {
    relation = "conflicts";
  }

  return { left: left.evidenceId, right: right.evidenceId, relation };
}

export interface EvidenceTrace {
  evidenceId: string;
  originalSource: string | undefined;
  originOrganization: string | undefined;
  verificationStatus: VerificationStatus | undefined;
  historyLength: number;
}

/** Trace an evidence record's origin and change history — the honest provenance chain. */
export function traceEvidence(evidence: Evidence): EvidenceTrace {
  return {
    evidenceId: evidence.evidenceId,
    originalSource: evidence.originalSource,
    originOrganization: evidence.originOrganization,
    verificationStatus: evidence.verificationStatus,
    historyLength: evidence.history?.length ?? 0,
  };
}
