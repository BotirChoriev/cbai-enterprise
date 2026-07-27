import {
  CONTRADICTION_REASON_CATEGORIES,
  type ContradictionLink,
  type ContradictionReasonCategory,
  type DeliberationEvidenceRecord,
} from "@/lib/scientific-deliberation/types";

export function buildContradictionLink(input: {
  readonly roomId: string;
  readonly evidenceA: DeliberationEvidenceRecord;
  readonly evidenceB: DeliberationEvidenceRecord;
  readonly reasonCategories: readonly ContradictionReasonCategory[];
  readonly explanation: string;
}): ContradictionLink | { readonly error: string } {
  if (input.evidenceA.id === input.evidenceB.id) {
    return { error: "Distinct evidence records required" };
  }
  const reasons = input.reasonCategories.filter((r) =>
    (CONTRADICTION_REASON_CATEGORIES as readonly string[]).includes(r),
  );
  if (!reasons.length) {
    return { error: "At least one evidence-backed reason category required" };
  }
  if (/because\s+they\s+are\s+wrong|proves\s+causation|causes\s+the\s+difference/i.test(input.explanation)) {
    return { error: "Unsupported causal claim language rejected" };
  }
  return {
    id: `contra-${input.evidenceA.id}-${input.evidenceB.id}`,
    roomId: input.roomId,
    evidenceIdA: input.evidenceA.id,
    evidenceIdB: input.evidenceB.id,
    reasonCategories: reasons,
    explanation: input.explanation,
    causationClaimed: false,
  };
}

export function listContradictionReasonCategories(): readonly ContradictionReasonCategory[] {
  return CONTRADICTION_REASON_CATEGORIES;
}
