import type { AgentTask } from "@/lib/intelligence/agents/tasks/task";
import type { AgentDefinition } from "@/lib/intelligence/agents/registry/types";
import type {
  DispatchPolicy,
  DispatchPolicySummary,
} from "@/lib/intelligence/agents/dispatch/types";
import {
  DISPATCH_POLICY_MODE_LABELS,
  type DispatchPolicyMode,
} from "@/lib/intelligence/agents/dispatch/types";
import type { IntelligenceType } from "@/lib/intelligence/request.types";

/**
 * Dispatch context for deterministic agent selection (BUILD-049).
 *
 * Contains task, available agents, optional runtime session reference, and policy.
 * No execution or provider calls.
 */
export interface DispatchContext {
  /** Task requiring agent selection. */
  task: AgentTask;
  /** Available agent definitions from the Agent Registry. */
  availableAgents: readonly AgentDefinition[];
  /** Optional runtime session id reference — not wired in BUILD-049. */
  runtimeSessionId?: string;
  /** Optional intelligence product type for matching. */
  intelligenceType?: IntelligenceType;
  /** Active dispatch policy. */
  policy: DispatchPolicy;
  /** ISO-8601 timestamp for deterministic evaluation. */
  evaluatedAt?: string;
}

/** Default dispatch policy — first eligible agent by id. */
export const DEFAULT_DISPATCH_POLICY: DispatchPolicy = {
  mode: "first-matching-agent",
};

/** Policy mode: first matching agent. */
export const DISPATCH_POLICY_FIRST_MATCHING_AGENT = "first-matching-agent" as const;

/** Policy mode: highest capability score. */
export const DISPATCH_POLICY_HIGHEST_CAPABILITY_SCORE = "highest-capability-score" as const;

/** Policy mode: single agent only. */
export const DISPATCH_POLICY_SINGLE_AGENT_ONLY = "single-agent-only" as const;

/** Policy mode: future multi-agent (reserved). */
export const DISPATCH_POLICY_FUTURE_MULTI_AGENT = "future-multi-agent" as const;

/**
 * Build a policy summary for audit and explainSelection output.
 */
export function buildDispatchPolicySummary(policy: DispatchPolicy): DispatchPolicySummary {
  return {
    mode: policy.mode,
    label: DISPATCH_POLICY_MODE_LABELS[policy.mode],
    multiAgentReserved: policy.mode === DISPATCH_POLICY_FUTURE_MULTI_AGENT,
  };
}

/**
 * Create a dispatch context envelope.
 */
export function createDispatchContext(input: {
  task: AgentTask;
  availableAgents: readonly AgentDefinition[];
  policy?: DispatchPolicy;
  runtimeSessionId?: string;
  intelligenceType?: IntelligenceType;
  evaluatedAt?: string;
}): DispatchContext {
  return {
    task: input.task,
    availableAgents: [...input.availableAgents],
    runtimeSessionId: input.runtimeSessionId ?? input.task.runtimeSessionId,
    intelligenceType: input.intelligenceType,
    policy: input.policy ?? DEFAULT_DISPATCH_POLICY,
    evaluatedAt: input.evaluatedAt,
  };
}

/**
 * Resolve evaluation timestamp from dispatch context.
 */
export function resolveDispatchEvaluatedAt(context: DispatchContext): string {
  return context.evaluatedAt ?? new Date().toISOString();
}

/**
 * Sort agent definitions deterministically by id.
 */
export function sortAgentsForDispatch(
  agents: readonly AgentDefinition[],
): AgentDefinition[] {
  return [...agents].sort((a, b) => a.id.localeCompare(b.id));
}

/**
 * Returns agents considered by policy before eligibility filtering.
 */
export function resolvePolicyCandidateAgents(context: DispatchContext): AgentDefinition[] {
  const sorted = sortAgentsForDispatch(context.availableAgents);

  if (context.policy.mode === DISPATCH_POLICY_SINGLE_AGENT_ONLY) {
    return sorted.filter((agent) => agent.id === context.task.agentId);
  }

  return sorted;
}

/**
 * Validate dispatch context has required fields.
 */
export function validateDispatchContext(
  context: DispatchContext,
): { valid: true } | { valid: false; reason: string } {
  if (!context.task.id.trim()) {
    return { valid: false, reason: "Dispatch reject: task id is required." };
  }

  if (context.availableAgents.length === 0) {
    return { valid: false, reason: "Dispatch reject: no available agents provided." };
  }

  if (
    context.policy.mode === DISPATCH_POLICY_SINGLE_AGENT_ONLY &&
    !context.task.agentId.trim()
  ) {
    return {
      valid: false,
      reason: "Dispatch reject: single-agent-only policy requires task agentId.",
    };
  }

  return { valid: true };
}

/**
 * Returns true when policy mode is the reserved multi-agent mode.
 */
export function isReservedMultiAgentPolicy(mode: DispatchPolicyMode): boolean {
  return mode === DISPATCH_POLICY_FUTURE_MULTI_AGENT;
}
