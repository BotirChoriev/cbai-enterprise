/**
 * EPIC-06 — Evidence Runtime types.
 * Categorical only — no fabricated confidence scores or numeric trust ratings.
 */

import type { EvidenceComparison, EvidenceTrace } from "@/lib/evidence/evidence-query";
import type { Evidence } from "@/lib/foundation/foundation-model";
import type { EvidenceReliability } from "@/lib/foundation/evidence-types";

export type EvidenceFreshnessCategory = "fresh" | "aging" | "outdated" | "unknown";

export type EvidenceRuntimeRecord = {
  readonly evidence: Evidence;
  readonly trace: EvidenceTrace;
  readonly freshness: EvidenceFreshnessCategory;
  readonly projectRefId: string;
  readonly projectId: string;
};

export type EvidenceRuntimeSnapshot = {
  readonly projectId: string | null;
  readonly records: readonly EvidenceRuntimeRecord[];
  readonly conflicts: readonly EvidenceComparison[];
  readonly missingKnowledge: readonly string[];
  readonly freshnessCounts: Readonly<Record<EvidenceFreshnessCategory, number>>;
  readonly reliabilityCounts: Readonly<Record<EvidenceReliability, number>>;
  readonly humanValidationPending: number;
  readonly humanValidationPartial: number;
  readonly machineValidationConnected: false;
  readonly consensus: "none" | "partial" | "aligned" | "conflicted";
  readonly limitation: string;
};

/** Trust as a property of every object — answers the eight EPIC-06 questions. */
export type EvidenceTrustSurface = {
  readonly whatWeKnow: string;
  readonly howWeKnow: string;
  readonly whoVerified: string;
  readonly whenVerified: string;
  readonly whyTrust: string;
  readonly whatMissing: string;
  readonly whatContradicts: string;
  readonly needsResearch: string;
};

export type EvidenceJourneyStage = {
  readonly id: string;
  readonly label: string;
  readonly status: "complete" | "partial" | "missing" | "attention";
  readonly detail: string;
  readonly href?: string;
};

export type EvidenceHeatmapCell = {
  readonly category: string;
  readonly count: number;
  readonly meaning: string;
};
