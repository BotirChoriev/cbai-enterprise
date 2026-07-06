import type { AgentLifecycleStatus } from "@/lib/intelligence/agents/runtime/agent-lifecycle";
import type { ProviderKind } from "@/lib/intelligence/agents/runtime/provider-kinds";
import { AGENT_RUNTIME_CONTRACT_VERSION } from "@/lib/intelligence/agents/runtime/types";

/** Agent response envelope status (BUILD-047). */
export type AgentResponseStatus =
  | "prepared"
  | "validated"
  | "ready"
  | "described"
  | "unsupported"
  | "failed";

/**
 * Agent response envelope for contract operations (BUILD-047).
 *
 * Metadata-only output — no fabricated agent intelligence or model content.
 */
export interface AgentResponse {
  /** Unique response envelope identifier. */
  envelopeId: string;
  /** Source agent request envelope id. */
  requestEnvelopeId: string;
  /** Agent id that produced this response. */
  agentId: string;
  /** Provider kind for this response. */
  providerKind: ProviderKind;
  /** Response status classification. */
  status: AgentResponseStatus;
  /** Resulting agent runtime lifecycle status. */
  lifecycle: AgentLifecycleStatus;
  /** Deterministic factual reason — no business conclusions. */
  reason: string;
  /** Non-blocking warnings collected during the operation. */
  warnings: readonly string[];
  /** Whether this response blocks further execution. */
  blocking: boolean;
  /** ISO-8601 timestamp when the response was produced. */
  timestamp: string;
  /** Contract semantic version. */
  contractVersion: string;
}

/** Agent response envelope sequence for deterministic id generation. */
let agentResponseSequence = 0;

/**
 * Reset agent response sequence — useful for deterministic tests.
 */
export function resetAgentResponseSequence(): void {
  agentResponseSequence = 0;
}

/**
 * Generate a unique agent response envelope identifier.
 */
export function createAgentResponseEnvelopeId(requestEnvelopeId: string): string {
  agentResponseSequence += 1;
  return `agent-response-${requestEnvelopeId}-${agentResponseSequence}`;
}

/**
 * Create an agent response envelope.
 */
export function createAgentResponse(input: {
  requestEnvelopeId: string;
  agentId: string;
  providerKind: ProviderKind;
  status: AgentResponseStatus;
  lifecycle: AgentLifecycleStatus;
  reason: string;
  warnings?: readonly string[];
  blocking?: boolean;
  timestamp?: string;
}): AgentResponse {
  return {
    envelopeId: createAgentResponseEnvelopeId(input.requestEnvelopeId),
    requestEnvelopeId: input.requestEnvelopeId,
    agentId: input.agentId,
    providerKind: input.providerKind,
    status: input.status,
    lifecycle: input.lifecycle,
    reason: input.reason,
    warnings: input.warnings ? [...input.warnings] : [],
    blocking: input.blocking ?? false,
    timestamp: input.timestamp ?? new Date().toISOString(),
    contractVersion: AGENT_RUNTIME_CONTRACT_VERSION,
  };
}

/**
 * Produce a shallow copy of an agent response envelope.
 */
export function copyAgentResponse(response: AgentResponse): AgentResponse {
  return {
    ...response,
    warnings: [...response.warnings],
  };
}

/**
 * Create a standard unsupported execution response — no fabricated output.
 */
export function createUnsupportedExecutionResponse(input: {
  requestEnvelopeId: string;
  agentId: string;
  providerKind: ProviderKind;
  lifecycle: AgentLifecycleStatus;
  timestamp?: string;
}): AgentResponse {
  return createAgentResponse({
    requestEnvelopeId: input.requestEnvelopeId,
    agentId: input.agentId,
    providerKind: input.providerKind,
    status: "unsupported",
    lifecycle: input.lifecycle,
    reason: "Agent execution is not implemented in BUILD-047 — contract foundation only.",
    blocking: false,
    timestamp: input.timestamp,
  });
}

/**
 * Create a failed agent response envelope.
 */
export function createFailedAgentResponse(input: {
  requestEnvelopeId: string;
  agentId: string;
  providerKind: ProviderKind;
  lifecycle: AgentLifecycleStatus;
  reason: string;
  timestamp?: string;
}): AgentResponse {
  return createAgentResponse({
    requestEnvelopeId: input.requestEnvelopeId,
    agentId: input.agentId,
    providerKind: input.providerKind,
    status: "failed",
    lifecycle: input.lifecycle,
    reason: input.reason,
    blocking: true,
    timestamp: input.timestamp,
  });
}
