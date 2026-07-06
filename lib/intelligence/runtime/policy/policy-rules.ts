import type { ExecutionPlan } from "@/lib/intelligence/orchestrator/types";
import type { RuntimeLifecycleStatus } from "@/lib/intelligence/runtime/runtime.types";
import type {
  PolicyDecision,
  RuntimePolicyEvaluationInput,
} from "@/lib/intelligence/runtime/policy/types";

/** Policy rule: runtime session cancelled. */
export const POLICY_RULE_RUNTIME_CANCELLED = "runtime-cancelled" as const;

/** Policy rule: runtime session failed. */
export const POLICY_RULE_RUNTIME_FAILED = "runtime-failed" as const;

/** Policy rule: blocking evidence contradiction. */
export const POLICY_RULE_BLOCKING_CONTRADICTION = "blocking-contradiction" as const;

/** Policy rule: invalid execution plan. */
export const POLICY_RULE_INVALID_EXECUTION_PLAN = "invalid-execution-plan" as const;

/** Policy rule: paused session (reserved — unsupported enforcement). */
export const POLICY_RULE_RUNTIME_PAUSED = "runtime-paused" as const;

/** Policy rule: non-blocking warnings only. */
export const POLICY_RULE_WARNINGS_ONLY = "warnings-only" as const;

/** Policy rule: all required stages valid. */
export const POLICY_RULE_REQUIRED_STAGES_VALID = "required-stages-valid" as const;

/** Policy rule: default allow proceed. */
export const POLICY_RULE_ALLOW_PROCEED = "allow-proceed" as const;

/** Ordered policy rule identifiers — first match wins. */
export const RUNTIME_POLICY_RULE_ORDER = [
  POLICY_RULE_RUNTIME_CANCELLED,
  POLICY_RULE_RUNTIME_FAILED,
  POLICY_RULE_BLOCKING_CONTRADICTION,
  POLICY_RULE_INVALID_EXECUTION_PLAN,
  POLICY_RULE_RUNTIME_PAUSED,
  POLICY_RULE_WARNINGS_ONLY,
  POLICY_RULE_REQUIRED_STAGES_VALID,
  POLICY_RULE_ALLOW_PROCEED,
] as const;

export type RuntimePolicyRuleId = (typeof RUNTIME_POLICY_RULE_ORDER)[number];

/**
 * Returns true when a required enabled stage has failed or stopped without completion.
 */
export function isExecutionPlanInvalid(plan: ExecutionPlan): boolean {
  return plan.stages.some(
    (stage) =>
      stage.enabled &&
      stage.required &&
      (stage.status === "failed" || stage.status === "stopped"),
  );
}

/**
 * Returns a deterministic reason when the execution plan is invalid.
 */
export function describeInvalidExecutionPlan(plan: ExecutionPlan): string {
  const invalidStage = plan.stages.find(
    (stage) =>
      stage.enabled &&
      stage.required &&
      (stage.status === "failed" || stage.status === "stopped"),
  );

  if (!invalidStage) {
    return "Execution plan is invalid.";
  }

  return `Execution plan invalid: required stage "${invalidStage.id}" is ${invalidStage.status}.`;
}

/**
 * Returns true when all enabled required stages completed or were legitimately skipped.
 */
export function areRequiredStagesValid(plan: ExecutionPlan): boolean {
  const requiredEnabled = plan.stages.filter((stage) => stage.enabled && stage.required);

  if (requiredEnabled.length === 0) {
    return false;
  }

  return requiredEnabled.every(
    (stage) => stage.status === "complete" || stage.status === "skipped",
  );
}

/**
 * Collect non-blocking warnings from all evaluation inputs.
 */
export function collectPolicyWarnings(input: RuntimePolicyEvaluationInput): string[] {
  const warnings = new Set<string>();
  const sessionState = input.session.snapshot();

  for (const warning of sessionState.warnings) {
    warnings.add(warning);
  }

  for (const warning of input.context.warnings) {
    warnings.add(warning);
  }

  if (input.diagnostics) {
    for (const issue of input.diagnostics.issues) {
      if (issue.severity !== "blocking") {
        warnings.add(issue.message);
      }
    }
  }

  if (input.trust?.trustWarnings) {
    for (const warning of input.trust.trustWarnings) {
      warnings.add(warning);
    }
  }

  return [...warnings].sort((a, b) => a.localeCompare(b));
}

/**
 * Returns true when blocking contradictions are present.
 */
export function hasBlockingContradiction(input: RuntimePolicyEvaluationInput): boolean {
  if (input.contradictionSummary?.hasBlockingConflict) {
    return true;
  }

  return input.context.blockingIssues.some((issue) =>
    issue.toLowerCase().includes("contradiction"),
  );
}

/**
 * Evaluate all runtime policy rules and return the first matching decision.
 */
