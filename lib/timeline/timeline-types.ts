/**
 * CBAI Country Intelligence Timeline Foundation — core type system.
 * Evidence readiness structure only — no historical events, fake data, or political interpretation.
 */

import type { EntityId } from "@/lib/registry";

export const TIMELINE_RECORD_VERSION = "1.0.0" as const;

/** Branded permanent timeline identifier — format `timeline-{entityType}-{slug}`. */
export type TimelineId = string & { readonly __brand: "TimelineId" };

export type TimelineEntityType = "country" | "company" | "university";

/**
 * Timeline readiness states — evidence posture across year slots, not event significance.
 */
export type TimelineReadinessStatus =
  | "planned"
  | "partial"
  | "ready_for_evidence"
  | "verified";

export type TimelineYearStatus = "verified" | "partial" | "missing" | "future";

export type TimelineYearEntry = {
  year: number;
  status: TimelineYearStatus;
  /** Honest label — never an event description. */
  label: string;
};

export type TimelineOfficialSourceEntry = {
  sourceId: string;
  sourceName: string;
  connectionStatus: "connected" | "planned" | "deprecated";
  verificationStatus: string;
  officialWebsite: string;
  /** Years this source could cover when connected — structural only. */
  supportedYears: readonly number[];
};

export type TimelineIndicatorCoverageEntry = {
  indicatorId: string;
  indicatorTitle: string;
  domainTitle: string;
  statusLabel: "Connected" | "Planned" | "Not connected" | "Verification pending";
  /** Years with verified evidence — empty when not connected. */
  availableYears: readonly number[];
  /** Years without evidence for this indicator. */
  missingYears: readonly number[];
};

export type TimelineMethodologyReference = {
  indicatorId: string;
  indicatorTitle: string;
  whyItExists: string;
  requiredEvidence: string;
  missingEvidence: string;
  standardReference: string;
};

/** Canonical country timeline record — evidence readiness structure only. */
export type TimelineRecord = {
  timelineId: TimelineId;
  entityId: EntityId;
  entityType: TimelineEntityType;
  entityLabel: string;
  supportedYears: readonly number[];
  availableEvidenceYears: readonly number[];
  missingEvidenceYears: readonly number[];
  futureEvidenceYears: readonly number[];
  yearEntries: readonly TimelineYearEntry[];
  officialSources: readonly TimelineOfficialSourceEntry[];
  indicatorCoverage: readonly TimelineIndicatorCoverageEntry[];
  methodologyReferences: readonly TimelineMethodologyReference[];
  limitations: readonly string[];
  readinessStatus: TimelineReadinessStatus;
  /** Always true — human oversight mandatory per CBAI Constitution. */
  humanReviewRequired: true;
  version: typeof TIMELINE_RECORD_VERSION;
};

export type TimelineSummarySectionId =
  | "verified-evidence"
  | "evidence-coverage"
  | "missing-years"
  | "official-sources"
  | "methodology"
  | "limitations"
  | "human-review";

export type TimelineSummarySection = {
  id: TimelineSummarySectionId;
  heading: string;
  content: readonly string[];
};

/** Factual timeline summary — structure and readiness only, never events or conclusions. */
export type TimelineSummary = {
  timelineId: TimelineId;
  entityLabel: string;
  readinessStatus: TimelineReadinessStatus;
  readinessLabel: string;
  humanReviewRequired: true;
  sections: readonly TimelineSummarySection[];
  limitations: readonly string[];
  version: typeof TIMELINE_RECORD_VERSION;
};

export type TimelineValidationIssueCode =
  | "unknown_entity"
  | "broken_registry_link"
  | "prohibited_event_language"
  | "prohibited_historical_claim"
  | "invalid_timeline_id"
  | "human_review_not_required"
  | "fake_timeline_entry"
  | "missing_methodology";

export type TimelineValidationIssue = {
  code: TimelineValidationIssueCode;
  severity: "error" | "warning";
  message: string;
  timelineId?: TimelineId;
  reference?: string;
};

export type TimelineValidationReport = {
  valid: boolean;
  issueCount: number;
  errors: readonly TimelineValidationIssue[];
  warnings: readonly TimelineValidationIssue[];
};

/** UI-facing model derived from TimelineRecord. */
export type CountryTimelineModel = TimelineRecord & {
  evidenceNotConnected: boolean;
  emptyStateMessage: string;
};

export const TIMELINE_READINESS_STATUSES: readonly TimelineReadinessStatus[] = [
  "planned",
  "partial",
  "ready_for_evidence",
  "verified",
] as const;

/** Default year span for structural timeline slots — not a claim of available data. */
export const TIMELINE_DEFAULT_YEAR_SPAN = 10 as const;

export const TIMELINE_EVIDENCE_NOT_CONNECTED_LABEL =
  "Evidence not connected." as const;
