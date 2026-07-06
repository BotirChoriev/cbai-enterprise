import type {
  ConfidenceFactor,
  ConfidenceFactorId,
} from "@/lib/intelligence/confidence.types";
import type { EvidenceCollection } from "@/lib/intelligence/evidence.types";
import { buildEvidenceQualityFactor } from "@/lib/intelligence/confidence/quality-integration";

/** Canonical factor weights per Intelligence Specification §4.2 (BUILD-035). */
export const CONFIDENCE_FACTOR_WEIGHTS: Record<ConfidenceFactorId, number> = {
  "evidence-volume": 0.2,
  "source-relevance": 0.2,
  "evidence-quality": 0.2,
  "graph-connectivity": 0.2,
  "entity-signal-quality": 0.2,
};

/**
 * Returns true when the evidence collection cannot support non-zero confidence.
 *
 * Conservative gate: empty items or explicit insufficient sufficiency status
 * force score 0 and band `insufficient`.
 */
export function isEvidenceConfidenceInsufficient(
  evidence: EvidenceCollection,
): boolean {
  return (
    evidence.items.length === 0 || evidence.sufficiencyStatus === "insufficient"
  );
}

/**
 * Build the evidence volume factor from collection state only.
 *
 * Does not inspect item content — only count and sufficiency metadata.
 */
export function buildEvidenceVolumeFactor(
  evidence: EvidenceCollection,
): ConfidenceFactor {
  const weight = CONFIDENCE_FACTOR_WEIGHTS["evidence-volume"];

  if (evidence.items.length === 0) {
    const noSources =
      evidence.metadata?.status === "no-sources-connected";

    return {
      id: "evidence-volume",
      label: "Evidence Volume",
      weight,
      score: 0,
      detail: noSources
        ? "No evidence items collected — no source adapters are enabled."
        : "No evidence items collected for this request.",
    };
  }

  if (evidence.sufficiencyStatus === "insufficient") {
    return {
      id: "evidence-volume",
      label: "Evidence Volume",
      weight,
      score: 0,
      detail: `Evidence count (${evidence.items.length}) is below the minimum threshold for claim type "${evidence.claimType}".`,
    };
  }

  const scoreBySufficiency: Record<
    Exclude<EvidenceCollection["sufficiencyStatus"], "insufficient">,
    number
  > = {
    minimum: 40,
    partial: 52,
    adequate: 65,
    strong: 85,
  };

  return {
    id: "evidence-volume",
    label: "Evidence Volume",
    weight,
    score: scoreBySufficiency[evidence.sufficiencyStatus],
    detail: `${evidence.items.length} evidence item(s) collected with sufficiency status "${evidence.sufficiencyStatus}".`,
  };
}

/**
 * Build the source relevance factor from collection aggregate metadata.
 */
export function buildSourceRelevanceFactor(
  evidence: EvidenceCollection,
): ConfidenceFactor {
  const weight = CONFIDENCE_FACTOR_WEIGHTS["source-relevance"];

  if (evidence.items.length === 0) {
    return {
      id: "source-relevance",
      label: "Source Relevance",
      weight,
      score: 0,
      detail: "No relevance data — evidence collection is empty.",
    };
  }

  const score = Math.round(evidence.meanRelevance);

  return {
    id: "source-relevance",
    label: "Source Relevance",
    weight,
    score,
    detail: `Mean evidence relevance is ${score}/100 across ${evidence.items.length} item(s).`,
  };
}

/**
 * Placeholder graph connectivity factor — not evaluated in BUILD-024.
 *
 * Extension point: wire {@link GraphContext.connectivityScore} in a future build.
 */
export function buildGraphConnectivityFactor(): ConfidenceFactor {
  return {
    id: "graph-connectivity",
    label: "Graph Connectivity",
    weight: CONFIDENCE_FACTOR_WEIGHTS["graph-connectivity"],
    score: 0,
    detail:
      "Not evaluated — graph connectivity scoring deferred to a future build.",
  };
}

/**
 * Placeholder entity signal factor — not evaluated in BUILD-024.
 *
 * Extension point: incorporate entity universal scores from matched subjects.
 */
export function buildEntitySignalQualityFactor(): ConfidenceFactor {
  return {
    id: "entity-signal-quality",
    label: "Entity Signal Quality",
    weight: CONFIDENCE_FACTOR_WEIGHTS["entity-signal-quality"],
    score: 0,
    detail:
      "Not evaluated — entity signal scoring deferred to a future build.",
  };
}

/**
 * Build all canonical confidence factors including evidence quality (BUILD-035).
 */
export function buildConfidenceFactors(
  evidence: EvidenceCollection,
): ConfidenceFactor[] {
  return [
    buildEvidenceVolumeFactor(evidence),
    buildSourceRelevanceFactor(evidence),
    buildEvidenceQualityFactor(evidence),
    buildGraphConnectivityFactor(),
    buildEntitySignalQualityFactor(),
  ];
}

/**
 * Compute weighted composite confidence score from factor breakdown.
 *
 * This is evidence-quality composition — not predictive certainty.
 */
export function computeCompositeConfidenceScore(
  factors: ConfidenceFactor[],
): number {
  const raw = factors.reduce((sum, factor) => sum + factor.weight * factor.score, 0);
  return Math.max(0, Math.min(100, Math.round(raw)));
}
