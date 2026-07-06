import { agentHasCapability } from "@/lib/intelligence/agents/registry/agent-capabilities";
import {
  isDeprecatedAgentStatus,
  isEnabledAgentStatus,
} from "@/lib/intelligence/agents/registry/agent-definition";
import type { AgentDefinition } from "@/lib/intelligence/agents/registry/types";
import type { AgentCapability } from "@/lib/intelligence/agents/registry/types";
import type { DispatchContext } from "@/lib/intelligence/agents/dispatch/dispatch-context";
import {
  DISPATCH_POLICY_FUTURE_MULTI_AGENT,
  DISPATCH_POLICY_HIGHEST_CAPABILITY_SCORE,
  isReservedMultiAgentPolicy,
  resolvePolicyCandidateAgents,
  sortAgentsForDispatch,
} from "@/lib/intelligence/agents/dispatch/dispatch-context";
import type {
  DispatchCandidateAgent,
  DispatchRejectionReason,
} from "@/lib/intelligence/agents/dispatch/types";
import type { AgentTask } from "@/lib/intelligence/agents/tasks/task";
import type { EntityType } from "@/lib/entity/entity.types";
import type { IntelligenceType } from "@/lib/intelligence/request.types";

/**
 * Evaluate agent eligibility for a task — deterministic, no execution.
 */
export function evaluateAgentEligibility(input: {
  agent: AgentDefinition;
  task: AgentTask;
  intelligenceType?: IntelligenceType;
}): { eligible: true; reason: string; capabilityScore: number } | {
  eligible: false;
  reason: string;
  rejection: DispatchRejectionReason;
  capabilityScore: number;
} {
  const capabilityScore = computeCapabilityScore(
    input.agent,
    input.task.taskRequest.requestedCapabilities,
  );

  if (isDeprecatedAgentStatus(input.agent.status)) {
    return {
      eligible: false,
      reason: `Agent "${input.agent.id}" rejected: status is deprecated.`,
      rejection: "agent-deprecated",
      capabilityScore,
    };
  }

  if (input.agent.status === "disabled") {
    return {
      eligible: false,
      reason: `Agent "${input.agent.id}" rejected: status is disabled.`,
      rejection: "agent-disabled",
      capabilityScore,
    };
  }

  if (!isEnabledAgentStatus(input.agent.status)) {
    return {
      eligible: false,
      reason: `Agent "${input.agent.id}" rejected: status is not enabled.`,
      rejection: "agent-not-enabled",
      capabilityScore,
    };
  }

  const capabilityMismatch = findCapabilityMismatch(
    input.agent,
    input.task.taskRequest.requestedCapabilities,
  );

  if (capabilityMismatch) {
    return {
      eligible: false,
      reason: `Agent "${input.agent.id}" rejected: missing capability "${capabilityMismatch}".`,
      rejection: "capability-mismatch",
      capabilityScore,
    };
  }

  const entityMismatch = findEntityTypeMismatch(
    input.agent,
    input.task.taskRequest.subjectEntities.map((entity) => entity.type),
  );

  if (entityMismatch) {
    return {
      eligible: false,
      reason: `Agent "${input.agent.id}" rejected: unsupported entity type "${entityMismatch}".`,
      rejection: "entity-mismatch",
      capabilityScore,
    };
  }

  if (input.intelligenceType) {
    const intelligenceMismatch = findIntelligenceTypeMismatch(
      input.agent,
      input.intelligenceType,
    );

    if (intelligenceMismatch) {
      return {
        eligible: false,
        reason: `Agent "${input.agent.id}" rejected: unsupported intelligence type "${input.intelligenceType}".`,
        rejection: "intelligence-type-mismatch",
        capabilityScore,
      };
    }
  }

  return {
    eligible: true,
    reason: `Agent "${input.agent.id}" eligible — capabilities, entity, and status checks passed.`,
    capabilityScore,
  };
}

/**
 * Count matching requested capabilities on an agent definition.
 */
export function computeCapabilityScore(
  agent: AgentDefinition,
  requestedCapabilities: readonly AgentCapability[],
): number {
  if (requestedCapabilities.length === 0) {
    return agent.capabilities.length;
  }

  return requestedCapabilities.filter((capability) =>
    agentHasCapability(agent.capabilities, capability),
  ).length;
}

/**
 * Returns first missing requested capability, if any.
 */
export function findCapabilityMismatch(
  agent: AgentDefinition,
  requestedCapabilities: readonly AgentCapability[],
): AgentCapability | null {
  for (const capability of requestedCapabilities) {
    if (!agentHasCapability(agent.capabilities, capability)) {
      return capability;
    }
  }

  return null;
}

/**
 * Returns first unsupported entity type, if agent declares entity support.
 */
