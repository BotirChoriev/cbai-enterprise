import type {
  EvidenceQualityBand,
  EvidenceQualityDimensionScore,
} from "@/lib/intelligence/evidence/quality/quality.types";
import { FRESHNESS_UNKNOWN_CONSERVATIVE_SCORE } from "@/lib/intelligence/evidence/quality/quality-rules";

/** Equal weight per quality dimension. */
export const QUALITY_DIMENSION_WEIGHT = 0.2;

/** Quality band thresholds (inclusive lower bound). */
export const QUALITY_BAND_THRESHOLDS: readonly {
  band: EvidenceQualityBand;
  min: number;
}[] = [
  { band: "excellent", min: 80 },
  { band: "high", min: 60 },
  { band: "medium", min: 40 },
  { band: "low", min: 20 },
  { band: "very-low", min: 0 },
];

/**
 * Resolve numeric score for composite when a dimension is unknown.
 */
export function resolveDimensionScoreForComposite(
  dimension: EvidenceQualityDimensionScore,
): number {
  if (dimension.status === "known" && dimension.score !== null) {
    return dimension.score;
  }

  if (dimension.id === "freshness") {
    return FRESHNESS_UNKNOWN_CONSERVATIVE_SCORE;
  }

  return 0;
}

/**
 * Compute weighted overall quality score from dimension breakdown.
 *
 * Unknown freshness uses conservative substitute score — never inflated.
 */
export function computeOverallQualityScore(
  dimensions: EvidenceQualityDimensionScore[],
): number {
  if (dimensions.length === 0) {
    return 0;
  }

  const raw = dimensions.reduce(
    (sum, dimension) =>
      sum + QUALITY_DIMENSION_WEIGHT * resolveDimensionScoreForComposite(dimension),
    0,
  );

  return Math.max(0, Math.min(100, Math.round(raw)));
}

/**
 * Resolve quality band from overall score.
 */
export function resolveQualityBand(score: number): EvidenceQualityBand {
  for (const threshold of QUALITY_BAND_THRESHOLDS) {
    if (score >= threshold.min) {
      return threshold.band;
    }
  }

  return "very-low";
}

/**
 * Compute mean overall score for a collection of item scores.
 */
export function computeMeanOverallScore(scores: number[]): number {
  if (scores.length === 0) {
    return 0;
  }

  const sum = scores.reduce((total, score) => total + score, 0);
  return Math.round(sum / scores.length);
}
