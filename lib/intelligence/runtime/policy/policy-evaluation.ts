import { evaluateRuntimePolicyRules } from "@/lib/intelligence/runtime/policy/policy-rules";
import type {
  PolicyDecision,
  RuntimePolicyEvaluationInput,
} from "@/lib/intelligence/runtime/policy/types";

/**
 * Resolve evaluation timestamp from input.
 */
export function resolvePolicyEvaluatedAt(
  input: RuntimePolicyEvaluationInput,
): string {
  return input.evaluatedAt ?? new Date().toISOString();
}

/**
 * Evaluate runtime policy for a session and return a deterministic decision.
 */
export function evaluateRuntimePolicy(
  input: RuntimePolicyEvaluationInput,
): PolicyDecision {
  const evaluatedAt = resolvePolicyEvaluatedAt(input);
  return evaluateRuntimePolicyRules(input, evaluatedAt);
}

/**
 * Returns true when a policy decision blocks further execution.
 */
export function isBlockingPolicyDecision(decision: PolicyDecision): boolean {
  return decision.blocking;
}

/**
 * Returns true when the decision permits stage progression.
 */
export function isPermissivePolicyDecision(decision: PolicyDecision): boolean {
  return decision.decision === "allow" || decision.decision === "continue";
}

/**
 * Returns true when the decision terminates or rejects execution.
 */
export function isTerminalPolicyDecision(decision: PolicyDecision): boolean {
  return decision.decision === "deny" || decision.decision === "cancel";
}
