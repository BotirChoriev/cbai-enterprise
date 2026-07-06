/**
 * CBAI Decision Intelligence Foundation — core type system.
 * Evidence organization for human decision-makers only.
 * No recommendations, predictions, policy advice, or AI conclusions.
 */

import type { EntityId } from "@/lib/registry";
import type { MissionId } from "@/lib/missions";

export const DECISION_RECORD_VERSION = "1.0.0" as const;

/** Branded permanent decision context identifier — format `decision-{slug}`. */
export type DecisionContextId = string & { readonly __brand: "DecisionContextId" };

/**
 * Constitutional readiness states — describe evidence posture, not conclusions.
 * Never maps to recommendations or action directives.
 */
export type DecisionReadinessStatus =
  | "insufficient_evidence"
  | "partial_evidence"
  | "ready_for_review"
  | "verified_evidence";

export type EvidenceSlotStatus = "available" | "missing" | "planned";

export type EvidenceCoverageSlot = {
  evidenceId: string;
  indicatorId: string;
  indicatorTitle: string;
  status: EvidenceSlotStatus;
  sourceIds: readonly string[];
  connectedSourceIds: readonly string[];
  missingSourceIds: readonly string[];
};

export type SourceCoverageEntry = {
  sourceId: string;
  sourceName: string;
  connectionStatus: "connected" | "planned" | "deprecated";
  verificationStatus: string;
  officialWebsite: string;
};

/** Factual coverage report — ratios describe completeness, not quality scores. */
export type EvidenceCoverageReport = {
  totalRequired: number;
  availableCount: number;
  missingCount: number;
  plannedCount: number;
  coverageRatio: number;
  available: readonly EvidenceCoverageSlot[];
  missing: readonly EvidenceCoverageSlot[];
  planned: readonly EvidenceCoverageSlot[];
  officialSources: readonly SourceCoverageEntry[];
};

export type MethodologyReference = {
  indicatorId: string;
  indicatorTitle: string;
  whyItExists: string;
  requiredEvidence: string;
  missingEvidence: string;
  standardReference: string;
};

/** Canonical decision context record — the constitutional decision model. */
export type DecisionContextRecord = {
  decisionContextId: DecisionContextId;
  entityIds: readonly EntityId[];
  indicatorIds: readonly string[];
  evidenceIds: readonly string[];
  sourceIds: readonly string[];
  missionIds: readonly MissionId[];
  readinessStatus: DecisionReadinessStatus;
  limitations: readonly string[];
  evidenceCoverage: EvidenceCoverageReport;
  methodologyReferences: readonly MethodologyReference[];
  /** Always true — human oversight is mandatory per CBAI Constitution. */
  humanReviewRequired: true;
  version: typeof DECISION_RECORD_VERSION;
};

export type DecisionContextInput = {
  /** Explicit entity IDs — resolved against Global Registry when omitted with legacy IDs. */
  entityIds?: readonly string[];
  indicatorIds?: readonly string[];
  missionIds?: readonly string[];
  /** Legacy catalog IDs for platform context resolution. */
  countryId?: string | null;
  companyId?: string | null;
  universityId?: string | null;
};

/** Declarative template before requirement resolution. */
export type DecisionContextTemplate = {
  slug: string;
  title: string;
  description: string;
  missionId: string;
  supportedEntityTypes: readonly ("country" | "company" | "university")[];
};

export type DecisionRegistry = {
  version: string;
  decisionRecordVersion: typeof DECISION_RECORD_VERSION;
  builtAt: string;
  templates: readonly DecisionContextTemplate[];
  templateCount: number;
};

export type DecisionValidationIssueCode =
  | "missing_evidence"
  | "missing_methodology"
  | "unknown_indicator"
  | "unknown_entity"
  | "unknown_source"
  | "unknown_mission"
  | "broken_registry_link"
  | "prohibited_language"
  | "invalid_decision_context_id"
  | "duplicate_decision_context_id"
  | "human_review_not_required";

export type DecisionValidationIssue = {
  code: DecisionValidationIssueCode;
  severity: "error" | "warning";
  message: string;
  decisionContextId?: DecisionContextId;
  reference?: string;
};

export type DecisionValidationReport = {
  valid: boolean;
  issueCount: number;
  errors: readonly DecisionValidationIssue[];
  warnings: readonly DecisionValidationIssue[];
};

export type DecisionSummarySectionId =
  | "evidence-available"
  | "evidence-missing"
  | "evidence-coverage"
  | "limitations"
  | "methodology"
  | "official-sources"
  | "human-review";

export type DecisionSummarySection = {
  id: DecisionSummarySectionId;
  heading: string;
  content: readonly string[];
};

/** Factual decision support summary — never contains recommendations. */
export type DecisionSummary = {
  decisionContextId: DecisionContextId;
  title: string;
  readinessStatus: DecisionReadinessStatus;
  readinessLabel: string;
  humanReviewRequired: true;
  sections: readonly DecisionSummarySection[];
  limitations: readonly string[];
  version: typeof DECISION_RECORD_VERSION;
};

export const DECISION_READINESS_STATUSES: readonly DecisionReadinessStatus[] = [
  "insufficient_evidence",
  "partial_evidence",
  "ready_for_review",
  "verified_evidence",
] as const;
