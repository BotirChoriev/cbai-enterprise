import type { ProviderKind } from "@/lib/intelligence/agents/runtime/provider-kinds";

/**
 * Runtime context envelope for agent contract operations (BUILD-047).
 *
 * Links agent invocation metadata to runtime and registry identifiers.
 * Does not carry execution payloads or model outputs.
 */
export interface AgentContext {
  /** Unique context identifier. */
  contextId: string;
  /** Intelligence request id driving the agent operation. */
  requestId: string;
  /** Agent id from the Agent Registry. */
  agentId: string;
  /** Declared provider kind for this context. */
  providerKind: ProviderKind;
  /** Optional runtime session id — not wired in BUILD-047. */
  runtimeSessionId?: string;
  /** Optional tenant scope. */
  tenantId?: string;
  /** ISO-8601 timestamp when context was created. */
  createdAt: string;
  /** Optional factual metadata tags — no business intelligence. */
  tags?: readonly string[];
}

/** Agent context sequence for deterministic id generation within a process. */
let agentContextSequence = 0;

/**
 * Reset agent context sequence — useful for deterministic tests.
 */
export function resetAgentContextSequence(): void {
  agentContextSequence = 0;
}

/**
 * Generate a unique agent context identifier.
 */
export function createAgentContextId(requestId: string): string {
  agentContextSequence += 1;
  return `agent-context-${requestId}-${agentContextSequence}`;
}

/**
 * Create an agent context envelope.
 */
export function createAgentContext(input: {
  requestId: string;
  agentId: string;
  providerKind: ProviderKind;
  runtimeSessionId?: string;
  tenantId?: string;
  tags?: readonly string[];
  timestamp?: string;
}): AgentContext {
  const timestamp = input.timestamp ?? new Date().toISOString();

  return {
    contextId: createAgentContextId(input.requestId),
    requestId: input.requestId.trim(),
    agentId: input.agentId.trim(),
    providerKind: input.providerKind,
    runtimeSessionId: input.runtimeSessionId,
    tenantId: input.tenantId,
    createdAt: timestamp,
    tags: input.tags ? [...input.tags] : undefined,
  };
}

/**
 * Produce a shallow copy of an agent context.
 */
export function copyAgentContext(context: AgentContext): AgentContext {
  return {
    ...context,
    tags: context.tags ? [...context.tags] : undefined,
  };
}
