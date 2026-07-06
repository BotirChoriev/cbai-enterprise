/**
 * CBAI Global Indicator Framework
 *
 * Standardized indicator registry — not a scoring engine, AI model, or ranking system.
 * Constitution-compliant foundation for future entity evaluations.
 */

export {
  FRAMEWORK_VERSION,
  type IndicatorStatus,
  type SourceStatus,
  type ApplicableEntity,
  type IndicatorDomainId,
  type IndicatorMethodology,
  type IndicatorDefinition,
  type IndicatorDomainDefinition,
  type EvidenceSourceDefinition,
  type PersonaIndicatorValue,
  type FutureIntegrationTarget,
  type IndicatorFrameworkRegistry,
} from "@/lib/indicator-framework/types";

export {
  GLOBAL_INDICATOR_REGISTRY,
  getIndicatorBySlug,
  getIndicatorById,
  getIndicatorsByDomain,
  getIndicatorsByStatus,
  getIndicatorsForEntity,
  getDomain,
  getSourcesByStatus,
  getRegistrySummary,
} from "@/lib/indicator-framework/registry";

export {
  INDICATOR_DOMAIN_CATALOG,
  getDomainById,
} from "@/lib/indicator-framework/domains/catalog";

export {
  ALL_DOMAIN_INDICATORS,
  GOVERNANCE_INDICATORS,
  ECONOMY_INDICATORS,
  SOCIAL_INDICATORS,
  SCIENCE_ENVIRONMENT_INDICATORS,
} from "@/lib/indicator-framework/indicators/catalog";

export {
  EVIDENCE_SOURCE_REGISTRY,
  getEvidenceSourceBySlug,
} from "@/lib/indicator-framework/sources/registry";

export { INDICATOR_PERSONA_MAPPING } from "@/lib/indicator-framework/personas/mapping";

export { FUTURE_INTEGRATION_MAP } from "@/lib/indicator-framework/integration/future";
