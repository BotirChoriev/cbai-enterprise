/**
 * CBAI Constitution Enforcement Framework
 *
 * Permanent governance layer — rule definitions and report types only.
 * No runtime validation, no automatic enforcement, no UI, no API.
 */

export {
  GOVERNANCE_VERSION,
  type RuleCategory,
  type RuleSeverity,
  type GovernanceRule,
  type ConstitutionPrincipleId,
  type ConstitutionRule,
  type EntityTypeId,
  type EntityRule,
  type IndicatorLifecycleState,
  type IndicatorRule,
  type EvidenceRule,
  type UiRule,
  type PersonaId,
  type PersonaRule,
  type AnyGovernanceRule,
  type GovernanceRuleRegistry,
} from "@/lib/governance/types";

export {
  GOVERNANCE_RULE_REGISTRY,
  ALL_GOVERNANCE_RULES,
  getRuleById,
  getRulesByCategory,
  getCriticalRules,
  getRegistrySummary,
} from "@/lib/governance/registry";

export {
  CONSTITUTION_RULES,
  getConstitutionRuleBySlug,
  getConstitutionRuleByPrinciple,
} from "@/lib/governance/constitution/rules";

export {
  EVIDENCE_RULES,
  getEvidenceRuleByRequirement,
} from "@/lib/governance/evidence/rules";

export {
  MODULE_RULES,
  ENTITY_RULES,
  INDICATOR_RULES,
  UI_RULES,
  PERSONA_RULES,
  REQUIRED_PERSONA_IDS,
  getEntityRulesByType,
  getIndicatorRulesByLifecycle,
  getUiRuleByConstraint,
  getPersonaRuleById,
} from "@/lib/governance/rules";

export {
  DEFAULT_VALIDATION_FLOW,
  getValidationStepById,
  getValidationStepsByIntegration,
} from "@/lib/governance/validation/catalog";

export type {
  RuleCheckStatus,
  ValidationTarget,
  ValidationIntegration,
  ValidationFlowStep,
  ValidationFlow,
  ValidationRequest,
  ValidationResult,
} from "@/lib/governance/validation/types";

export type {
  ComplianceOverallStatus,
  RuleCheckResult,
  ComplianceReport,
  ComplianceReportSummary,
  ComplianceReportTemplateInput,
} from "@/lib/governance/reports/types";

export {
  createComplianceReportTemplate,
  summarizeComplianceReport,
  mergeRuleResultsIntoReport,
  appendRecommendations,
  STANDARD_RECOMMENDATIONS,
} from "@/lib/governance/reports/factory";