export function findEntityTypeMismatch(
  agent: AgentDefinition,
  entityTypes: readonly EntityType[],
): EntityType | null {
  if (entityTypes.length === 0 || agent.supportedEntityTypes.length === 0) {
    return null;
  }

  for (const entityType of entityTypes) {
    if (!agent.supportedEntityTypes.includes(entityType)) {
      return entityType;
    }
  }

  return null;
}

/**
 * Returns intelligence type when unsupported by agent declarations.
 */
export function findIntelligenceTypeMismatch(
  agent: AgentDefinition,
  intelligenceType: IntelligenceType,
): IntelligenceType | null {
  if (agent.supportedIntelligenceTypes.length === 0) {
    return null;
  }

  return agent.supportedIntelligenceTypes.includes(intelligenceType)
    ? null
    : intelligenceType;
}

/**
 * Build candidate summaries for all policy-visible agents.
 */
export function buildDispatchCandidates(context: DispatchContext): DispatchCandidateAgent[] {
  const candidates = resolvePolicyCandidateAgents(context);

  return candidates.map((agent) => {
    const evaluation = evaluateAgentEligibility({
      agent,
      task: context.task,
      intelligenceType: context.intelligenceType,
    });

    return {
      agentId: agent.id,
      name: agent.name,
      eligible: evaluation.eligible,
      reason: evaluation.reason,
      capabilityScore: evaluation.capabilityScore,
    };
  });
}

/**
 * Select agent using configured dispatch policy — deterministic only.
 */
export function selectAgentByPolicy(context: DispatchContext): {
  selectedAgent: AgentDefinition | null;
  candidates: DispatchCandidateAgent[];
  reason: string;
} {
  if (isReservedMultiAgentPolicy(context.policy.mode)) {
    return {
      selectedAgent: null,
      candidates: buildDispatchCandidates(context),
      reason: "Multi-agent dispatch is reserved for a future build — policy not active in BUILD-049.",
    };
  }

  const candidates = buildDispatchCandidates(context);
  const eligibleAgents = resolvePolicyCandidateAgents(context).filter((agent) => {
    const evaluation = evaluateAgentEligibility({
      agent,
      task: context.task,
      intelligenceType: context.intelligenceType,
    });

    return evaluation.eligible;
  });

  if (eligibleAgents.length === 0) {
    return {
      selectedAgent: null,
      candidates,
      reason: "No eligible agents found for task — all candidates rejected by selection rules.",
    };
  }

  if (context.policy.mode === DISPATCH_POLICY_HIGHEST_CAPABILITY_SCORE) {
    const selected = [...eligibleAgents].sort((a, b) => {
      const scoreCompare =
        computeCapabilityScore(b, context.task.taskRequest.requestedCapabilities) -
        computeCapabilityScore(a, context.task.taskRequest.requestedCapabilities);

      if (scoreCompare !== 0) {
        return scoreCompare;
      }

      return a.id.localeCompare(b.id);
    })[0];

    return {
      selectedAgent: selected,
      candidates,
      reason: `Selected agent "${selected.id}" by highest capability score policy.`,
    };
  }

  const selected = sortAgentsForDispatch(eligibleAgents)[0];

  return {
    selectedAgent: selected,
    candidates,
    reason: `Selected agent "${selected.id}" by first matching agent policy.`,
  };
}

/**
 * Validate whether a specific agent assignment is allowed for a task.
 */
export function validateAgentAssignment(input: {
  task: AgentTask;
  agentId: string;
  availableAgents: readonly AgentDefinition[];
  intelligenceType?: IntelligenceType;
}): { valid: true; reason: string } | { valid: false; reason: string } {
  const agent = input.availableAgents.find((entry) => entry.id === input.agentId);

  if (!agent) {
    return {
      valid: false,
      reason: `Assignment reject: agent id "${input.agentId}" not found in available agents.`,
    };
  }

  const evaluation = evaluateAgentEligibility({
    agent,
    task: input.task,
    intelligenceType: input.intelligenceType,
  });

  if (!evaluation.eligible) {
    return { valid: false, reason: evaluation.reason };
  }

  return {
    valid: true,
    reason: `Assignment valid: agent "${input.agentId}" satisfies selection rules.`,
  };
}

/**
 * Explain selection outcome without mutating task state.
 */
export function explainAgentSelection(context: DispatchContext): string {
  if (context.policy.mode === DISPATCH_POLICY_FUTURE_MULTI_AGENT) {
    return "Future multi-agent dispatch policy is reserved and not active in BUILD-049.";
  }

  const selection = selectAgentByPolicy(context);

  if (!selection.selectedAgent) {
    const rejected = selection.candidates
      .filter((candidate) => !candidate.eligible)
      .map((candidate) => `${candidate.agentId}: ${candidate.reason}`)
      .join(" | ");

    return rejected
      ? `${selection.reason} Rejected: ${rejected}`
      : selection.reason;
  }

  return `${selection.reason} Candidates evaluated: ${selection.candidates.length}.`;
}
