/**
 * CBAI Evidence Comparison Foundation — core type system.
 * Evidence readiness comparison only — no scoring, ranking, or judgment.
 */

import type { EntityId } from "@/lib/registry";

export const COMPARISON_RECORD_VERSION = "1.0.0" as const;

/** Branded permanent comparison identifier — format `comparison-{type}-{left}-vs-{right}`. */
export type ComparisonId = string & { readonly __brand: "ComparisonId" };

export type ComparisonEntityType = "country" | "company" | "university";

export type ComparisonReadinessStatus =
  | "comparable"
  | "partial"
  | "insufficient_evidence"
  | "unsupported";

/** Allowed comparison note language — never winner/better/worse/rank/score. */
export type ComparisonNote =
  | "same evidence status"
  | "evidence gap differs"
  | "more evidence connected on left"
  | "more evidence connected on right"
  | "source not connected"
  | "methodology required";

export type ComparisonIndicatorRow = {
  indicatorId: string;
  indicatorTitle: string;
  domainTitle: string;
  leftStatus: string;
  rightStatus: string;
  note: ComparisonNote;
  leftAvailable: boolean;
  rightAvailable: boolean;
};

export type ComparisonMethodologyReference = {
  indicatorId: string;
  indicatorTitle: string;
  whyItExists: string;
  requiredEvidence: string;
  standardReference: string;
};

/** Canonical evidence comparison record. */
export type EvidenceComparisonRecord = {
  comparisonId: ComparisonId;
  leftEntityId: EntityId;
  rightEntityId: EntityId;
  leftEntityLabel: string;
  rightEntityLabel: string;
  entityType: ComparisonEntityType;
  readinessStatus: ComparisonReadinessStatus;
  sharedIndicators: readonly string[];
  leftAvailableEvidence: readonly string[];
  rightAvailableEvidence: readonly string[];
  leftEvidenceGaps: readonly string[];
  rightEvidenceGaps: readonly string[];
  sharedSources: readonly string[];
  missingSources: readonly string[];
  indicatorRows: readonly ComparisonIndicatorRow[];
  methodologyReferences: readonly ComparisonMethodologyReference[];
  limitations: readonly string[];
  humanReviewRequired: true;
  version: typeof COMPARISON_RECORD_VERSION;
};

export type ComparisonCandidate = {
  entityId: EntityId;
  legacyId: string;
  displayName: string;
  entityType: ComparisonEntityType;
};

export type ComparisonContext = {
  entityType: ComparisonEntityType;
  leftEntityId: EntityId;
  leftEntityLabel: string;
  leftLegacyId: string;
  candidates: readonly ComparisonCandidate[];
  comparisonAvailable: boolean;
  unavailableReason: string | null;
};

/** UI-facing model with optional built comparison. */
export type EvidenceComparisonModel = {
  context: ComparisonContext;
  comparison: EvidenceComparisonRecord | null;
  unsupportedMessage: string | null;
};

export type ComparisonSummarySectionId =
  | "coverage-summary"
  | "shared-indicators"
  | "evidence-gaps"
  | "sources"
  | "methodology"
  | "limitations"
  | "human-review";

export type ComparisonSummarySection = {
  id: ComparisonSummarySectionId;
  heading: string;
  content: readonly string[];
};

export type ComparisonSummary = {
  comparisonId: ComparisonId | null;
  leftEntityLabel: string;
  rightEntityLabel: string;
  readinessStatus: ComparisonReadinessStatus;
  readinessLabel: string;
  sections: readonly ComparisonSummarySection[];
  limitations: readonly string[];
  humanReviewRequired: true;
  version: typeof COMPARISON_RECORD_VERSION;
};

export type ComparisonValidationIssueCode =
  | "unsupported_entity_type_mix"
  | "unknown_entity"
  | "prohibited_language"
  | "invalid_comparison_id"
  | "human_review_not_required"
  | "same_entity_comparison";

export type ComparisonValidationIssue = {
  code: ComparisonValidationIssueCode;
  severity: "error" | "warning";
  message: string;
  comparisonId?: ComparisonId;
  reference?: string;
};

export type ComparisonValidationReport = {
  valid: boolean;
  issueCount: number;
  errors: readonly ComparisonValidationIssue[];
  warnings: readonly ComparisonValidationIssue[];
};

export const COMPARISON_READINESS_STATUSES: readonly ComparisonReadinessStatus[] = [
  "comparable",
  "partial",
  "insufficient_evidence",
  "unsupported",
] as const;

export const COMPARISON_UNAVAILABLE_FEWER_THAN_TWO =
  "Comparison unavailable — fewer than two entities of this type in the Global Registry." as const;

export const COMPARISON_UNSUPPORTED_TYPE_MIX =
  "Unsupported comparison — entity types must match." as const;
