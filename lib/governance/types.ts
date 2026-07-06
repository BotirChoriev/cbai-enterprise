/**
 * CBAI Constitution Enforcement Framework — core type system.
 * Governance definitions only. No runtime validation or execution.
 */

export const GOVERNANCE_VERSION = "1.0.0" as const;

export type RuleCategory =
  | "constitution"
  | "entity"
  | "indicator"
  | "evidence"
  | "ui"
  | "persona";

export type RuleSeverity = "critical" | "major" | "minor";

/** Declarative governance rule — consumed by future modules and CI, not executed here. */
export type GovernanceRule = {
  id: string;
  category: RuleCategory;
  slug: string;
  title: string;
  description: string;
  severity: RuleSeverity;
  allowed: readonly string[];
  forbidden: readonly string[];
  /** Reference to standards document path. */
  standardReference: string;
  version: typeof GOVERNANCE_VERSION;
};

export type ConstitutionPrincipleId =
  | "evidence-first"
  | "political-neutrality"
  | "human-benefit"
  | "transparency"
  | "golden-rule"
  | "methodology-before-metrics"
  | "separation-of-evidence-and-judgment"
  | "no-social-sentiment-scoring"
  | "zero-demo-policy"
  | "platform-consistency"
  | "explain-before-evaluate"
  | "no-fake-data";

export type ConstitutionRule = GovernanceRule & {
  category: "constitution";
  principleId: ConstitutionPrincipleId;
};

export type EntityTypeId =
  | "country"
  | "company"
  | "university"
  | "government"
  | "investor"
  | "person"
  | "institution";

export type EntityRule = GovernanceRule & {
  category: "entity";
  entityType: EntityTypeId;
};

export type IndicatorLifecycleState =
  | "planned"
  | "connected"
  | "verified"
  | "deprecated";

export type IndicatorRule = GovernanceRule & {
  category: "indicator";
  lifecycleState?: IndicatorLifecycleState;
};

export type EvidenceRule = GovernanceRule & {
  category: "evidence";
  requirement: "source-required" | "status-required" | "methodology-required";
};

export type UiRule = GovernanceRule & {
  category: "ui";
  uiConstraint:
    | "no-fake-kpi"
    | "no-fake-charts"
    | "no-fake-confidence"
    | "no-ai-wording"
    | "accessibility-required";
};

export type PersonaId =
  | "citizen"
  | "investor"
  | "government"
  | "student"
  | "researcher"
  | "academic";

export type PersonaRule = GovernanceRule & {
  category: "persona";
  personaId: PersonaId;
};

export type AnyGovernanceRule =
  | ConstitutionRule
  | EntityRule
  | IndicatorRule
  | EvidenceRule
  | UiRule
  | PersonaRule;

export type GovernanceRuleRegistry = {
  version: typeof GOVERNANCE_VERSION;
  constitution: readonly ConstitutionRule[];
  entity: readonly EntityRule[];
  indicator: readonly IndicatorRule[];
  evidence: readonly EvidenceRule[];
  ui: readonly UiRule[];
  persona: readonly PersonaRule[];
};
