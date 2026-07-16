import type { TranslationDictionary } from "@/lib/i18n/dictionary-types";
import type {
  GovernanceControlModel,
  GovernanceRuleCategoryRow,
  GovernanceValidationStep,
} from "@/lib/governance-control-center";
import type { RuleCategory } from "@/lib/governance/types";

export function translateGovernanceCategory(
  dictionary: TranslationDictionary,
  row: GovernanceRuleCategoryRow,
): GovernanceRuleCategoryRow {
  const copy = dictionary.governanceCenter.categories[row.category as RuleCategory];
  if (!copy) return row;
  return {
    ...row,
    label: copy.label,
    purpose: copy.purpose,
    status: dictionary.governanceCenter.statusRegistered as GovernanceRuleCategoryRow["status"],
  };
}

export function translateGovernanceValidationStep(
  dictionary: TranslationDictionary,
  step: GovernanceValidationStep,
): GovernanceValidationStep {
  const copy =
    dictionary.governanceCenter.validationStepContent[
      step.id as keyof typeof dictionary.governanceCenter.validationStepContent
    ];
  if (!copy) return step;
  return {
    ...step,
    title: copy.title,
    description: copy.description,
    status: dictionary.governanceCenter.statusDeclared as GovernanceValidationStep["status"],
  };
}

export function translateGovernanceControlModel(
  dictionary: TranslationDictionary,
  model: GovernanceControlModel,
): GovernanceControlModel {
  const gc = dictionary.governanceCenter;
  return {
    ...model,
    ruleCategories: model.ruleCategories.map((row) => translateGovernanceCategory(dictionary, row)),
    principles: model.principles.map((principle) => {
      const copy = gc.principles[principle.id as keyof typeof gc.principles];
      return copy
        ? {
            ...principle,
            title: copy.title,
            description: copy.description,
          }
        : principle;
    }),
    validationPipeline: model.validationPipeline.map((step) =>
      translateGovernanceValidationStep(dictionary, step),
    ),
    personas: model.personas.map((persona) => {
      const copy = gc.personas[persona.id as keyof typeof gc.personas];
      return copy ? { ...persona, title: copy.title, protectionAnswer: copy.protection } : persona;
    }),
    limits: model.limits.map((limit) => {
      const copy = gc.limits[limit.id as keyof typeof gc.limits];
      return copy ? { ...limit, title: copy.title, description: copy.description } : limit;
    }),
  };
}
