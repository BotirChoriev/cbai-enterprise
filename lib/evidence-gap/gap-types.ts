/**
 * CBAI Evidence Gap Explorer Foundation — core type system.
 * Transparency for missing evidence only — no analytics, AI, predictions, or fake percentages.
 */

import type { EntityId } from "@/lib/registry";

export const GAP_RECORD_VERSION = "1.0.0" as const;

/** Branded permanent gap identifier — format `gap-{entityType}-{entitySlug}-{indicatorSlug}`. */
export type EvidenceGapId = string & { readonly __brand: "EvidenceGapId" };

export type EvidenceGapEntityType = "country" | "company" | "university";

export type EvidenceGapStatus = "available" | "planned" | "missing" | "blocked";

export type EvidenceMissingReason =
  | "Evidence source not connected"
  | "Indicator not mapped"
  | "Methodology pending"
  | "Official source unavailable"
  | "Verification pending"
  | "Connector planned";

/** Single indicator-level evidence gap record — derived from registries only. */
export type EvidenceGapRecord = {
  gapId: EvidenceGapId;
  entityId: EntityId;
  entityType: EvidenceGapEntityType;
  entityLabel: string;
  indicatorId: string;
  indicatorTitle: string;
  domainTitle: string;
  expectedSource: string;
  expectedSourceId: string | null;
  expectedConnector: string;
  expectedConnectorId: string | null;
  currentStatus: EvidenceGapStatus;
  missingReason: EvidenceMissingReason | null;
  requiredEvidence: string;
  requiredMethodology: string;
  verificationBlocker: string | null;
  nextPossibleStep: string;
  humanReviewRequired: true;
};

/** Aggregated gap profile for an entity — UI and summary input. */
export type EntityEvidenceGapProfile = {
  entityId: EntityId;
  entityType: EvidenceGapEntityType;
  entityLabel: string;
  gaps: readonly EvidenceGapRecord[];
  availableCount: number;
  plannedCount: number;
  missingCount: number;
  blockedCount: number;
  totalIndicators: number;
  limitations: readonly string[];
  humanReviewRequired: true;
  version: typeof GAP_RECORD_VERSION;
};

export type EvidenceGapSummarySectionId =
  | "evidence-available"
  | "evidence-missing"
  | "gap-categories"
  | "official-sources"
  | "methodology"
  | "limitations"
  | "human-review";

export type EvidenceGapSummarySection = {
  id: EvidenceGapSummarySectionId;
  heading: string;
  content: readonly string[];
};

export type EvidenceGapSummary = {
  entityId: EntityId;
  entityLabel: string;
  sections: readonly EvidenceGapSummarySection[];
  limitations: readonly string[];
  humanReviewRequired: true;
  version: typeof GAP_RECORD_VERSION;
};

export type EvidenceGapValidationIssueCode =
  | "unknown_entity"
  | "unknown_indicator"
  | "unknown_source"
  | "unknown_connector"
  | "prohibited_language"
  | "invalid_gap_id"
  | "human_review_not_required"
  | "fabricated_gap";

export type EvidenceGapValidationIssue = {
  code: EvidenceGapValidationIssueCode;
  severity: "error" | "warning";
  message: string;
  gapId?: EvidenceGapId;
  reference?: string;
};

export type EvidenceGapValidationReport = {
  valid: boolean;
  issueCount: number;
  errors: readonly EvidenceGapValidationIssue[];
  warnings: readonly EvidenceGapValidationIssue[];
};

export const EVIDENCE_GAP_STATUSES: readonly EvidenceGapStatus[] = [
  "available",
  "planned",
  "missing",
  "blocked",
] as const;

export const EVIDENCE_MISSING_REASONS: readonly EvidenceMissingReason[] = [
  "Evidence source not connected",
  "Indicator not mapped",
  "Methodology pending",
  "Official source unavailable",
  "Verification pending",
  "Connector planned",
] as const;