export function evaluateRuntimePolicyRules(
  input: RuntimePolicyEvaluationInput,
  evaluatedAt: string,
): PolicyDecision {
  const sessionState = input.session.snapshot();

  const cancelled = evaluateRuntimeCancelledRule(sessionState.lifecycle, evaluatedAt);

  if (cancelled) {
    return cancelled;
  }

  const failed = evaluateRuntimeFailedRule(sessionState.lifecycle, evaluatedAt);

  if (failed) {
    return failed;
  }

  const contradiction = evaluateBlockingContradictionRule(input, evaluatedAt);

  if (contradiction) {
    return contradiction;
  }

  const invalidPlan = evaluateInvalidExecutionPlanRule(input.plan, evaluatedAt);

  if (invalidPlan) {
    return invalidPlan;
  }

  const paused = evaluateRuntimePausedRule(sessionState.lifecycle, evaluatedAt);

  if (paused) {
    return paused;
  }

  const warningsOnly = evaluateWarningsOnlyRule(input, evaluatedAt);

  if (warningsOnly) {
    return warningsOnly;
  }

  const requiredValid = evaluateRequiredStagesValidRule(input.plan, evaluatedAt);

  if (requiredValid) {
    return requiredValid;
  }

  return evaluateAllowProceedRule(evaluatedAt);
}

function evaluateRuntimeCancelledRule(
  lifecycle: RuntimeLifecycleStatus,
  evaluatedAt: string,
): PolicyDecision | null {
  if (lifecycle !== "cancelled") {
    return null;
  }

  return {
    decision: "cancel",
    reason: "Runtime session was cancelled — execution must not continue.",
    policyName: POLICY_RULE_RUNTIME_CANCELLED,
    severity: "critical",
    blocking: true,
    timestamp: evaluatedAt,
  };
}

function evaluateRuntimeFailedRule(
  lifecycle: RuntimeLifecycleStatus,
  evaluatedAt: string,
): PolicyDecision | null {
  if (lifecycle !== "failed") {
    return null;
  }

  return {
    decision: "deny",
    reason: "Runtime session failed — execution is blocked.",
    policyName: POLICY_RULE_RUNTIME_FAILED,
    severity: "error",
    blocking: true,
    timestamp: evaluatedAt,
  };
}

function evaluateBlockingContradictionRule(
  input: RuntimePolicyEvaluationInput,
  evaluatedAt: string,
): PolicyDecision | null {
  if (!hasBlockingContradiction(input)) {
    return null;
  }

  const count = input.contradictionSummary?.critical ?? 0;

  return {
    decision: "deny",
    reason:
      count > 0
        ? `Blocking contradiction detected (${count} critical) — execution is denied.`
        : "Blocking contradiction detected — execution is denied.",
    policyName: POLICY_RULE_BLOCKING_CONTRADICTION,
    severity: "critical",
    blocking: true,
    timestamp: evaluatedAt,
  };
}

function evaluateInvalidExecutionPlanRule(
  plan: ExecutionPlan,
  evaluatedAt: string,
): PolicyDecision | null {
  if (!isExecutionPlanInvalid(plan)) {
    return null;
  }

  return {
    decision: "deny",
    reason: describeInvalidExecutionPlan(plan),
    policyName: POLICY_RULE_INVALID_EXECUTION_PLAN,
    severity: "error",
    blocking: true,
    timestamp: evaluatedAt,
  };
}

function evaluateRuntimePausedRule(
  lifecycle: RuntimeLifecycleStatus,
  evaluatedAt: string,
): PolicyDecision | null {
  if (lifecycle !== "paused") {
    return null;
  }

  return {
    decision: "pause",
    reason:
      "Runtime session is paused — pause enforcement is reserved for future agent runtime integration.",
    policyName: POLICY_RULE_RUNTIME_PAUSED,
    severity: "warning",
    blocking: true,
    timestamp: evaluatedAt,
  };
}

function evaluateWarningsOnlyRule(
  input: RuntimePolicyEvaluationInput,
  evaluatedAt: string,
): PolicyDecision | null {
  const warnings = collectPolicyWarnings(input);

  if (warnings.length === 0) {
    return null;
  }

  return {
    decision: "continue",
    reason: `Non-blocking warnings present (${warnings.length}) — execution may continue with caution.`,
    policyName: POLICY_RULE_WARNINGS_ONLY,
    severity: "warning",
    blocking: false,
    timestamp: evaluatedAt,
  };
}

function evaluateRequiredStagesValidRule(
  plan: ExecutionPlan,
  evaluatedAt: string,
): PolicyDecision | null {
  if (!areRequiredStagesValid(plan)) {
    return null;
  }

  return {
    decision: "allow",
    reason: "All required stages are valid — execution is allowed.",
    policyName: POLICY_RULE_REQUIRED_STAGES_VALID,
    severity: "info",
    blocking: false,
    timestamp: evaluatedAt,
  };
}

function evaluateAllowProceedRule(evaluatedAt: string): PolicyDecision {
  return {
    decision: "allow",
    reason: "Runtime session may proceed — no blocking policy violations detected.",
    policyName: POLICY_RULE_ALLOW_PROCEED,
    severity: "info",
    blocking: false,
    timestamp: evaluatedAt,
  };
}
