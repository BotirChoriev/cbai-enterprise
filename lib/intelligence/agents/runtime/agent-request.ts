import { createAgentContext, type AgentContext } from "@/lib/intelligence/agents/runtime/agent-context";
import type { AgentLifecycleStatus } from "@/lib/intelligence/agents/runtime/agent-lifecycle";
import type { ProviderKind } from "@/lib/intelligence/agents/runtime/provider-kinds";
import type { AgentDefinition } from "@/lib/intelligence/agents/registry/types";

/**
 * Agent request envelope for contract operations (BUILD-047).
 *
 * Metadata-only input — no model prompts or fabricated outputs.
 */
export interface AgentRequest {
  /** Unique request envelope identifier. */
  envelopeId: string;
  /** Target agent id from the Agent Registry. */
  agentId: string;
  /** Declared provider kind for this request. */
  providerKind: ProviderKind;
  /** Source intelligence request id. */
  requestId: string;
  /** Agent runtime context. */
  context: AgentContext;
  /** Optional natural-language question metadata — not sent to any provider in BUILD-047. */
  question?: string;
  /** ISO-8601 timestamp when the envelope was created. */
  requestedAt: string;
  /** Current agent runtime lifecycle status. */
  lifecycle: AgentLifecycleStatus;
  /** Optional linked registry definition for validation and describe. */
  agentDefinition?: AgentDefinition;
}

/** Agent request envelope sequence for deterministic id generation. */
let agentRequestSequence = 0;

/**
 * Reset agent request sequence — useful for deterministic tests.
 */
export function resetAgentRequestSequence(): void {
  agentRequestSequence = 0;
}

/**
 * Generate a unique agent request envelope identifier.
 */
export function createAgentRequestEnvelopeId(requestId: string): string {
  agentRequestSequence += 1;
  return `agent-request-${requestId}-${agentRequestSequence}`;
}

/**
 * Validate required agent request envelope fields.
 */
export function validateAgentRequestEnvelope(
  request: AgentRequest,
): { valid: true } | { valid: false; reason: string } {
  if (!request.envelopeId.trim()) {
    return { valid: false, reason: "Agent request reject: envelope id is required." };
  }

  if (!request.agentId.trim()) {
    return { valid: false, reason: "Agent request reject: agent id is required." };
  }

  if (!request.requestId.trim()) {
    return { valid: false, reason: "Agent request reject: request id is required." };
  }

  if (request.context.agentId !== request.agentId) {
    return {
      valid: false,
      reason: "Agent request reject: context agent id does not match envelope agent id.",
    };
  }

  if (request.context.providerKind !== request.providerKind) {
    return {
      valid: false,
      reason: "Agent request reject: context provider kind does not match envelope provider kind.",
    };
  }

  return { valid: true };
}

/**
 * Create an agent request envelope.
 */
export function createAgentRequest(input: {
  agentId: string;
  providerKind: ProviderKind;
  requestId: string;
  question?: string;
  runtimeSessionId?: string;
  tenantId?: string;
  tags?: readonly string[];
  agentDefinition?: AgentDefinition;
  lifecycle?: AgentLifecycleStatus;
  timestamp?: string;
}): AgentRequest {
  const timestamp = input.timestamp ?? new Date().toISOString();
  const context = createAgentContext({
    requestId: input.requestId,
    agentId: input.agentId,
    providerKind: input.providerKind,
    runtimeSessionId: input.runtimeSessionId,
    tenantId: input.tenantId,
    tags: input.tags,
    timestamp,
  });

  return {
    envelopeId: createAgentRequestEnvelopeId(input.requestId),
    agentId: input.agentId.trim(),
    providerKind: input.providerKind,
    requestId: input.requestId.trim(),
    context,
    question: input.question?.trim(),
    requestedAt: timestamp,
    lifecycle: input.lifecycle ?? "created",
    agentDefinition: input.agentDefinition,
  };
}

/**
 * Produce a shallow copy of an agent request envelope.
 */
export function copyAgentRequest(request: AgentRequest): AgentRequest {
  return {
    ...request,
    context: { ...request.context, tags: request.context.tags ? [...request.context.tags] : undefined },
    agentDefinition: request.agentDefinition
      ? {
          ...request.agentDefinition,
          capabilities: [...request.agentDefinition.capabilities],
          supportedEntityTypes: [...request.agentDefinition.supportedEntityTypes],
          supportedIntelligenceTypes: [...request.agentDefinition.supportedIntelligenceTypes],
        }
      : undefined,
  };
}

/**
 * Return a new request envelope with an updated lifecycle status.
 */
export function withAgentRequestLifecycle(
  request: AgentRequest,
  lifecycle: AgentLifecycleStatus,
): AgentRequest {
  return {
    ...copyAgentRequest(request),
    lifecycle,
  };
}
