/**
 * CBAI Intelligence Engine — Evidence Quality Assessment Layer (BUILD-034).
 *
 * @see docs/build-034-report.md
 */

export {
  DEFAULT_EVIDENCE_QUALITY_ASSESSOR_ID,
  DefaultEvidenceQualityAssessor,
  defaultEvidenceQualityAssessor,
  EVIDENCE_QUALITY_ASSESSOR_VERSION,
  QUALITY_WARNING_DUPLICATE_CONTENT,
  QUALITY_WARNING_LOW,
  QUALITY_WARNING_MISSING_FRESHNESS,
  QUALITY_WARNING_WEAK_PROVENANCE,
  type EvidenceQualityAssessor,
} from "@/lib/intelligence/evidence/quality/quality-assessor";

export {
  FRESHNESS_UNKNOWN_CONSERVATIVE_SCORE,
  LOW_QUALITY_OVERALL_THRESHOLD,
  WEAK_PROVENANCE_SCORE_THRESHOLD,
  buildQualityAssessmentContext,
  isDuplicateExcerpt,
  isWeakProvenance,
  mapProvenanceStrength,
  normalizeExcerpt,
  scoreCompleteness,
  scoreConsistency,
  scoreFreshness,
  scoreProvenance,
  scoreRelevance,
  type QualityAssessmentContext,
} from "@/lib/intelligence/evidence/quality/quality-rules";

export {
  QUALITY_BAND_THRESHOLDS,
  QUALITY_DIMENSION_WEIGHT,
  computeMeanOverallScore,
  computeOverallQualityScore,
  resolveDimensionScoreForComposite,
  resolveQualityBand,
} from "@/lib/intelligence/evidence/quality/quality-score";

export type {
  EvidenceCollectionQualitySummary,
  EvidenceQualityAssessment,
  EvidenceQualityAssessmentResult,
  EvidenceQualityBand,
  EvidenceQualityDimensionId,
  EvidenceQualityDimensionScore,
  EvidenceQualityDimensionStatus,
} from "@/lib/intelligence/evidence/quality/quality.types";
