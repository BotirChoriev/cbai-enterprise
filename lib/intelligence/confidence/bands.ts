import type { ConfidenceBand } from "@/lib/intelligence/confidence.types";

/** Minimum score for the `verified` band inclusive. */
export const CONFIDENCE_BAND_VERIFIED_MIN = 81;

/** Minimum score for the `high` band inclusive. */
export const CONFIDENCE_BAND_HIGH_MIN = 61;

/** Minimum score for the `medium` band inclusive. */
export const CONFIDENCE_BAND_MEDIUM_MIN = 41;

/** Minimum score for the `low` band inclusive. */
export const CONFIDENCE_BAND_LOW_MIN = 21;

/** Minimum score for the `very-low` band inclusive. */
export const CONFIDENCE_BAND_VERY_LOW_MIN = 1;

/** Ordered confidence bands from highest to lowest justification. */
export const CONFIDENCE_BANDS_DESCENDING: readonly ConfidenceBand[] = [
  "verified",
  "high",
  "medium",
  "low",
  "very-low",
  "insufficient",
] as const;

/**
 * Human-readable labels for confidence bands in explainability surfaces.
 */
export const CONFIDENCE_BAND_LABELS: Record<ConfidenceBand, string> = {
  insufficient: "Insufficient",
  "very-low": "Very Low",
  low: "Low",
  medium: "Medium",
  high: "High",
  verified: "Verified",
};

/**
 * Clamp a raw score to the 0–100 inclusive confidence range.
 */
export function clampConfidenceScore(score: number): number {
  if (!Number.isFinite(score)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Resolve a composite confidence score to a {@link ConfidenceBand}.
 *
 * Mapping is conservative by design — high bands require strong evidence
 * support in future builds. With BUILD-024 evidence-only scoring, empty
 * collections resolve to `insufficient`.
 */
export function resolveConfidenceBand(score: number): ConfidenceBand {
  const clamped = clampConfidenceScore(score);

  if (clamped >= CONFIDENCE_BAND_VERIFIED_MIN) {
    return "verified";
  }

  if (clamped >= CONFIDENCE_BAND_HIGH_MIN) {
    return "high";
  }

  if (clamped >= CONFIDENCE_BAND_MEDIUM_MIN) {
    return "medium";
  }

  if (clamped >= CONFIDENCE_BAND_LOW_MIN) {
    return "low";
  }

  if (clamped >= CONFIDENCE_BAND_VERY_LOW_MIN) {
    return "very-low";
  }

  return "insufficient";
}

/**
 * Returns true when a band represents insufficient justification for action.
 */
export function isInsufficientConfidenceBand(band: ConfidenceBand): boolean {
  return band === "insufficient" || band === "very-low";
}
