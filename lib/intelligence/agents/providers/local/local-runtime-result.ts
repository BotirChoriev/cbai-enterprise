import type { AgentResponse } from "@/lib/intelligence/agents/runtime/agent-response";
import {
  createAgentResponse,
  createFailedAgentResponse,
} from "@/lib/intelligence/agents/runtime/agent-response";
import { PROVIDER_KIND_LOCAL } from "@/lib/intelligence/agents/runtime/provider-kinds";
import type { AgentRequest } from "@/lib/intelligence/agents/runtime/agent-request";
import {
  buildCompletedLocalExecutionResult,
  buildFailedLocalExecutionResult,
} from "@/lib/intelligence/agents/providers/local/local-runtime-state";
import type {
  LocalRuntimeExecutionDiagnostics,
  LocalRuntimeExecutionResult,
} from "@/lib/intelligence/agents/providers/local/types";

/**
 * Map a local execution result to an agent response envelope.
 */
export function createLocalExecutionAgentResponse(input: {
  request: AgentRequest;
  result: LocalRuntimeExecutionResult;
  timestamp?: string;
}): AgentResponse {
  if (input.result.status === "failed") {
    return createFailedAgentResponse({
      requestEnvelopeId: input.request.envelopeId,
      agentId: input.request.agentId,
      providerKind: PROVIDER_KIND_LOCAL,
      lifecycle: "failed",
      reason: input.result.executionSummary,
      timestamp: input.timestamp,
    });
  }

  return createAgentResponse({
    requestEnvelopeId: input.request.envelopeId,
    agentId: input.request.agentId,
    providerKind: PROVIDER_KIND_LOCAL,
    status: "ready",
    lifecycle: "completed",
    reason: input.result.executionSummary,
    warnings: [...input.result.warnings],
    timestamp: input.timestamp,
  });
}

/**
 * Build local runtime execution diagnostics from a result.
 */
export function buildLocalRuntimeExecutionDiagnostics(
  result: LocalRuntimeExecutionResult,
): LocalRuntimeExecutionDiagnostics {
  return {
    providerKind: result.providerKind,
    executionType: result.executionType,
    executionDurationMs: result.executionDurationMs,
  };
}

/**
 * Create a completed local runtime execution result with agent response.
 */
export function createCompletedLocalRuntimeExecution(input: {
  request: AgentRequest;
  startedAtMs: number;
  timestamp?: string;
}): { result: LocalRuntimeExecutionResult; response: AgentResponse } {
  const executionDurationMs = Math.max(0, Date.now() - input.startedAtMs);
  const result = buildCompletedLocalExecutionResult({ executionDurationMs });
  const response = createLocalExecutionAgentResponse({
    request: input.request,
    result,
    timestamp: input.timestamp,
  });

  return { result, response };
}

/**
 * Create a failed local runtime execution result with agent response.
 */
export function createFailedLocalRuntimeExecution(input: {
  request: AgentRequest;
  reason: string;
  startedAtMs: number;
  timestamp?: string;
}): { result: LocalRuntimeExecutionResult; response: AgentResponse } {
  const executionDurationMs = Math.max(0, Date.now() - input.startedAtMs);
  const result = buildFailedLocalExecutionResult({
    reason: input.reason,
    executionDurationMs,
  });
  const response = createLocalExecutionAgentResponse({
    request: input.request,
    result,
    timestamp: input.timestamp,
  });

  return { result, response };
}
