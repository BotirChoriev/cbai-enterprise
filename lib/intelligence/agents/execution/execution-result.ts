import type { AgentExecutionContext } from "@/lib/intelligence/agents/execution/execution-context";
import { resolveExecutionReady } from "@/lib/intelligence/agents/execution/execution-state";
import type { AgentExecutionResult } from "@/lib/intelligence/agents/execution/types";

/**
 * Build an agent execution foundation result from coordination context.
 */
export function createAgentExecutionResult(
  context: AgentExecutionContext,
): AgentExecutionResult {
  const executionReady = resolveExecutionReady({
    prepared: context.prepared,
    validated: context.validated,
    healthy: context.healthy,
    state: context.state,
  });

  return {
    taskId: context.task.id,
    agentId: context.task.agentId,
    providerKind: context.providerKind,
    prepared: context.prepared,
    validated: context.validated,
    healthy: context.healthy,
    warnings: [...context.warnings],
    errors: [...context.errors],
    runtimeContractVersion: context.contract.contractVersion,
    executionReady,
    state: executionReady ? "ready" : context.state,
    description: context.description,
  };
}

/**
 * Produce a shallow copy of an execution result.
 */
export function copyAgentExecutionResult(result: AgentExecutionResult): AgentExecutionResult {
  return {
    ...result,
    warnings: [...result.warnings],
    errors: [...result.errors],
  };
}

/**
 * Build a concise execution summary string for audit.
 */
export function formatAgentExecutionSummary(result: AgentExecutionResult): string {
  const lines = [
    `Task "${result.taskId}" execution foundation summary.`,
    `Agent: ${result.agentId}. Provider: ${result.providerKind}.`,
    `State: ${result.state}. Execution ready: ${result.executionReady ? "yes" : "no"}.`,
    `Prepared: ${result.prepared ? "yes" : "no"}. Validated: ${result.validated ? "yes" : "no"}. Healthy: ${result.healthy ? "yes" : "no"}.`,
    `Contract version: ${result.runtimeContractVersion}.`,
  ];

  if (result.description) {
    lines.push(`Description: ${result.description}.`);
  }

  if (result.warnings.length > 0) {
    lines.push(`Warnings: ${result.warnings.join("; ")}.`);
  }

  if (result.errors.length > 0) {
    lines.push(`Errors: ${result.errors.join("; ")}.`);
  }

  return lines.join(" ");
}
