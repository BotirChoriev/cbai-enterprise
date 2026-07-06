import type { RuleCategory } from "@/lib/governance/types";

/** How a rule check may be recorded — populated by future validators, not this framework. */
export type RuleCheckStatus = "passed" | "failed" | "warning" | "skipped";

/** Target surface for future validation — declarative only. */
export type ValidationTarget =
  | "route"
  | "module"
  | "component"
  | "library"
  | "indicator-registry"
  | "api-schema";

/** Future integration channel for validation execution. */
export type ValidationIntegration =
  | "manual-audit"
  | "ci-pipeline"
  | "github-actions"
  | "pre-release-gate";

/** Single step in the declarative validation flow — no execution. */
export type ValidationFlowStep = {
  id: string;
  order: number;
  title: string;
  description: string;
  ruleCategories: readonly RuleCategory[];
  targets: readonly ValidationTarget[];
  futureIntegration: ValidationIntegration;
  /** Rule IDs to evaluate in this step (reference only). */
  ruleIds: readonly string[];
};

/** Full validation flow definition for future CI/CD. */
export type ValidationFlow = {
  id: string;
  version: string;
  title: string;
  description: string;
  steps: readonly ValidationFlowStep[];
};

/** Input shape future validators will accept — typed contract only. */
export type ValidationRequest = {
  moduleId: string;
  moduleName: string;
  target: ValidationTarget;
  routePath?: string;
  ruleCategories?: readonly RuleCategory[];
  requestedBy: string;
  requestedAt: string;
};

/** Output shape future validators will produce — typed contract only. */
export type ValidationResult = {
  request: ValidationRequest;
  completedAt: string;
  reportId: string;
  note: "Framework defines shape only — no automatic validation executed.";
};
