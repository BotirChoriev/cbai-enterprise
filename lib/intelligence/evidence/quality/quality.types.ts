/**
 * Evidence quality band per BUILD-034 scoring model.
 */
export type EvidenceQualityBand =
  | "very-low"
  | "low"
  | "medium"
  | "high"
  | "excellent";

/**
 * Canonical quality dimension identifiers.
 */
export type EvidenceQualityDimensionId =
  | "completeness"
  | "provenance"
  | "relevance"
  | "freshness"
  | "consistency";

/**
 * Whether a dimension score could be determined from available metadata.
 */
export type EvidenceQualityDimensionStatus = "known" | "unknown";

/**
 * Score for a single quality dimension.
 */
export interface EvidenceQualityDimensionScore {
  id: EvidenceQualityDimensionId;
  label: string;
  /** 0–100 when known; null when freshness cannot be determined. */
  score: number | null;
  status: EvidenceQualityDimensionStatus;
  detail: string;
}

/**
 * Per-item quality assessment attached after evidence collection.
 */
export interface EvidenceQualityAssessment {
  dimensions: EvidenceQualityDimensionScore[];
  /** Composite quality score 0–100. */
  overallScore: number;
  band: EvidenceQualityBand;
  /** Item-level quality warnings — factual only. */
  warnings: string[];
  /** ISO-8601 timestamp when assessment completed. */
  assessedAt: string;
  /** Stable assessor identifier. */
  assessorId: string;
  /** Assessor semantic version. */
  assessorVersion: string;
}

/**
 * Collection-level quality summary after all items are assessed.
 */
export interface EvidenceCollectionQualitySummary {
  /** Mean overall score across assessed items. */
  meanOverallScore: number;
  /** Collection quality band from mean score. */
  band: EvidenceQualityBand;
  /** Number of items assessed. */
  itemCount: number;
  /** Aggregated quality warnings (deduplicated). */
  warnings: string[];
  assessedAt: string;
  assessorId: string;
  assessorVersion: string;
}

/** Result of assessing an evidence collection. */
export interface EvidenceQualityAssessmentResult {
  items: import("@/lib/intelligence/evidence.types").Evidence[];
  summary: EvidenceCollectionQualitySummary;
}
