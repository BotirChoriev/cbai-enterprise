/**
 * CBAI Global Search Intelligence — core type system.
 * Platform navigation hub — not semantic AI, LLM search, or recommendations.
 */

import type { EntityId } from "@/lib/registry";

export const SEARCH_INTELLIGENCE_RECORD_VERSION = "1.0.0" as const;

/** Branded search intelligence record identifier — format `search-intelligence-{entityType}-{slug}`. */
export type SearchIntelligenceId = string & { readonly __brand: "SearchIntelligenceId" };

export type SearchIntelligenceEntityType = "country" | "company" | "university";

export type SearchModuleNavLink = {
  moduleId: string;
  label: string;
  href: string;
  description: string;
  available: boolean;
};

export type SearchEvidenceEntry = {
  indicatorId: string;
  indicatorName: string;
  gapStatus: string;
  expectedSource: string;
};

export type SearchIndicatorEntry = {
  indicatorId: string;
  indicatorName: string;
  domain: string;
  explorerCoverageStatus: string;
};

export type SearchReportEntry = {
  reportId: string;
  reportTitle: string;
  availabilityLabel: string;
};

export type SearchComparisonEntry = {
  targetEntityId: string;
  targetDisplayName: string;
  entityType: SearchIntelligenceEntityType;
};

export type SearchTimelineEntry = {
  timelineId: string | null;
  available: boolean;
  readinessLabel: string;
  entityScope: SearchIntelligenceEntityType;
};

export type SearchDecisionContextEntry = {
  templateSlug: string;
  title: string;
  readinessLabel: string;
  supported: boolean;
};

export type SearchOfficialSourceEntry = {
  sourceId: string;
  sourceName: string;
  connectionStatus: string;
  verificationStatus: string;
  indicatorCount: number;
};

/** Canonical search intelligence record — navigation hub for a registry entity. */
export type SearchIntelligenceRecord = {
  searchIntelligenceId: SearchIntelligenceId;
  entityId: EntityId;
  entityType: SearchIntelligenceEntityType;
  displayName: string;
  availableModules: readonly SearchModuleNavLink[];
  availableEvidence: readonly SearchEvidenceEntry[];
  availableIndicators: readonly SearchIndicatorEntry[];
  availableReports: readonly SearchReportEntry[];
  availableComparisons: readonly SearchComparisonEntry[];
  availableTimeline: SearchTimelineEntry | null;
  availableDecisionContexts: readonly SearchDecisionContextEntry[];
  officialSources: readonly SearchOfficialSourceEntry[];
  limitations: readonly string[];
  humanReviewRequired: true;
  version: typeof SEARCH_INTELLIGENCE_RECORD_VERSION;
};

export type SearchIntelligenceCatalog = {
  version: string;
  recordVersion: typeof SEARCH_INTELLIGENCE_RECORD_VERSION;
  entityCount: number;
  records: readonly SearchIntelligenceRecord[];
  byEntityType: Readonly<
    Record<SearchIntelligenceEntityType, readonly SearchIntelligenceRecord[]>
  >;
};

export type SearchIntelligenceMatch = {
  record: SearchIntelligenceRecord;
  matchedTokens: readonly string[];
};

export type SearchIntelligenceResponse = {
  query: string;
  matches: readonly SearchIntelligenceMatch[];
  hasResults: boolean;
};

export type SearchIntelligenceSummarySectionId =
  | "overview"
  | "modules"
  | "evidence"
  | "indicators"
  | "sources"
  | "decision-readiness"
  | "limitations"
  | "human-review";

export type SearchIntelligenceSummarySection = {
  id: SearchIntelligenceSummarySectionId;
  heading: string;
  content: readonly string[];
};

export type SearchIntelligenceSummary = {
  searchIntelligenceId: SearchIntelligenceId;
  displayName: string;
  entityType: SearchIntelligenceEntityType;
  sections: readonly SearchIntelligenceSummarySection[];
  limitations: readonly string[];
  humanReviewRequired: true;
  version: typeof SEARCH_INTELLIGENCE_RECORD_VERSION;
};

export type SearchIntelligenceValidationIssueCode =
  | "unknown_entity"
  | "prohibited_language"
  | "invalid_search_id"
  | "human_review_not_required"
  | "fabricated_navigation";

export type SearchIntelligenceValidationIssue = {
  code: SearchIntelligenceValidationIssueCode;
  severity: "error" | "warning";
  message: string;
  searchIntelligenceId?: SearchIntelligenceId;
  reference?: string;
};

export type SearchIntelligenceValidationReport = {
  valid: boolean;
  issueCount: number;
  errors: readonly SearchIntelligenceValidationIssue[];
  warnings: readonly SearchIntelligenceValidationIssue[];
};
