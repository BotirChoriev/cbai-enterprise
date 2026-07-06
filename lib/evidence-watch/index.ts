/**
 * CBAI Evidence Watch Foundation — public API.
 *
 * Official evidence change transparency — not prediction, alerts, or notifications.
 */

export {
  EVIDENCE_WATCH_FOUNDATION_VERSION,
  EVIDENCE_WATCH_REGISTRY_SNAPSHOT_AT,
  EVIDENCE_WATCH_FOUNDATION_VERSION_INFO,
  EVIDENCE_WATCH_MIGRATION_MANIFEST,
  type EvidenceWatchFoundationVersionInfo,
  type EvidenceWatchMigrationEntry,
} from "@/lib/evidence-watch/watch-version";

export {
  WATCH_RECORD_VERSION,
  EVIDENCE_WATCH_CHANGE_TYPES,
  type EvidenceWatchId,
  type EvidenceWatchChangeType,
  type EvidenceWatchMethodologyReference,
  type EvidenceWatchRecord,
  type EvidenceWatchCatalog,
  type EvidenceWatchSummarySectionId,
  type EvidenceWatchSummarySection,
  type EvidenceWatchSummary,
  type EvidenceWatchValidationIssueCode,
  type EvidenceWatchValidationIssue,
  type EvidenceWatchValidationReport,
} from "@/lib/evidence-watch/watch-types";

export {
  WATCH_ID_PATTERN,
  buildEvidenceWatchCatalog,
  buildEvidenceWatchRecord,
  buildEvidenceWatchRecordsForEntity,
  buildEvidenceWatchRecordsForSource,
  isValidWatchIdFormat,
} from "@/lib/evidence-watch/watch-builder";

export {
  getEvidenceWatchCatalog,
  rebuildEvidenceWatchCatalog,
  getEvidenceWatchRecord,
  getEvidenceWatchRecordsForEntity,
  getEvidenceWatchRecordsForSource,
  listEvidenceWatchByChangeType,
  changeTypeLabel,
  changeTypeClass,
} from "@/lib/evidence-watch/watch-query";

export {
  buildEvidenceWatchSummary,
  flattenEvidenceWatchSummary,
} from "@/lib/evidence-watch/watch-summary";

export {
  validateEvidenceWatchRecord,
  validateEvidenceWatchSummary,
  assertEvidenceWatchRecordValid,
} from "@/lib/evidence-watch/watch-validation";
