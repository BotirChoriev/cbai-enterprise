/**
 * CBAI Intelligence Runtime — Policy Engine (BUILD-044).
 *
 * Deterministic evaluation of runtime execution policies.
 * Callable but not yet enforced by the Orchestrator.
 *
 * @see docs/build-044-report.md
 */

export {
  DEFAULT_RUNTIME_POLICY_ENGINE_ID,
  DefaultPolicyEngine,
  defaultPolicyEngine,
  type PolicyEngine,
} from "@/lib/intelligence/runtime/policy/policy-engine";

export {
  evaluateRuntimePolicy,
  isBlockingPolicyDecision,
  isPermissivePolicyDecision,
  isTerminalPolicyDecision,
  resolvePolicyEvaluatedAt,
} from "@/lib/intelligence/runtime/policy/policy-evaluation";

export {
  POLICY_RULE_ALLOW_PROCEED,
  POLICY_RULE_BLOCKING_CONTRADICTION,
  POLICY_RULE_INVALID_EXECUTION_PLAN,
  POLICY_RULE_REQUIRED_STAGES_VALID,
  POLICY_RULE_RUNTIME_CANCELLED,
  POLICY_RULE_RUNTIME_FAILED,
  POLICY_RULE_RUNTIME_PAUSED,
  POLICY_RULE_WARNINGS_ONLY,
  RUNTIME_POLICY_RULE_ORDER,
  areRequiredStagesValid,
  collectPolicyWarnings,
  describeInvalidExecutionPlan,
  evaluateRuntimePolicyRules,
  hasBlockingContradiction,
  isExecutionPlanInvalid,
  type RuntimePolicyRuleId,
} from "@/lib/intelligence/runtime/policy/policy-rules";

export type {
  PolicyDecision,
  PolicyDecisionType,
  PolicyExecutionContext,
  PolicySeverity,
  RuntimePolicyEvaluationInput,
} from "@/lib/intelligence/runtime/policy/types";

export { RUNTIME_POLICY_ENGINE_VERSION } from "@/lib/intelligence/runtime/policy/types";
