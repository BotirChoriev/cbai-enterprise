/**
 * CBAI Indicator Explorer — core type system.
 * Official indicator exploration layer — not analytics, scoring, or prediction.
 */

export const INDICATOR_EXPLORER_RECORD_VERSION = "1.0.0" as const;

/** Branded explorer record identifier — format `indicator-explorer-{indicatorId}`. */
export type IndicatorExplorerId = string & { readonly __brand: "IndicatorExplorerId" };

export type IndicatorExplorerCoverageStatus =
  | "connected"
  | "planned"
  | "partial"
  | "not_available";

export type IndicatorMethodologyReference = {
  whyItExists: string;
  requiredEvidence: string;
  missingEvidence: string;
  futureScoringDerivation: string;
  standardReference: string;
};

export type IndicatorOfficialSourceEntry = {
  sourceId: string;
  sourceSlug: string;
  sourceName: string;
  connectionStatus: string;
  verificationStatus: string;
  officialWebsite: string;
  required: boolean;
};

export type IndicatorPlannedConnectorEntry = {
  connectorId: string;
  connectorName: string;
  organization: string;
  status: string;
  evidenceSourceId: string | null;
};

export type IndicatorSupportedMissionEntry = {
  missionId: string;
  missionName: string;
  persona: string;
};

export type IndicatorSupportedReportEntry = {
  reportId: string;
  reportTitle: string;
  entityScope: string;
};

/** Canonical indicator explorer record — self-describing indicator profile. */
export type IndicatorExplorerRecord = {
  indicatorExplorerId: IndicatorExplorerId;
  indicatorId: string;
  indicatorName: string;
  indicatorSlug: string;
  domain: string;
  domainId: string;
  description: string;
  methodologyReferences: IndicatorMethodologyReference;
  officialSources: readonly IndicatorOfficialSourceEntry[];
  plannedConnectors: readonly IndicatorPlannedConnectorEntry[];
  supportedEntities: readonly string[];
  supportedMissions: readonly IndicatorSupportedMissionEntry[];
  supportedReports: readonly IndicatorSupportedReportEntry[];
  coverageStatus: IndicatorExplorerCoverageStatus;
  limitations: readonly string[];
  humanReviewRequired: true;
  version: typeof INDICATOR_EXPLORER_RECORD_VERSION;
};

export type IndicatorExplorerCatalog = {
  version: string;
  explorerRecordVersion: typeof INDICATOR_EXPLORER_RECORD_VERSION;
  indicatorCount: number;
  indicators: readonly IndicatorExplorerRecord[];
  byDomain: Readonly<Record<string, readonly IndicatorExplorerRecord[]>>;
};

export type IndicatorExplorerSummarySectionId =
  | "definition"
  | "methodology"
  | "sources"
  | "connectors"
  | "dependencies"
  | "coverage"
  | "limitations"
  | "human-review";

export type IndicatorExplorerSummarySection = {
  id: IndicatorExplorerSummarySectionId;
  heading: string;
  content: readonly string[];
};

export type IndicatorExplorerSummary = {
  indicatorExplorerId: IndicatorExplorerId;
  indicatorName: string;
  coverageStatus: IndicatorExplorerCoverageStatus;
  coverageLabel: string;
  sections: readonly IndicatorExplorerSummarySection[];
  limitations: readonly string[];
  humanReviewRequired: true;
  version: typeof INDICATOR_EXPLORER_RECORD_VERSION;
};

export type IndicatorExplorerValidationIssueCode =
  | "unknown_indicator"
  | "prohibited_language"
  | "invalid_explorer_id"
  | "human_review_not_required"
  | "fabricated_coverage";

export type IndicatorExplorerValidationIssue = {
  code: IndicatorExplorerValidationIssueCode;
  severity: "error" | "warning";
  message: string;
  indicatorExplorerId?: IndicatorExplorerId;
  reference?: string;
};

export type IndicatorExplorerValidationReport = {
  valid: boolean;
  issueCount: number;
  errors: readonly IndicatorExplorerValidationIssue[];
  warnings: readonly IndicatorExplorerValidationIssue[];
};

export const INDICATOR_EXPLORER_COVERAGE_STATUSES: readonly IndicatorExplorerCoverageStatus[] =
  ["connected", "planned", "partial", "not_available"] as const;
