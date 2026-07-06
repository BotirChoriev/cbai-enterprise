/**
 * CBAI Intelligence — Agent Dispatch Foundation (BUILD-049).
 *
 * Deterministic agent selection for tasks.
 * No execution, provider SDKs, or runtime wiring.
 *
 * @see docs/build-049-report.md
 */

export {
  DEFAULT_AGENT_DISPATCHER_ID,
  DefaultAgentDispatcher,
  defaultAgentDispatcher,
  buildAgentDispatchContext,
  type AgentDispatchInput,
  type AgentDispatcher,
} from "@/lib/intelligence/agents/dispatch/dispatcher";

export {
  DEFAULT_DISPATCH_POLICY,
  DISPATCH_POLICY_FIRST_MATCHING_AGENT,
  DISPATCH_POLICY_FUTURE_MULTI_AGENT,
  DISPATCH_POLICY_HIGHEST_CAPABILITY_SCORE,
  DISPATCH_POLICY_SINGLE_AGENT_ONLY,
  buildDispatchPolicySummary,
  createDispatchContext,
  isReservedMultiAgentPolicy,
  resolveDispatchEvaluatedAt,
  resolvePolicyCandidateAgents,
  sortAgentsForDispatch,
  validateDispatchContext,
  type DispatchContext,
} from "@/lib/intelligence/agents/dispatch/dispatch-context";

export {
  buildDispatchCandidates,
  computeCapabilityScore,
  evaluateAgentEligibility,
  explainAgentSelection,
  findCapabilityMismatch,
  findEntityTypeMismatch,
  findIntelligenceTypeMismatch,
  selectAgentByPolicy,
  validateAgentAssignment,
} from "@/lib/intelligence/agents/dispatch/dispatch-policy";

export {
  copyDispatchResult,
  createDispatchResult,
  createRejectedDispatchResult,
  createUnsupportedDispatchResult,
  isDispatchSelected,
  type DispatchResult,
} from "@/lib/intelligence/agents/dispatch/dispatch-result";

export type {
  DispatchAssignmentValidation,
  DispatchCandidateAgent,
  DispatchCapabilityScore,
  DispatchDecision,
  DispatchPolicy,
  DispatchPolicyMode,
  DispatchPolicySummary,
  DispatchRejectionReason,
  DispatchRequiredCapabilities,
} from "@/lib/intelligence/agents/dispatch/types";

export {
  AGENT_DISPATCH_VERSION,
  DISPATCH_POLICY_MODE_LABELS,
} from "@/lib/intelligence/agents/dispatch/types";
