/**
 * CBAI Global Search Intelligence — public API.
 *
 * Platform navigation hub — not semantic AI, LLM search, or recommendations.
 */

export {
  SEARCH_INTELLIGENCE_VERSION,
  SEARCH_INTELLIGENCE_VERSION_INFO,
  SEARCH_INTELLIGENCE_MIGRATION_MANIFEST,
  type SearchIntelligenceVersionInfo,
  type SearchIntelligenceMigrationEntry,
} from "@/lib/search-intelligence/search-intelligence.version";

export {
  SEARCH_INTELLIGENCE_RECORD_VERSION,
  type SearchIntelligenceId,
  type SearchIntelligenceEntityType,
  type SearchModuleNavLink,
  type SearchEvidenceEntry,
  type SearchIndicatorEntry,
  type SearchReportEntry,
  type SearchComparisonEntry,
  type SearchTimelineEntry,
  type SearchDecisionContextEntry,
  type SearchOfficialSourceEntry,
  type SearchIntelligenceRecord,
  type SearchIntelligenceCatalog,
  type SearchIntelligenceMatch,
  type SearchIntelligenceResponse,
  type SearchIntelligenceSummarySectionId,
  type SearchIntelligenceSummarySection,
  type SearchIntelligenceSummary,
  type SearchIntelligenceValidationIssueCode,
  type SearchIntelligenceValidationIssue,
  type SearchIntelligenceValidationReport,
} from "@/lib/search-intelligence/search-intelligence.types";

export {
  SEARCH_INTELLIGENCE_ID_PATTERN,
  buildSearchIntelligenceRecord,
  buildSearchIntelligenceRecordFromEntity,
  buildSearchIntelligenceRecordFromCatalog,
  buildSearchIntelligenceCatalog,
  isValidSearchIntelligenceIdFormat,
  getSearchNavigationHub,
} from "@/lib/search-intelligence/search-intelligence.builder";

export {
  getSearchIntelligenceCatalog,
  rebuildSearchIntelligenceCatalog,
  getSearchIntelligenceRecord,
  getSearchIntelligenceRecordByLegacyId,
  executeSearchIntelligence,
  listSearchIntelligenceByType,
  entityTypeLabel,
} from "@/lib/search-intelligence/search-intelligence.query";

export {
  buildSearchIntelligenceSummary,
  flattenSearchIntelligenceSummary,
} from "@/lib/search-intelligence/search-intelligence.summary";

export {
  validateSearchIntelligenceRecord,
  validateSearchIntelligenceSummary,
  assertSearchIntelligenceRecordValid,
} from "@/lib/search-intelligence/search-intelligence.validation";
