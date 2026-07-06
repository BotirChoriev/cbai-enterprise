import type { PolicyDecision } from "@/lib/intelligence/runtime/policy/types";
import type { PolicyDecisionType } from "@/lib/intelligence/runtime/policy/types";

/**
 * Deterministic request id prefix for harness runtime-cancel scenarios (BUILD-051).
 */
export const TEST_RUNTIME_CANCEL_REQUEST_PREFIX = "cbai-test-runtime-cancel:";

/**
 * Extract runtime policy fields for diagnostics attachment.
 */
export function extractRuntimePolicyDiagnostics(
  decision: PolicyDecision | undefined,
): {
  policyDecision?: PolicyDecisionType;
  policyName?: string;
  decisionReason?: string;
} {
  if (!decision) {
    return {};
  }

  return {
    policyDecision: decision.decision,
    policyName: decision.policyName,
    decisionReason: decision.reason,
  };
}

/**
 * Returns true when a harness request should trigger deterministic session cancel.
 */
export function isTestRuntimeCancelRequest(requestId: string): boolean {
  return requestId.startsWith(TEST_RUNTIME_CANCEL_REQUEST_PREFIX);
}
