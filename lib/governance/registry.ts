import { CONSTITUTION_RULES } from "@/lib/governance/constitution/rules";
import { EVIDENCE_RULES } from "@/lib/governance/evidence/rules";
import { ENTITY_RULES } from "@/lib/governance/rules/entity";
import { INDICATOR_RULES } from "@/lib/governance/rules/indicator";
import { PERSONA_RULES } from "@/lib/governance/rules/persona";
import { UI_RULES } from "@/lib/governance/rules/ui";
import type {
  AnyGovernanceRule,
  GovernanceRuleRegistry,
  RuleCategory,
} from "@/lib/governance/types";
import { GOVERNANCE_VERSION } from "@/lib/governance/types";

/** Complete governance rule registry — single read-only source of truth. */
export const GOVERNANCE_RULE_REGISTRY: GovernanceRuleRegistry = {
  version: GOVERNANCE_VERSION,
  constitution: CONSTITUTION_RULES,
  entity: ENTITY_RULES,
  indicator: INDICATOR_RULES,
  ui: UI_RULES,
  persona: PERSONA_RULES,
  evidence: EVIDENCE_RULES,
};

export const ALL_GOVERNANCE_RULES: readonly AnyGovernanceRule[] = [
  ...CONSTITUTION_RULES,
  ...EVIDENCE_RULES,
  ...ENTITY_RULES,
  ...INDICATOR_RULES,
  ...UI_RULES,
  ...PERSONA_RULES,
];

export function getRuleById(ruleId: string): AnyGovernanceRule | undefined {
  return ALL_GOVERNANCE_RULES.find((rule) => rule.id === ruleId);
}

export function getRulesByCategory(
  category: RuleCategory,
): AnyGovernanceRule[] {
  switch (category) {
    case "constitution":
      return [...CONSTITUTION_RULES];
    case "evidence":
      return [...EVIDENCE_RULES];
    case "entity":
      return [...ENTITY_RULES];
    case "indicator":
      return [...INDICATOR_RULES];
    case "ui":
      return [...UI_RULES];
    case "persona":
      return [...PERSONA_RULES];
    default:
      return [];
  }
}

export function getCriticalRules(): AnyGovernanceRule[] {
  return ALL_GOVERNANCE_RULES.filter((rule) => rule.severity === "critical");
}

export function getRegistrySummary() {
  return {
    version: GOVERNANCE_VERSION,
    totalRules: ALL_GOVERNANCE_RULES.length,
    constitutionRules: CONSTITUTION_RULES.length,
    evidenceRules: EVIDENCE_RULES.length,
    entityRules: GOVERNANCE_RULE_REGISTRY.entity.length,
    indicatorRules: GOVERNANCE_RULE_REGISTRY.indicator.length,
    uiRules: GOVERNANCE_RULE_REGISTRY.ui.length,
    personaRules: GOVERNANCE_RULE_REGISTRY.persona.length,
    criticalRules: getCriticalRules().length,
  };
}
