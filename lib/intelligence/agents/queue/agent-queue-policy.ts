import { validateAgentTask } from "@/lib/intelligence/agents/tasks/task";
import {
  canQueueTask,
  isTerminalTaskStatus,
} from "@/lib/intelligence/agents/tasks/task-lifecycle";
import type { AgentTask } from "@/lib/intelligence/agents/tasks/task";
import type { RuntimeQueue } from "@/lib/intelligence/runtime/queue/queue";
import {
  collectActiveQueuedTaskIds,
  isTaskEligibleForQueue,
  validateQueueTaskTransition,
} from "@/lib/intelligence/agents/queue/agent-queue-state";
import type { AgentQueuePolicy } from "@/lib/intelligence/agents/queue/types";
import { DEFAULT_AGENT_QUEUE_POLICY } from "@/lib/intelligence/agents/queue/types";

/**
 * Validate agent task enqueue against integration policy.
 */
export function validateAgentQueueEnqueue(input: {
  task: AgentTask;
  queue: RuntimeQueue;
  policy?: AgentQueuePolicy;
  taskIdByQueueItemId?: ReadonlyMap<string, string>;
}): { accepted: true } | { accepted: false; reason: string } {
  const policy = input.policy ?? DEFAULT_AGENT_QUEUE_POLICY;
  const validation = validateAgentTask(input.task);

  if (!validation.valid) {
    return { accepted: false, reason: validation.reason };
  }

  if (policy.rejectTerminalTasks && isTerminalTaskStatus(input.task.status)) {
    return {
      accepted: false,
      reason: `Queue integration reject: terminal task status "${input.task.status}" cannot be enqueued.`,
    };
  }

  if (!isTaskEligibleForQueue(input.task, policy)) {
    return {
      accepted: false,
      reason: `Queue integration reject: task status "${input.task.status}" is not eligible for enqueue.`,
    };
  }

  if (policy.rejectDuplicateTaskId && input.taskIdByQueueItemId) {
    const activeTaskIds = collectActiveQueuedTaskIds(
      input.queue,
      input.task.requestId,
      input.taskIdByQueueItemId,
    );

    if (activeTaskIds.has(input.task.id)) {
      return {
        accepted: false,
        reason: `Queue integration reject: duplicate task id "${input.task.id}" already queued.`,
      };
    }

    for (const taskId of input.taskIdByQueueItemId.values()) {
      if (taskId === input.task.id) {
        return {
          accepted: false,
          reason: `Queue integration reject: duplicate task id "${input.task.id}" already queued.`,
        };
      }
    }
  }

  if (!canQueueTask(input.task.status) && input.task.status !== "queued") {
    return {
      accepted: false,
      reason: `Queue integration reject: task status "${input.task.status}" cannot transition to queued.`,
    };
  }

  if (canQueueTask(input.task.status)) {
    const transition = validateQueueTaskTransition(input.task.status, "queued");

    if (!transition.valid) {
      return { accepted: false, reason: transition.reason };
    }
  }

  return { accepted: true };
}

/**
 * Validate dequeue prerequisites — queue must have a resolvable pending item.
 */
export function validateAgentQueueDequeue(
  queue: RuntimeQueue,
): { ready: true } | { ready: false; reason: string } {
  const next = queue.peek();

  if (!next) {
    return { ready: false, reason: "Queue integration reject: queue is empty." };
  }

  if (next.status !== "pending") {
    return {
      ready: false,
      reason: `Queue integration reject: next item is not pending — status "${next.status}".`,
    };
  }

  return { ready: true };
}
