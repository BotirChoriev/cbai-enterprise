/**
 * CBAI Intelligence Engine — Confidence Assessment Layer (BUILD-024).
 *
 * Conservative evidence-based confidence scoring. No AI, no predictive
 * scoring, no graph or memory inputs in this build.
 *
 * @see docs/build-024-report.md
 */

export {
  CONFIDENCE_ASSESSOR_VERSION,
  DEFAULT_CONFIDENCE_ASSESSOR_ID,
  DefaultConfidenceAssessor,
  defaultConfidenceAssessor,
  type ConfidenceAssessor,
} from "@/lib/intelligence/confidence/assessor";

export {
  CONFIDENCE_BAND_HIGH_MIN,
  CONFIDENCE_BAND_LABELS,
  CONFIDENCE_BAND_LOW_MIN,
  CONFIDENCE_BAND_MEDIUM_MIN,
  CONFIDENCE_BAND_VERIFIED_MIN,
  CONFIDENCE_BAND_VERY_LOW_MIN,
  CONFIDENCE_BANDS_DESCENDING,
  clampConfidenceScore,
  isInsufficientConfidenceBand,
  resolveConfidenceBand,
} from "@/lib/intelligence/confidence/bands";

export {
  buildConfidenceFactors,
  buildEntitySignalQualityFactor,
  buildEvidenceVolumeFactor,
  buildGraphConnectivityFactor,
  buildSourceRelevanceFactor,
  computeCompositeConfidenceScore,
  CONFIDENCE_FACTOR_WEIGHTS,
  isEvidenceConfidenceInsufficient,
} from "@/lib/intelligence/confidence/factors";

export {
  applyQualityBandCap,
  applyQualityWarningDegradation,
  computeQualityWarningPenalty,
  MAX_QUALITY_WARNING_PENALTY,
  QUALITY_BAND_CONFIDENCE_CAPS,
  QUALITY_UNKNOWN_FACTOR_SCORE,
  QUALITY_WARNING_PENALTIES,
  resolveWarningPenalty,
  weightQualityForConfidence,
} from "@/lib/intelligence/confidence/quality-weighting";

export {
  applyQualityIntegrationAdjustments,
  buildEvidenceQualityFactor,
  buildQualityDegradationReason,
  computeMeanProvenanceScore,
  extractQualityIntegrationContext,
  type ConfidenceQualityIntegrationContext,
  type ConfidenceQualityIntegrationSummary,
} from "@/lib/intelligence/confidence/quality-integration";
