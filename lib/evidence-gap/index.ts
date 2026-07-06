/**
 * CBAI Evidence Gap Explorer Foundation — public API.
 *
 * Transparency for missing evidence — no analytics, AI, predictions, or fake percentages.
 */

export {
  EVIDENCE_GAP_FOUNDATION_VERSION,
  EVIDENCE_GAP_FOUNDATION_VERSION_INFO,
  EVIDENCE_GAP_MIGRATION_MANIFEST,
  type EvidenceGapFoundationVersionInfo,
  type EvidenceGapMigrationEntry,
} from "@/lib/evidence-gap/gap-version";

export {
  GAP_RECORD_VERSION,
  EVIDENCE_GAP_STATUSES,
  EVIDENCE_MISSING_REASONS,
  type EvidenceGapId,
  type EvidenceGapEntityType,
  type EvidenceGapStatus,
  type EvidenceMissingReason,
  type EvidenceGapRecord,
  type EntityEvidenceGapProfile,
  type EvidenceGapSummarySectionId,
  type EvidenceGapSummarySection,
  type EvidenceGapSummary,
  type EvidenceGapValidationIssueCode,
  type EvidenceGapValidationIssue,
  type EvidenceGapValidationReport,
} from "@/lib/evidence-gap/gap-types";

export {
  GAP_ID_PATTERN,
  buildCountryEvidenceGapProfile,
  buildCompanyEvidenceGapProfile,
  buildUniversityEvidenceGapProfile,
  isValidGapIdFormat,
} from "@/lib/evidence-gap/gap-builder";

export {
  getCountryEvidenceGaps,
  getCompanyEvidenceGaps,
  getUniversityEvidenceGaps,
  gapStatusLabel,
  gapStatusClass,
  getNonAvailableGaps,
  getAvailableGaps,
} from "@/lib/evidence-gap/gap-query";

export {
  buildEvidenceGapSummary,
  flattenEvidenceGapSummary,
} from "@/lib/evidence-gap/gap-summary";

export {
  validateEvidenceGapProfile,
  validateEvidenceGapSummary,
  assertEvidenceGapProfileValid,
} from "@/lib/evidence-gap/gap-validation";
