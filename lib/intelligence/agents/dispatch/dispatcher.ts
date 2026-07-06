import {
  buildDispatchPolicySummary,
  createDispatchContext,
  resolveDispatchEvaluatedAt,
  validateDispatchContext,
  type DispatchContext,
} from "@/lib/intelligence/agents/dispatch/dispatch-context";
import {
  createDispatchResult,
  createRejectedDispatchResult,
  createUnsupportedDispatchResult,
  type DispatchResult,
} from "@/lib/intelligence/agents/dispatch/dispatch-result";
import {
  buildDispatchCandidates,
  explainAgentSelection,
  selectAgentByPolicy,
  validateAgentAssignment,
} from "@/lib/intelligence/agents/dispatch/dispatch-policy";
import type {
  DispatchAssignmentValidation,
  DispatchPolicy,
} from "@/lib/intelligence/agents/dispatch/types";
import type { AgentDefinition } from "@/lib/intelligence/agents/registry/types";
import type { AgentTask } from "@/lib/intelligence/agents/tasks/task";
import { validateAgentTask } from "@/lib/intelligence/agents/tasks/task";
import type { IntelligenceType } from "@/lib/intelligence/request.types";

/** Stable identifier for the default agent dispatcher. */
export const DEFAULT_AGENT_DISPATCHER_ID = "default-agent-dispatcher";

/**
 * Input for dispatcher operations requiring registry agents.
 */
export interface AgentDispatchInput {
  /** Task requiring agent selection. */
  task: AgentTask;
  /** Available agent definitions. */
  availableAgents: readonly AgentDefinition[];
  /** Optional dispatch policy override. */
  policy?: DispatchPolicy;
  /** Optional runtime session id reference. */
  runtimeSessionId?: string;
  /** Optional intelligence type for matching. */
  intelligenceType?: IntelligenceType;
  /** Optional evaluation timestamp. */
  evaluatedAt?: string;
}

/**
 * Contract for the CBAI Agent Dispatcher (BUILD-049).
 *
 * Performs deterministic agent selection for tasks.
 * Does not execute agents or call provider SDKs.
 */
export interface AgentDispatcher {
  /** Active dispatch policy. */
  readonly policy: DispatchPolicy;

  /** Dispatch a task and return selection result. */
  dispatch(input: AgentDispatchInput): DispatchResult;

  /** Select an agent id for a task — null when none eligible. */
  selectAgent(input: AgentDispatchInput): string | null;

  /** Validate a specific agent assignment for a task. */
  validateAssignment(input: {
    task: AgentTask;
    agentId: string;
    availableAgents: readonly AgentDefinition[];
    intelligenceType?: IntelligenceType;
  }): DispatchAssignmentValidation;

  /** Explain selection outcome for a task. */
  explainSelection(input: AgentDispatchInput): string;
}

/**
 * Build dispatch context from dispatcher input.
 */
export function buildAgentDispatchContext(input: AgentDispatchInput): DispatchContext {
  return createDispatchContext({
    task: input.task,
    availableAgents: input.availableAgents,
    policy: input.policy,
    runtimeSessionId: input.runtimeSessionId,
    intelligenceType: input.intelligenceType,
    evaluatedAt: input.evaluatedAt,
  });
}

/**
 * Default deterministic agent dispatcher (BUILD-049).
 */
export class DefaultAgentDispatcher implements AgentDispatcher {
  readonly policy: DispatchPolicy;

  constructor(policy: DispatchPolicy = { mode: "first-matching-agent" }) {
    this.policy = { ...policy };
  }

  dispatch(input: AgentDispatchInput): DispatchResult {
    const context = buildAgentDispatchContext({ ...input, policy: input.policy ?? this.policy });
    const timestamp = resolveDispatchEvaluatedAt(context);

    const taskValidation = validateAgentTask(context.task);

    if (!taskValidation.valid) {
      return createRejectedDispatchResult({
        reason: taskValidation.reason,
        candidateAgents: [],
        timestamp,
      });
    }

    const contextValidation = validateDispatchContext(context);

    if (!contextValidation.valid) {
      return createRejectedDispatchResult({
        reason: contextValidation.reason,
        candidateAgents: buildDispatchCandidates(context),
        timestamp,
      });
    }

    if (context.policy.mode === "future-multi-agent") {
      return createUnsupportedDispatchResult({
        reason: explainAgentSelection(context),
        candidateAgents: buildDispatchCandidates(context),
        timestamp,
      });
    }

    const selection = selectAgentByPolicy(context);

    if (!selection.selectedAgent) {
      return createRejectedDispatchResult({
        reason: selection.reason,
        candidateAgents: selection.candidates,
        timestamp,
      });
    }

    const policySummary = buildDispatchPolicySummary(context.policy);

    return createDispatchResult({
      selectedAgentId: selection.selectedAgent.id,
      decision: "selected",
      reason: selection.reason,
      warnings: policySummary.multiAgentReserved
        ? ["Multi-agent dispatch policy is reserved."]
        : [],
      candidateAgents: selection.candidates,
      timestamp,
    });
  }

  selectAgent(input: AgentDispatchInput): string | null {
    return this.dispatch(input).selectedAgentId;
  }

  validateAssignment(input: {
    task: AgentTask;
    agentId: string;
    availableAgents: readonly AgentDefinition[];
    intelligenceType?: IntelligenceType;
  }): DispatchAssignmentValidation {
    const result = validateAgentAssignment(input);

    return {
      valid: result.valid,
      agentId: input.agentId,
      reason: result.reason,
    };
  }

  explainSelection(input: AgentDispatchInput): string {
    const context = buildAgentDispatchContext({ ...input, policy: input.policy ?? this.policy });
    return explainAgentSelection(context);
  }
}

/** Shared default agent dispatcher singleton. */
export const defaultAgentDispatcher = new DefaultAgentDispatcher();

export {
  buildDispatchPolicySummary,
  createDispatchContext,
  DEFAULT_DISPATCH_POLICY,
  DISPATCH_POLICY_FIRST_MATCHING_AGENT,
  DISPATCH_POLICY_FUTURE_MULTI_AGENT,
  DISPATCH_POLICY_HIGHEST_CAPABILITY_SCORE,
  DISPATCH_POLICY_SINGLE_AGENT_ONLY,
} from "@/lib/intelligence/agents/dispatch/dispatch-context";

export {
  buildDispatchCandidates,
  computeCapabilityScore,
  evaluateAgentEligibility,
  explainAgentSelection,
  selectAgentByPolicy,
  validateAgentAssignment,
} from "@/lib/intelligence/agents/dispatch/dispatch-policy";

export type { DispatchContext } from "@/lib/intelligence/agents/dispatch/dispatch-context";

export {
  copyDispatchResult,
  createDispatchResult,
  createRejectedDispatchResult,
  createUnsupportedDispatchResult,
  isDispatchSelected,
  type DispatchResult,
} from "@/lib/intelligence/agents/dispatch/dispatch-result";
