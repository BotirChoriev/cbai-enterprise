import type { ConfidenceAssessment } from "@/lib/intelligence/confidence.types";
import type { EvidenceCollection } from "@/lib/intelligence/evidence.types";
import type { IntelligenceRequest } from "@/lib/intelligence/request.types";
import type { SourceTrustLevel } from "@/lib/intelligence/trust.types";
import { clampTrustScore } from "@/lib/intelligence/trust/levels";
import {
  TRUST_CAP_DUPLICATE_CONTENT,
  TRUST_CAP_LOW_QUALITY,
  TRUST_CAP_MISSING_FRESHNESS,
  TRUST_CAP_QUALITY_UNKNOWN,
  TRUST_CAP_WEAK_PROVENANCE,
  TRUST_QUALITY_UNKNOWN_SCORE_CAP,
} from "@/lib/intelligence/trust/quality-integration";

/** Cap applied when no evidence items are available. */
export const TRUST_CAP_NO_EVIDENCE = "no-evidence";

/** Cap applied when evidence sufficiency is insufficient. */
export const TRUST_CAP_INSUFFICIENT_EVIDENCE = "insufficient-evidence";

/** Cap applied when no source adapters are connected. */
export const TRUST_CAP_NO_SOURCES_CONNECTED = "no-sources-connected";

/** Cap applied when upstream confidence assessment is degraded. */
export const TRUST_CAP_CONFIDENCE_DEGRADED = "confidence-degraded";

/** Cap applied when evidence contradiction is unresolved. */
export const TRUST_CAP_CONTRADICTION_OPEN = "contradiction-open";

export {
  TRUST_CAP_DUPLICATE_CONTENT,
  TRUST_CAP_LOW_QUALITY,
  TRUST_CAP_MISSING_FRESHNESS,
  TRUST_CAP_QUALITY_UNKNOWN,
  TRUST_CAP_WEAK_PROVENANCE,
} from "@/lib/intelligence/trust/quality-integration";

/**
 * Returns true when evidence cannot support any non-zero trust score.
 *
 * Trust may never exceed available evidence (BUILD-025 rule).
 */
export function isTrustEvidenceInsufficient(
  evidence: EvidenceCollection,
): boolean {
  return (
    evidence.items.length === 0 || evidence.sufficiencyStatus === "insufficient"
  );
}

/**
 * Compute trust score from evidence collection state only.
 *
 * **Rule:** Never derive trust score from {@link ConfidenceAssessment}.
 * Confidence measures reasoning certainty; trust measures organizational reliance.
 */
export function computeTrustScoreFromEvidence(
  evidence: EvidenceCollection,
): number {
  if (isTrustEvidenceInsufficient(evidence)) {
    return 0;
  }

  const sufficiencyBase: Record<
    Exclude<EvidenceCollection["sufficiencyStatus"], "insufficient">,
    number
  > = {
    minimum: 20,
    partial: 32,
    adequate: 45,
    strong: 70,
  };

  const status = evidence.sufficiencyStatus;

  if (status === "insufficient") {
    return 0;
  }

  const base = sufficiencyBase[status];

  // Diversity of source classes supports reliance — capped conservatively.
  const diversityBonus = Math.min(15, evidence.sourceClassCount * 5);

  // Mean relevance contributes to trust grounding, not confidence reuse.
  const relevanceContribution = Math.round(evidence.meanRelevance * 0.15);

  return clampTrustScore(base + diversityBonus + relevanceContribution);
}

/**
 * Derive the highest document/feed source trust from evidence items.
 *
 * BUILD-025: returns undefined when no document or external-feed evidence exists.
 */
export function resolveSourceTrustLevel(
  evidence: EvidenceCollection,
): SourceTrustLevel | undefined {
  const documentClasses = new Set(["document", "external-feed"]);

  const hasDocumentEvidence = evidence.items.some((item) =>
    documentClasses.has(item.source.class),
  );

  if (!hasDocumentEvidence) {
    return undefined;
  }

  // Future: inspect provenanceStrength per item. Conservative default:
  return "unverified";
}

