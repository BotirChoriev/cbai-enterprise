/**
 * CBAI Product Constitution — canonical code-readable contract.
 * Authoritative human prose: docs/standards/01-cbai-constitution.md
 * Governance rules: lib/governance/constitution/rules.ts
 */

export const PRODUCT_CONSTITUTION_PRINCIPLES = [
  "humanity-first",
  "nature-first",
  "evidence-first",
  "no-fabrication",
  "source-before-conclusion",
  "explain-everything",
  "honest-unknowns",
  "truth-before-popularity",
  "capability-before-status",
  "knowledge-has-no-borders",
  "intelligence-has-no-passport",
  "human-accountability",
  "ai-advises-humans-decide",
  "privacy-by-default",
  "no-universal-ranking",
  "no-automatic-decisions",
  "negative-results-visible",
] as const;

export type ProductConstitutionPrinciple = (typeof PRODUCT_CONSTITUTION_PRINCIPLES)[number];

export type ConstitutionalViolation = {
  readonly principle: ProductConstitutionPrinciple;
  readonly reason: string;
};

export const HUMAN_DECISION_BOUNDARY =
  "CBAI explains facts, analysis, uncertainty, alternatives, and next paths. The human makes the final decision.";

/** Labels that must never appear without satisfying verification gates. */
export const FORBIDDEN_UNVERIFIED_LABELS = [
  "Verified",
  "Proven",
  "Confirmed scientific result",
  "Laboratory validated",
  "Patent-free",
  "Novel",
  "Expert",
  "Funded",
  "Guaranteed",
] as const;

export function assertNoFabricatedVerifiedLabel(label: string): ConstitutionalViolation | null {
  const normalized = label.trim().toLowerCase();
  for (const forbidden of FORBIDDEN_UNVERIFIED_LABELS) {
    if (normalized === forbidden.toLowerCase()) {
      return {
        principle: "no-fabrication",
        reason: `"${label}" requires explicit verification evidence — cannot be used as a default label.`,
      };
    }
  }
  return null;
}

export function assertHumanDecisionRequired(context: "funding" | "hiring" | "medical" | "legal" | "governance" | "scientific_claim"): {
  readonly required: true;
  readonly boundary: string;
  readonly principle: ProductConstitutionPrinciple;
  readonly context: typeof context;
} {
  return {
    required: true,
    boundary: HUMAN_DECISION_BOUNDARY,
    principle: "ai-advises-humans-decide",
    context,
  };
}

export function assertNoUniversalHumanRanking(payload: Record<string, unknown>): ConstitutionalViolation | null {
  const forbiddenKeys = ["overallScore", "globalRank", "universalScore", "humanScore", "leaderboardRank"];
  for (const key of forbiddenKeys) {
    if (typeof payload[key] === "number") {
      return {
        principle: "no-universal-ranking",
        reason: `Universal human ranking field "${key}" is forbidden.`,
      };
    }
  }
  return null;
}

export function assertMeasurementNotPresentedAsPhysical(input: {
  provenanceKind: string;
  displayLabel?: string;
}): ConstitutionalViolation | null {
  if (input.provenanceKind === "CALCULATED" && input.displayLabel?.toLowerCase().includes("measured")) {
    return {
      principle: "no-fabrication",
      reason: "Calculated values must not be labeled as physical measurements.",
    };
  }
  if (input.provenanceKind === "EXTRACTED" && input.displayLabel?.toLowerCase().includes("validated")) {
    return {
      principle: "evidence-first",
      reason: "Machine-extracted values require human confirmation before validation language.",
    };
  }
  return null;
}

export function getConstitutionReference(module: string): string {
  return `CBAI Product Constitution applies to ${module}. ${HUMAN_DECISION_BOUNDARY}`;
}
