/**
 * CBAI Indicator Explorer — public API.
 *
 * Official indicator exploration layer — not analytics, scoring, or prediction.
 */

export {
  INDICATOR_EXPLORER_VERSION,
  INDICATOR_EXPLORER_VERSION_INFO,
  INDICATOR_EXPLORER_MIGRATION_MANIFEST,
  type IndicatorExplorerVersionInfo,
  type IndicatorExplorerMigrationEntry,
} from "@/lib/indicator-explorer/indicator-explorer.version";

export {
  INDICATOR_EXPLORER_RECORD_VERSION,
  INDICATOR_EXPLORER_COVERAGE_STATUSES,
  type IndicatorExplorerId,
  type IndicatorExplorerCoverageStatus,
  type IndicatorMethodologyReference,
  type IndicatorOfficialSourceEntry,
  type IndicatorPlannedConnectorEntry,
  type IndicatorSupportedMissionEntry,
  type IndicatorSupportedReportEntry,
  type IndicatorExplorerRecord,
  type IndicatorExplorerCatalog,
  type IndicatorExplorerSummarySectionId,
  type IndicatorExplorerSummarySection,
  type IndicatorExplorerSummary,
  type IndicatorExplorerValidationIssueCode,
  type IndicatorExplorerValidationIssue,
  type IndicatorExplorerValidationReport,
} from "@/lib/indicator-explorer/indicator-explorer.types";

export {
  INDICATOR_EXPLORER_ID_PATTERN,
  buildIndicatorExplorerRecord,
  buildIndicatorExplorerRecordFromDefinition,
  buildIndicatorExplorerCatalog,
  isValidIndicatorExplorerIdFormat,
  listDecisionIntelligenceIndicatorIds,
} from "@/lib/indicator-explorer/indicator-explorer.builder";

export {
  getIndicatorExplorerCatalog,
  rebuildIndicatorExplorerCatalog,
  getIndicatorExplorerRecord,
  listIndicatorsByDomain,
  getDecisionIntelligenceIndicatorRecords,
  coverageStatusLabel,
  coverageStatusClass,
} from "@/lib/indicator-explorer/indicator-explorer.query";

export {
  buildIndicatorExplorerSummary,
  flattenIndicatorExplorerSummary,
} from "@/lib/indicator-explorer/indicator-explorer.summary";

export {
  validateIndicatorExplorerRecord,
  validateIndicatorExplorerSummary,
  assertIndicatorExplorerRecordValid,
} from "@/lib/indicator-explorer/indicator-explorer.validation";
