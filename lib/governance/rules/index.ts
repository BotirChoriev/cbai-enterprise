export { ENTITY_RULES, getEntityRulesByType } from "@/lib/governance/rules/entity";
export {
  INDICATOR_RULES,
  getIndicatorRulesByLifecycle,
} from "@/lib/governance/rules/indicator";
export { UI_RULES, getUiRuleByConstraint } from "@/lib/governance/rules/ui";
export {
  PERSONA_RULES,
  REQUIRED_PERSONA_IDS,
  getPersonaRuleById,
} from "@/lib/governance/rules/persona";

import { ENTITY_RULES } from "@/lib/governance/rules/entity";
import { INDICATOR_RULES } from "@/lib/governance/rules/indicator";
import { UI_RULES } from "@/lib/governance/rules/ui";
import { PERSONA_RULES } from "@/lib/governance/rules/persona";
import type { GovernanceRule } from "@/lib/governance/types";

/** All module-level rules (entity, indicator, UI, persona). */
export const MODULE_RULES: readonly GovernanceRule[] = [
  ...ENTITY_RULES,
  ...INDICATOR_RULES,
  ...UI_RULES,
  ...PERSONA_RULES,
];
