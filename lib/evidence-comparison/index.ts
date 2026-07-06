/**
 * CBAI Evidence Comparison Foundation — public API.
 *
 * Evidence readiness comparison between same-type entities only.
 * No scoring, ranking, investment advice, or political judgment.
 */

export {
  EVIDENCE_COMPARISON_FOUNDATION_VERSION,
  EVIDENCE_COMPARISON_FOUNDATION_VERSION_INFO,
  COMPARISON_MIGRATION_MANIFEST,
  type EvidenceComparisonFoundationVersionInfo,
  type ComparisonMigrationEntry,
} from "@/lib/evidence-comparison/comparison-version";

export {
  COMPARISON_RECORD_VERSION,
  COMPARISON_READINESS_STATUSES,
  COMPARISON_UNAVAILABLE_FEWER_THAN_TWO,
  COMPARISON_UNSUPPORTED_TYPE_MIX,
  type ComparisonId,
  type ComparisonEntityType,
  type ComparisonReadinessStatus,
  type ComparisonNote,
  type ComparisonIndicatorRow,
  type ComparisonMethodologyReference,
  type EvidenceComparisonRecord,
  type ComparisonCandidate,
  type ComparisonContext,
  type EvidenceComparisonModel,
  type ComparisonSummarySectionId,
  type ComparisonSummarySection,
  type ComparisonSummary,
  type ComparisonValidationIssueCode,
  type ComparisonValidationIssue,
  type ComparisonValidationReport,
} from "@/lib/evidence-comparison/comparison-types";

export {
  COMPARISON_ID_PATTERN,
  buildEvidenceComparison,
  buildComparisonCandidates,
  buildComparisonContext,
  buildEvidenceComparisonModel,
  isValidComparisonIdFormat,
  defaultComparisonTarget,
} from "@/lib/evidence-comparison/comparison-builder";

export {
  getCountryEvidenceComparison,
  getCompanyEvidenceComparison,
  getUniversityEvidenceComparison,
  comparisonReadinessLabel,
  comparisonReadinessStatusClass,
  comparisonNoteClass,
} from "@/lib/evidence-comparison/comparison-query";

export {
  buildComparisonSummary,
  flattenComparisonSummary,
  unsupportedComparisonSummary,
} from "@/lib/evidence-comparison/comparison-summary";

export {
  validateEvidenceComparison,
  validateComparisonSummary,
  assertEvidenceComparisonValid,
} from "@/lib/evidence-comparison/comparison-validation";
