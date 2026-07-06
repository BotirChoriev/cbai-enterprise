import type { DispatchResult } from "@/lib/intelligence/agents/dispatch/dispatch-result";
import { isDispatchSelected } from "@/lib/intelligence/agents/dispatch/dispatch-result";
import type { AgentTask } from "@/lib/intelligence/agents/tasks/task";
import { copyAgentTask } from "@/lib/intelligence/agents/tasks/task";
import {
  canQueueTask,
  validateTaskLifecycleTransition,
  type TaskStatus,
} from "@/lib/intelligence/agents/tasks/task-lifecycle";
import type { AgentTaskDispatchMetadata } from "@/lib/intelligence/agents/tasks/types";
import {
  buildAgentDispatchDiagnostics,
  isAgentDispatchReady,
} from "@/lib/intelligence/agents/integration/agent-dispatch-diagnostics";
import type { AgentDispatchDiagnostics } from "@/lib/intelligence/agents/integration/types";

/**
 * Resolve post-dispatch task lifecycle status when dispatch succeeds.
 */
export function resolvePostDispatchTaskStatus(
  currentStatus: TaskStatus,
  dispatchResult: DispatchResult,
): TaskStatus {
  if (!isDispatchSelected(dispatchResult)) {
    return currentStatus;
  }

  if (canQueueTask(currentStatus)) {
    return "queued";
  }

  return currentStatus;
}

/**
 * Build dispatch metadata to attach to a task record.
 */
export function buildAgentTaskDispatchMetadata(input: {
  dispatchResult: DispatchResult;
  dispatchReady: boolean;
}): AgentTaskDispatchMetadata {
  return {
    selectedAgentId: input.dispatchResult.selectedAgentId,
    decision: input.dispatchResult.decision,
    reason: input.dispatchResult.reason,
    warnings: [...input.dispatchResult.warnings],
    evaluatedAt: input.dispatchResult.timestamp,
    dispatchReady: input.dispatchReady,
    dispatchVersion: input.dispatchResult.dispatchVersion,
  };
}

/**
 * Apply dispatch outcome to a task record without executing agents.
 */
export function applyDispatchToTask(
  task: AgentTask,
  dispatchResult: DispatchResult,
  timestamp: string = new Date().toISOString(),
): { task: AgentTask; diagnostics: AgentDispatchDiagnostics } {
  const dispatchReady = isAgentDispatchReady(task, dispatchResult);

  const nextStatus = resolvePostDispatchTaskStatus(task.status, dispatchResult);

  if (nextStatus !== task.status) {
    const transition = validateTaskLifecycleTransition(task.status, nextStatus);

    if (!transition.valid) {
      throw new Error(transition.reason);
    }
  }

  const updated: AgentTask = {
    ...copyAgentTask(task),
    updatedAt: timestamp,
    status: nextStatus,
    dispatchMetadata: buildAgentTaskDispatchMetadata({ dispatchResult, dispatchReady }),
  };

  if (isDispatchSelected(dispatchResult) && dispatchResult.selectedAgentId) {
    updated.agentId = dispatchResult.selectedAgentId;
  }

  updated.dispatchMetadata = buildAgentTaskDispatchMetadata({
    dispatchResult,
    dispatchReady: isAgentDispatchReady(updated, dispatchResult),
  });

  return {
    task: updated,
    diagnostics: buildAgentDispatchDiagnostics(updated, dispatchResult),
  };
}
