import type { TaskRequest } from "@/lib/intelligence/agents/tasks/task-request";
import { validateTaskRequest } from "@/lib/intelligence/agents/tasks/task-request";
import {
  isTerminalTaskStatus,
  validateTaskLifecycleTransition,
  type TaskStatus,
} from "@/lib/intelligence/agents/tasks/task-lifecycle";
import {
  compareTaskPriority,
  resolveTaskPriority,
  type TaskPriority,
} from "@/lib/intelligence/agents/tasks/task-priority";
import { AGENT_TASK_MODEL_VERSION } from "@/lib/intelligence/agents/tasks/types";
import type { AgentTaskDispatchMetadata } from "@/lib/intelligence/agents/tasks/types";

/**
 * Agent task — one unit of work assigned to an agent (BUILD-048).
 *
 * Contract and lifecycle metadata only — no execution.
 */
export interface AgentTask {
  /** Unique task identifier. */
  id: string;
  /** Assigned agent id from the Agent Registry. */
  agentId: string;
  /** Optional runtime session id — not wired in BUILD-048. */
  runtimeSessionId?: string;
  /** Source intelligence request id. */
  requestId: string;
  /** Short task title. */
  title: string;
  /** Factual task description — no fabricated intelligence. */
  description: string;
  /** Dispatch priority tier. */
  priority: TaskPriority;
  /** Current task lifecycle status. */
  status: TaskStatus;
  /** Task request envelope describing intent and scope. */
  taskRequest: TaskRequest;
  /** ISO-8601 timestamp when the task was created. */
  createdAt: string;
  /** ISO-8601 timestamp when the task was last updated. */
  updatedAt: string;
  /** ISO-8601 timestamp when execution started — reserved for future runtime. */
  startedAt?: string;
  /** ISO-8601 timestamp when execution finished — reserved for future runtime. */
  finishedAt?: string;
  /** Optional ISO-8601 timeout deadline. */
  timeoutAt?: string;
  /** Task model semantic version. */
  taskVersion: string;
  /** Optional dispatch preparation metadata — attached by integration (BUILD-053). */
  dispatchMetadata?: AgentTaskDispatchMetadata;
}

/** Task id sequence for deterministic generation within a process. */
let agentTaskSequence = 0;

/**
 * Reset agent task sequence — useful for deterministic tests.
 */
export function resetAgentTaskSequence(): void {
  agentTaskSequence = 0;
}

/**
 * Generate a unique agent task identifier.
 */
export function createAgentTaskId(requestId: string): string {
  agentTaskSequence += 1;
  return `agent-task-${requestId}-${agentTaskSequence}`;
}

/**
 * Validate an agent task record.
 */
export function validateAgentTask(
  task: AgentTask,
): { valid: true } | { valid: false; reason: string } {
  if (!task.id.trim()) {
    return { valid: false, reason: "Task reject: id is required." };
  }

  if (!task.agentId.trim()) {
    return { valid: false, reason: "Task reject: agent id is required." };
  }

  if (!task.requestId.trim()) {
    return { valid: false, reason: "Task reject: request id is required." };
  }

  if (!task.title.trim()) {
    return { valid: false, reason: "Task reject: title is required." };
  }

  const requestValidation = validateTaskRequest(task.taskRequest);

  if (!requestValidation.valid) {
    return requestValidation;
  }

  if (task.startedAt && task.finishedAt) {
    const startedMs = Date.parse(task.startedAt);
    const finishedMs = Date.parse(task.finishedAt);

    if (Number.isFinite(startedMs) && Number.isFinite(finishedMs) && finishedMs < startedMs) {
      return {
        valid: false,
        reason: "Task reject: finishedAt cannot be before startedAt.",
      };
    }
  }

  if (task.timeoutAt) {
    const timeoutMs = Date.parse(task.timeoutAt);

    if (!Number.isFinite(timeoutMs)) {
      return {
        valid: false,
        reason: "Task reject: timeoutAt must be a valid ISO-8601 timestamp.",
      };
    }
  }

  if (isTerminalTaskStatus(task.status) && !task.finishedAt) {
    return {
      valid: false,
      reason: `Task reject: terminal status "${task.status}" requires finishedAt.`,
    };
  }

  return { valid: true };
}

