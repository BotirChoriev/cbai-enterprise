import type { RuntimeQueue } from "@/lib/intelligence/runtime/queue/queue";
import { defaultRuntimeQueue } from "@/lib/intelligence/runtime/queue/queue";
import type { AgentTaskStore } from "@/lib/intelligence/agents/tasks/store/task-store";
import { defaultAgentTaskStore } from "@/lib/intelligence/agents/tasks/store/task-store";
import { queryByRequestId } from "@/lib/intelligence/agents/tasks/store/task-store-query";
import type { AgentTask } from "@/lib/intelligence/agents/tasks/task";
import { withAgentTaskStatus } from "@/lib/intelligence/agents/tasks/task";
import { ensureTaskInStore } from "@/lib/intelligence/agents/integration/agent-dispatch-integration";
import {
  buildAgentQueueDiagnostics,
  copyAgentQueueDiagnostics,
  mapTaskPriorityToQueuePriority,
  resolveQueuedTaskStatus,
} from "@/lib/intelligence/agents/queue/agent-queue-state";
import {
  validateAgentQueueDequeue,
  validateAgentQueueEnqueue,
} from "@/lib/intelligence/agents/queue/agent-queue-policy";
import type {
  AgentQueueDequeueResult,
  AgentQueueDiagnostics,
  AgentQueueEnqueueResult,
  AgentQueuePolicy,
} from "@/lib/intelligence/agents/queue/types";
import { DEFAULT_AGENT_QUEUE_POLICY } from "@/lib/intelligence/agents/queue/types";

/** Stable identifier for the default agent queue integration. */
export const DEFAULT_AGENT_QUEUE_INTEGRATION_ID = "default-agent-queue-integration";

/**
 * Contract for agent queue integration (BUILD-056).
 *
 * Connects Agent Task Store with Runtime Queue for execution preparation.
 * Does not auto-dequeue, dispatch, or execute agents.
 */
export interface AgentQueueIntegration {
  /** Enqueue an agent task into the runtime queue and task store. */
  enqueueTask(task: AgentTask, evaluatedAt?: string): AgentQueueEnqueueResult;

  /** Dequeue the next task for dispatch/execution preparation — no agent execution. */
  dequeueTask(): AgentQueueDequeueResult;
}

/**
 * Default agent queue integration (BUILD-056).
 */
export class DefaultAgentQueueIntegration implements AgentQueueIntegration {
  private readonly store: AgentTaskStore;
  private readonly queue: RuntimeQueue;
  private readonly policy: AgentQueuePolicy;
  private readonly taskIdByQueueItemId = new Map<string, string>();

  constructor(
    store: AgentTaskStore = defaultAgentTaskStore,
    queue: RuntimeQueue = defaultRuntimeQueue,
    policy: AgentQueuePolicy = DEFAULT_AGENT_QUEUE_POLICY,
  ) {
    this.store = store;
    this.queue = queue;
    this.policy = { ...policy };
  }

  enqueueTask(task: AgentTask, evaluatedAt?: string): AgentQueueEnqueueResult {
    const timestamp = evaluatedAt ?? new Date().toISOString();
    const validation = validateAgentQueueEnqueue({
      task,
      queue: this.queue,
      policy: this.policy,
      taskIdByQueueItemId: this.taskIdByQueueItemId,
    });

    if (!validation.accepted) {
      return {
        accepted: false,
        reason: validation.reason,
        diagnostics: buildAgentQueueDiagnostics({
          task,
          queueItem: null,
        }),
      };
    }

    const { task: storedTask } = ensureTaskInStore(task, this.store);
    const nextStatus = resolveQueuedTaskStatus(storedTask.status);
    let updatedTask = storedTask;

    if (nextStatus !== storedTask.status) {
      updatedTask = withAgentTaskStatus(storedTask, nextStatus, timestamp);
      const updateResult = this.store.update(updatedTask.id, updatedTask, timestamp);

      if (!updateResult.updated || !updateResult.task) {
        return {
          accepted: false,
          reason: updateResult.reason ?? "Queue integration reject: task store update failed.",
        };
      }

      updatedTask = updateResult.task;
    }

    const enqueueResult = this.queue.enqueue({
      requestId: updatedTask.requestId,
      priority: mapTaskPriorityToQueuePriority(updatedTask.priority),
      reason: `Agent task "${updatedTask.id}" queued for dispatch preparation.`,
    });

    if (!enqueueResult.accepted || !enqueueResult.item) {
      return {
        accepted: false,
        reason: enqueueResult.reason ?? "Queue integration reject: runtime queue enqueue failed.",
        task: updatedTask,
      };
    }

    this.taskIdByQueueItemId.set(enqueueResult.item.id, updatedTask.id);

    const diagnostics = copyAgentQueueDiagnostics(
      buildAgentQueueDiagnostics({
        task: updatedTask,
        queueItem: enqueueResult.item,
      }),
    );

    return {
      accepted: true,
      task: updatedTask,
      queueItem: enqueueResult.item,
      diagnostics,
    };
  }

  dequeueTask(): AgentQueueDequeueResult {
    const validation = validateAgentQueueDequeue(this.queue);

    if (!validation.ready) {
      return { dequeued: false, reason: validation.reason };
    }

    const queueItem = this.queue.dequeue();

    if (!queueItem) {
      return { dequeued: false, reason: "Queue integration reject: dequeue returned no item." };
    }

    const mappedTaskId = this.taskIdByQueueItemId.get(queueItem.id);
    let task: AgentTask | null = mappedTaskId ? this.store.get(mappedTaskId) : null;

    if (!task) {
      const candidates = queryByRequestId(this.store, queueItem.requestId);
      task = candidates.find((candidate) => candidate.id === mappedTaskId) ?? candidates[0] ?? null;
    }

    if (!task) {
      return {
        dequeued: false,
        queueItem,
        reason: `Queue integration reject: no agent task found for request id "${queueItem.requestId}".`,
      };
    }

    const diagnostics = copyAgentQueueDiagnostics(
      buildAgentQueueDiagnostics({
        task,
        queueItem,
      }),
    );

    return {
      dequeued: true,
      task,
      queueItem,
      diagnostics,
    };
  }
}

/** Shared default agent queue integration singleton. */
export const defaultAgentQueueIntegration = new DefaultAgentQueueIntegration();

/**
 * Convenience helper — enqueue a task using the default integration singleton.
 */
export function enqueueAgentTask(
  task: AgentTask,
  integration: AgentQueueIntegration = defaultAgentQueueIntegration,
  evaluatedAt?: string,
): AgentQueueEnqueueResult {
  return integration.enqueueTask(task, evaluatedAt);
}

/**
 * Convenience helper — dequeue a task using the default integration singleton.
 */
export function dequeueAgentTask(
  integration: AgentQueueIntegration = defaultAgentQueueIntegration,
): AgentQueueDequeueResult {
  return integration.dequeueTask();
}

export type { AgentQueueDiagnostics, AgentQueueEnqueueResult, AgentQueueDequeueResult };
