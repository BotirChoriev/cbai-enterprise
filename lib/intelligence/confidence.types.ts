/**
 * Confidence band labels for the Confidence Assessment Layer (BUILD-024).
 *
 * Confidence measures evidence quality — not predictive certainty.
 * Bands map composite scores to human-readable justification levels.
 *
 * @see docs/CBAI-Intelligence-Specification-v1.md §4.4
 */
export type ConfidenceBand =
  | "insufficient"
  | "very-low"
  | "low"
  | "medium"
  | "high"
  | "verified";

/**
 * Canonical confidence factor identifiers aligned with
 * Intelligence Specification §4.2.
 */
export type ConfidenceFactorId =
  | "evidence-volume"
  | "source-relevance"
  | "evidence-quality"
  | "graph-connectivity"
  | "entity-signal-quality";

/**
 * A single weighted input to the confidence composite score.
 *
 * Each factor is auditable and exposed in explainability surfaces
 * on user request per Intelligence Specification §12.
 */
export interface ConfidenceFactor {
  /** Stable factor identifier. */
  id: ConfidenceFactorId;
  /** Human-readable factor label. */
  label: string;
  /** Weight in the composite sum; all factors should sum to 1.0. */
  weight: number;
  /** Normalized factor score, 0–100 inclusive. */
  score: number;
  /** Detail string describing how the score was derived. */
  detail: string;
}

/**
 * Composite evidence-quality assessment for an intelligence product.
 *
 * Answers: "How justified is this conclusion given what we know right now?"
 * Does not represent probability of future outcomes.
 *
 * @see docs/CBAI-Intelligence-Specification-v1.md §4
 * @see docs/build-035-report.md
 */
export interface ConfidenceAssessment {
  /** Composite confidence score, 0–100 inclusive. */
  score: number;
  /** Band label derived from the score. */
  band: ConfidenceBand;
  /** Weighted factor breakdown used to compute the score. */
  factors: ConfidenceFactor[];
  /** Whether confidence was reduced due to staleness, contradiction, or caps. */
  degraded: boolean;
  /** Human-readable reason when {@link degraded} is true. */
  degradationReason?: string;
  /** Quality integration summary when BUILD-034 quality data is present (BUILD-035). */
  qualityIntegration?: import("@/lib/intelligence/confidence/quality-integration").ConfidenceQualityIntegrationSummary;
}
