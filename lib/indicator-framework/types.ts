/**
 * CBAI Global Indicator Framework — core type system.
 * Registry only. No scores, rankings, or inference.
 */

export const FRAMEWORK_VERSION = "1.0.0" as const;

export type IndicatorStatus = "connected" | "not_connected" | "planned";

export type SourceStatus = "connected" | "not_connected" | "planned";

export type ApplicableEntity =
  | "country"
  | "company"
  | "university"
  | "government"
  | "institution";

export type IndicatorDomainId =
  | "governance"
  | "economy"
  | "human-rights"
  | "education"
  | "research"
  | "innovation"
  | "infrastructure"
  | "environment"
  | "energy"
  | "health"
  | "employment"
  | "digital-development"
  | "public-procurement"
  | "budget-transparency"
  | "judicial-system"
  | "public-services"
  | "trade"
  | "investment"
  | "industry"
  | "agriculture"
  | "climate"
  | "disaster-preparedness";

export type IndicatorMethodology = {
  /** Why this indicator exists. */
  whyItExists: string;
  /** What evidence it requires. */
  requiredEvidence: string;
  /** What evidence is currently missing. */
  missingEvidence: string;
  /** How future evaluation could be derived — not implemented. */
  futureScoringDerivation: string;
};

export type IndicatorDefinition = {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: IndicatorDomainId;
  methodology: IndicatorMethodology;
  requiredEvidenceSources: readonly string[];
  optionalEvidenceSources: readonly string[];
  status: IndicatorStatus;
  applicableEntities: readonly ApplicableEntity[];
  version: string;
};

export type IndicatorDomainDefinition = {
  id: IndicatorDomainId;
  slug: string;
  title: string;
  purpose: string;
  scope: string;
  evidenceExpectations: string;
  futureExpansion: string;
};

export type EvidenceSourceDefinition = {
  id: string;
  slug: string;
  name: string;
  description: string;
  status: SourceStatus;
  examples: readonly string[];
};

export type PersonaIndicatorValue = {
  id: string;
  title: string;
  indicatorValue: string;
};

export type FutureIntegrationTarget = {
  id: string;
  label: string;
  description: string;
  status: "planned";
};

export type IndicatorFrameworkRegistry = {
  version: typeof FRAMEWORK_VERSION;
  domains: readonly IndicatorDomainDefinition[];
  indicators: readonly IndicatorDefinition[];
  sources: readonly EvidenceSourceDefinition[];
  personas: readonly PersonaIndicatorValue[];
  futureIntegration: readonly FutureIntegrationTarget[];
};