/**
 * Build human-readable trust reason from evidence state.
 */
export function buildTrustReason(
  evidence: EvidenceCollection,
  capsApplied: string[],
): string {
  if (evidence.items.length === 0) {
    if (capsApplied.includes(TRUST_CAP_NO_SOURCES_CONNECTED)) {
      return "No verified evidence available — source adapters are not connected.";
    }

    return "No verified evidence available.";
  }

  if (evidence.sufficiencyStatus === "insufficient") {
    return "Evidence sufficiency is insufficient — organizational reliance is not supported.";
  }

  if (capsApplied.includes(TRUST_CAP_CONTRADICTION_OPEN)) {
    return "Unresolved evidence contradiction — trust capped pending review.";
  }

  return "Trust derived from available evidence signals — subject to governance caps.";
}

/**
 * Apply governance caps to trust without copying confidence score.
 *
 * Confidence may inform caps (e.g. degraded upstream) but must never
 * be used as the trust score (BUILD-025 separation rule).
 */
export function buildTrustCaps(
  request: IntelligenceRequest,
  evidence: EvidenceCollection,
  confidence: ConfidenceAssessment,
): string[] {
  void request;

  const caps: string[] = [];

  if (evidence.items.length === 0) {
    caps.push(TRUST_CAP_NO_EVIDENCE);

    if (evidence.metadata?.status === "no-sources-connected") {
      caps.push(TRUST_CAP_NO_SOURCES_CONNECTED);
    }
  }

  if (evidence.sufficiencyStatus === "insufficient") {
    caps.push(TRUST_CAP_INSUFFICIENT_EVIDENCE);
  }

  if (confidence.degraded) {
    caps.push(TRUST_CAP_CONFIDENCE_DEGRADED);
  }

  if (
    evidence.contradictionState === "detected" ||
    evidence.contradictionState === "deferred" ||
    evidence.contradictionState === "unresolvable"
  ) {
    caps.push(TRUST_CAP_CONTRADICTION_OPEN);
  }

  return caps;
}

/**
 * Apply caps to trust score — returns capped score without referencing confidence value.
 */
export function applyTrustScoreCaps(
  score: number,
  capsApplied: string[],
): number {
  if (
    capsApplied.includes(TRUST_CAP_NO_EVIDENCE) ||
    capsApplied.includes(TRUST_CAP_INSUFFICIENT_EVIDENCE)
  ) {
    return 0;
  }

  let capped = score;

  if (capsApplied.includes(TRUST_CAP_QUALITY_UNKNOWN)) {
    capped = Math.min(capped, TRUST_QUALITY_UNKNOWN_SCORE_CAP);
  }

  if (capsApplied.includes(TRUST_CAP_LOW_QUALITY)) {
    capped = Math.min(capped, 35);
  }

  if (capsApplied.includes(TRUST_CAP_WEAK_PROVENANCE)) {
    capped = Math.min(capped, 45);
  }

  if (capsApplied.includes(TRUST_CAP_MISSING_FRESHNESS)) {
    capped = Math.min(capped, 50);
  }

  if (capsApplied.includes(TRUST_CAP_DUPLICATE_CONTENT)) {
    capped = Math.min(capped, 40);
  }

  if (capsApplied.includes(TRUST_CAP_CONTRADICTION_OPEN)) {
    capped = Math.min(capped, 25);
  }

  if (capsApplied.includes(TRUST_CAP_CONFIDENCE_DEGRADED)) {
    capped = Math.min(capped, 50);
  }

  return clampTrustScore(capped);
}

/**
 * When caps force zero trust, resolve level and permissions to unverified baseline.
 */
export function isTrustScoreCappedToZero(capsApplied: string[]): boolean {
  return (
    capsApplied.includes(TRUST_CAP_NO_EVIDENCE) ||
    capsApplied.includes(TRUST_CAP_INSUFFICIENT_EVIDENCE)
  );
}
