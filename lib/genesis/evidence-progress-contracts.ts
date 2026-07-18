/**
 * Evidence-based progress architecture contracts — honest empty states when indicators are not connected.
 * CBAI does not replace official statistics bodies or create universal scores.
 */

import type { GenesisEvidenceRef } from "@/lib/genesis/genesis-types";

export type IndependentSourceRef = {
  readonly id: string;
  readonly label: string;
  readonly publisher: string;
  readonly url?: string | null;
  readonly connected: boolean;
};

export type IndicatorContract = {
  readonly id: string;
  readonly label: string;
  readonly unit: string;
  readonly sourceId: string;
  readonly methodology: string;
  readonly connected: boolean;
};

export type EvidenceProgressSnapshot = {
  readonly indicatorId: string;
  readonly baseline?: string | null;
  readonly reportingPeriod: string;
  readonly currentEvidence: readonly GenesisEvidenceRef[];
  readonly changeDescription?: string | null;
  readonly limitations: readonly string[];
  readonly contradictions: readonly string[];
  readonly contributionClaimIds: readonly string[];
  readonly humanReviewRequired: boolean;
  readonly emptyReason?: string | null;
};

export function buildEmptyEvidenceProgressSnapshot(
  indicatorId: string,
  period: string,
): EvidenceProgressSnapshot {
  return {
    indicatorId,
    reportingPeriod: period,
    currentEvidence: [],
    limitations: ["External indicator source not connected."],
    contradictions: [],
    contributionClaimIds: [],
    humanReviewRequired: true,
    emptyReason: "No live monitoring — implement data contracts only until sources connect.",
  };
}

/** CBAI must never expose a single universal score for countries, organizations, or humans. */
export function assertNoUniversalCbaiScore(metrics: Record<string, unknown>): boolean {
  const forbidden = [
    "universalScore",
    "countryScore",
    "organizationScore",
    "universityScore",
    "scientistScore",
    "teamScore",
    "humanScore",
  ];
  return !forbidden.some((key) => key in metrics);
}
