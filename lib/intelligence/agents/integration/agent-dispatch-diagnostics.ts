import type { DispatchResult } from "@/lib/intelligence/agents/dispatch/dispatch-result";
import { isDispatchSelected } from "@/lib/intelligence/agents/dispatch/dispatch-result";
import type { AgentTask } from "@/lib/intelligence/agents/tasks/task";
import type { AgentDispatchDiagnostics } from "@/lib/intelligence/agents/integration/types";

/**
 * Returns true when dispatch selected an agent and the task is non-terminal.
 */
export function isAgentDispatchReady(
  task: AgentTask,
  dispatchResult: DispatchResult,
): boolean {
  return (
    isDispatchSelected(dispatchResult) &&
    dispatchResult.selectedAgentId !== null &&
    task.status !== "completed" &&
    task.status !== "failed" &&
    task.status !== "cancelled" &&
    task.status !== "timeout"
  );
}

/**
 * Build dispatch preparation diagnostics from task and dispatch result.
 */
export function buildAgentDispatchDiagnostics(
  task: AgentTask,
  dispatchResult: DispatchResult,
): AgentDispatchDiagnostics {
  const dispatchReady = isAgentDispatchReady(task, dispatchResult);

  return {
    selectedAgentId: dispatchResult.selectedAgentId,
    decision: dispatchResult.decision,
    reason: dispatchResult.reason,
    warnings: [...dispatchResult.warnings],
    taskStatus: task.status,
    dispatchReady,
  };
}

/**
 * Copy diagnostics for external consumers.
 */
export function copyAgentDispatchDiagnostics(
  diagnostics: AgentDispatchDiagnostics,
): AgentDispatchDiagnostics {
  return {
    ...diagnostics,
    warnings: [...diagnostics.warnings],
  };
}
