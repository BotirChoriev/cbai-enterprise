import type { AgentTask } from "@/lib/intelligence/agents/tasks/task";
import {
  canQueueTask,
  isTerminalTaskStatus,
  validateTaskLifecycleTransition,
  type TaskStatus,
} from "@/lib/intelligence/agents/tasks/task-lifecycle";
import { TASK_PRIORITY_RANK, type TaskPriority } from "@/lib/intelligence/agents/tasks/task-priority";
import type { RuntimeQueue } from "@/lib/intelligence/runtime/queue/queue";
import type { QueueItem } from "@/lib/intelligence/runtime/queue/types";
import type {
  AgentQueueDiagnostics,
  AgentQueuePolicy,
} from "@/lib/intelligence/agents/queue/types";
import { DEFAULT_AGENT_QUEUE_POLICY } from "@/lib/intelligence/agents/queue/types";

/**
 * Map agent task priority tier to runtime queue numeric priority.
 */
export function mapTaskPriorityToQueuePriority(priority: TaskPriority): number {
  return TASK_PRIORITY_RANK[priority];
}

/**
 * Returns true when a task may be enqueued under agent queue policy.
 */
export function isTaskEligibleForQueue(
  task: AgentTask,
  policy: AgentQueuePolicy = DEFAULT_AGENT_QUEUE_POLICY,
): boolean {
  if (policy.rejectTerminalTasks && isTerminalTaskStatus(task.status)) {
    return false;
  }

  return canQueueTask(task.status) || task.status === "queued";
}

/**
 * Resolve whether a dequeued task is ready for dispatch preparation.
 */
export function resolveReadyForDispatch(
  task: AgentTask,
  queueItem: QueueItem | null,
): boolean {
  if (!queueItem || queueItem.status !== "running") {
    return false;
  }

  if (isTerminalTaskStatus(task.status)) {
    return false;
  }

  return task.status === "queued" || task.status === "ready";
}

/**
 * Build agent queue diagnostics envelope.
 */
export function buildAgentQueueDiagnostics(input: {
  task: AgentTask;
  queueItem: QueueItem | null;
  warnings?: readonly string[];
}): AgentQueueDiagnostics {
  return {
    queueItemId: input.queueItem?.id ?? null,
    taskId: input.task.id,
    taskStatus: input.task.status,
    queueStatus: input.queueItem?.status ?? null,
    warnings: input.warnings ? [...input.warnings] : [],
    readyForDispatch: resolveReadyForDispatch(input.task, input.queueItem),
  };
}

/**
 * Resolve post-enqueue task status — transitions created → queued when valid.
 */
export function resolveQueuedTaskStatus(currentStatus: TaskStatus): TaskStatus {
  if (canQueueTask(currentStatus)) {
    return "queued";
  }

  return currentStatus;
}

/**
 * Validate task lifecycle transition for queue enqueue.
 */
export function validateQueueTaskTransition(
  from: TaskStatus,
  to: TaskStatus,
): { valid: true } | { valid: false; reason: string } {
  if (from === to) {
    return { valid: true };
  }

  return validateTaskLifecycleTransition(from, to);
}

/**
 * Collect task ids currently tracked in active queue items for a request id.
 */
export function collectActiveQueuedTaskIds(
  queue: RuntimeQueue,
  requestId: string,
  taskIdByQueueItemId: ReadonlyMap<string, string>,
): Set<string> {
  const active = new Set<string>();

  for (const item of queue.list()) {
    if (item.requestId !== requestId) {
      continue;
    }

    if (item.status === "pending" || item.status === "running") {
      const taskId = taskIdByQueueItemId.get(item.id);

      if (taskId) {
        active.add(taskId);
      }
    }
  }

  return active;
}

/**
 * Copy diagnostics for external consumers.
 */
export function copyAgentQueueDiagnostics(
  diagnostics: AgentQueueDiagnostics,
): AgentQueueDiagnostics {
  return {
    ...diagnostics,
    warnings: [...diagnostics.warnings],
  };
}
