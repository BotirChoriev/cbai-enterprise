import { CONSTITUTION_RULES } from "@/lib/governance/constitution/rules";
import { EVIDENCE_RULES } from "@/lib/governance/evidence/rules";
import { MODULE_RULES } from "@/lib/governance/rules";
import type { ValidationFlow } from "@/lib/governance/validation/types";
import { GOVERNANCE_VERSION } from "@/lib/governance/types";

const criticalConstitutionIds = CONSTITUTION_RULES.filter(
  (r) => r.severity === "critical",
).map((r) => r.id);

const evidenceCoreIds = EVIDENCE_RULES.filter((r) =>
  ["evid-source-required", "evid-status-required", "evid-methodology-required"].includes(r.id),
).map((r) => r.id);

const entityRouteIds = MODULE_RULES.filter(
  (r) => r.category === "entity" && r.severity === "critical",
).map((r) => r.id);

const indicatorLifecycleIds = MODULE_RULES.filter(
  (r) => r.category === "indicator",
).map((r) => r.id);

const uiCriticalIds = MODULE_RULES.filter(
  (r) => r.category === "ui" && r.severity === "critical",
).map((r) => r.id);

const personaIds = MODULE_RULES.filter((r) => r.category === "persona").map(
  (r) => r.id,
);

/**
 * Declarative validation flow — defines what future CI/CD will check.
 * No steps are executed by this framework.
 */
export const DEFAULT_VALIDATION_FLOW: ValidationFlow = {
  id: "cbai-default-validation-flow",
  version: GOVERNANCE_VERSION,
  title: "CBAI Constitution Default Validation Flow",
  description:
    "Ordered validation phases for module compliance. Future CI, GitHub Actions, and pre-release gates consume this catalog.",
  steps: [
    {
      id: "step-01-constitution",
      order: 1,
      title: "Constitution Principles",
      description:
        "Verify module against all critical constitutional principles before any feature review.",
      ruleCategories: ["constitution"],
      targets: ["route", "module", "library"],
      futureIntegration: "pre-release-gate",
      ruleIds: criticalConstitutionIds,
    },
    {
      id: "step-02-evidence",
      order: 2,
      title: "Evidence Requirements",
      description:
        "Confirm source, status, and methodology requirements for all displayed intelligence.",
      ruleCategories: ["evidence"],
      targets: ["route", "module", "component"],
      futureIntegration: "ci-pipeline",
      ruleIds: evidenceCoreIds,
    },
    {
      id: "step-03-entity",
      order: 3,
      title: "Entity Module Compliance",
      description:
        "Entity routes must follow Golden Rule patterns per entity type.",
      ruleCategories: ["entity"],
      targets: ["route", "module"],
      futureIntegration: "github-actions",
      ruleIds: entityRouteIds,
    },
    {
      id: "step-04-indicator",
      order: 4,
      title: "Indicator Registry Compliance",
      description:
        "Indicators must come from registry with valid lifecycle state.",
      ruleCategories: ["indicator"],
      targets: ["indicator-registry", "module"],
      futureIntegration: "ci-pipeline",
      ruleIds: indicatorLifecycleIds,
    },
    {
      id: "step-05-ui",
      order: 5,
      title: "UI Surface Compliance",
      description:
        "No fake KPIs, charts, confidence, or misleading AI wording.",
      ruleCategories: ["ui"],
      targets: ["route", "component"],
      futureIntegration: "github-actions",
      ruleIds: uiCriticalIds,
    },
    {
      id: "step-06-persona",
      order: 6,
      title: "Persona Coverage",
      description:
        "All six personas must receive honest value explanation.",
      ruleCategories: ["persona"],
      targets: ["route", "module"],
      futureIntegration: "pre-release-gate",
      ruleIds: personaIds,
    },
    {
      id: "step-07-manual-audit",
      order: 7,
      title: "Manual Constitution Audit",
      description:
        "Human reviewer sign-off against full rule registry and standards suite.",
      ruleCategories: [
        "constitution",
        "evidence",
        "entity",
        "indicator",
        "ui",
        "persona",
      ],
      targets: ["route", "module"],
      futureIntegration: "manual-audit",
      ruleIds: [],
    },
  ],
};

export function getValidationStepById(
  stepId: string,
): ValidationFlow["steps"][number] | undefined {
  return DEFAULT_VALIDATION_FLOW.steps.find((step) => step.id === stepId);
}

export function getValidationStepsByIntegration(
  integration: ValidationFlow["steps"][number]["futureIntegration"],
): ValidationFlow["steps"] {
  return DEFAULT_VALIDATION_FLOW.steps.filter(
    (step) => step.futureIntegration === integration,
  );
}
