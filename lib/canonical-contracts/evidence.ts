/**
 * Evidence ownership contracts (Stage 1).
 * EvidenceItem ≠ Source ≠ Claim. Canonical UI route: /knowledge.
 */

export type CanonicalEvidenceKind = "evidence_item" | "source" | "claim";

export type CanonicalEvidenceRef = {
  readonly kind: CanonicalEvidenceKind;
  readonly id: string;
};

export const EVIDENCE_OWNERSHIP = {
  canonicalRoute: "/knowledge",
  canonicalModules: [
    "lib/evidence-explorer.ts",
    "components/evidence",
  ] as const,
  researchDomainAdapter: "lib/research",
  quarantineDuplicate: "lib/intelligence/evidence",
  forensicsIsSeparate: true,
  doNotTreatClaimAsEvidenceItem: true,
} as const;

export type EvidenceContractNotes = {
  readonly known?: string;
  readonly unknown?: string;
  readonly contradiction?: string;
  readonly needsReview?: string;
  readonly provenance?: string;
  readonly lastVerified?: string;
  readonly sourceType?: string;
  readonly humanReviewBoundary?: string;
};