/**
 * Create a new agent task.
 */
export function createAgentTask(input: {
  agentId: string;
  requestId: string;
  title: string;
  description?: string;
  priority?: TaskPriority | string;
  taskRequest: TaskRequest;
  runtimeSessionId?: string;
  timeoutAt?: string;
  status?: TaskStatus;
  timestamp?: string;
}): AgentTask {
  const timestamp = input.timestamp ?? new Date().toISOString();
  const requestValidation = validateTaskRequest(input.taskRequest);

  if (!requestValidation.valid) {
    throw new Error(requestValidation.reason);
  }

  return {
    id: createAgentTaskId(input.requestId),
    agentId: input.agentId.trim(),
    runtimeSessionId: input.runtimeSessionId,
    requestId: input.requestId.trim(),
    title: input.title.trim(),
    description: input.description?.trim() ?? "",
    priority: resolveTaskPriority(input.priority),
    status: input.status ?? "created",
    taskRequest: input.taskRequest,
    createdAt: timestamp,
    updatedAt: timestamp,
    timeoutAt: input.timeoutAt,
    taskVersion: AGENT_TASK_MODEL_VERSION,
  };
}

/**
 * Apply a lifecycle status update with deterministic validation.
 */
export function withAgentTaskStatus(
  task: AgentTask,
  status: TaskStatus,
  timestamp: string = new Date().toISOString(),
): AgentTask {
  const transition = validateTaskLifecycleTransition(task.status, status);

  if (!transition.valid) {
    throw new Error(transition.reason);
  }

  const updated: AgentTask = {
    ...copyAgentTask(task),
    status,
    updatedAt: timestamp,
  };

  if (status === "running" && !updated.startedAt) {
    updated.startedAt = timestamp;
  }

  if (isTerminalTaskStatus(status)) {
    updated.finishedAt = timestamp;
  }

  return updated;
}

/**
 * Produce a shallow copy of an agent task.
 */
export function copyAgentTask(task: AgentTask): AgentTask {
  return {
    ...task,
    dispatchMetadata: task.dispatchMetadata
      ? {
          ...task.dispatchMetadata,
          warnings: [...task.dispatchMetadata.warnings],
        }
      : undefined,
    taskRequest: {
      intent: task.taskRequest.intent,
      requestedCapabilities: [...task.taskRequest.requestedCapabilities],
      subjectEntities: task.taskRequest.subjectEntities.map((entity) => ({ ...entity })),
      context: {
        ...task.taskRequest.context,
        tags: task.taskRequest.context.tags ? [...task.taskRequest.context.tags] : undefined,
      },
      constraints: task.taskRequest.constraints
        ? {
            maxDurationMs: task.taskRequest.constraints.maxDurationMs,
            deadlineAt: task.taskRequest.constraints.deadlineAt,
            requiredCapabilities: task.taskRequest.constraints.requiredCapabilities
              ? [...task.taskRequest.constraints.requiredCapabilities]
              : undefined,
            notes: task.taskRequest.constraints.notes
              ? [...task.taskRequest.constraints.notes]
              : undefined,
          }
        : undefined,
    },
  };
}

/**
 * Sort agent tasks deterministically by priority then createdAt then id.
 */
export function sortAgentTasks(tasks: readonly AgentTask[]): AgentTask[] {
  return [...tasks]
    .map(copyAgentTask)
    .sort((a, b) => {
      const priorityCompare = compareTaskPriority(a.priority, b.priority);

      if (priorityCompare !== 0) {
        return priorityCompare;
      }

      const createdCompare = a.createdAt.localeCompare(b.createdAt);

      if (createdCompare !== 0) {
        return createdCompare;
      }

      return a.id.localeCompare(b.id);
    });
}
