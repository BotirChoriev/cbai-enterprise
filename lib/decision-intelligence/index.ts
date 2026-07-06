/**
 * CBAI Decision Intelligence Foundation — public API.
 *
 * Evidence organization for human decision-makers.
 * No recommendations, predictions, policy advice, runtime, or AI.
 */

export {
  DECISION_INTELLIGENCE_VERSION,
  DECISION_INTELLIGENCE_VERSION_INFO,
  DECISION_MIGRATION_MANIFEST,
  DECISION_REVIEW_STAGES,
  type DecisionIntelligenceVersionInfo,
  type DecisionMigrationEntry,
  type DecisionReviewStage,
} from "@/lib/decision-intelligence/decision-version";

export {
  DECISION_RECORD_VERSION,
  DECISION_READINESS_STATUSES,
  type DecisionContextId,
  type DecisionReadinessStatus,
  type EvidenceSlotStatus,
  type EvidenceCoverageSlot,
  type SourceCoverageEntry,
  type EvidenceCoverageReport,
  type MethodologyReference,
  type DecisionContextRecord,
  type DecisionContextInput,
  type DecisionContextTemplate,
  type DecisionRegistry,
  type DecisionValidationIssueCode,
  type DecisionValidationIssue,
  type DecisionValidationReport,
  type DecisionSummarySectionId,
  type DecisionSummarySection,
  type DecisionSummary,
} from "@/lib/decision-intelligence/decision-types";

export {
  DECISION_CONTEXT_ID_PATTERN,
  buildDecisionContextId,
  isValidDecisionContextIdFormat,
  buildDecisionContext,
  type BuildDecisionContextOptions,
} from "@/lib/decision-intelligence/decision-context";

export {
  buildEvidenceCoverage,
  collectEvidenceIds,
  collectSourceIds,
} from "@/lib/decision-intelligence/decision-evidence";

export {
  decisionReadinessLabel,
  assessDecisionReadiness,
  buildStandardLimitations,
} from "@/lib/decision-intelligence/decision-readiness";

export {
  buildDecisionSummary,
  flattenDecisionSummary,
  type BuildDecisionSummaryOptions,
} from "@/lib/decision-intelligence/decision-summary";

export {
  validateDecisionContext,
  validateDecisionSummary,
  validateDecisionContextBatch,
  assertDecisionContextValid,
} from "@/lib/decision-intelligence/decision-validation";

export {
  DECISION_CONTEXT_TEMPLATES,
  buildDecisionRegistry,
  getDecisionRegistry,
  rebuildDecisionRegistry,
  buildDecisionContextFromMission,
  buildDecisionContextFromTemplate,
  buildDecisionPackageFromTemplate,
  validateDecisionRegistryTemplates,
} from "@/lib/decision-intelligence/decision-registry";
