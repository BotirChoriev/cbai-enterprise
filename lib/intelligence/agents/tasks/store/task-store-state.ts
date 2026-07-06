import type { AgentTask } from "@/lib/intelligence/agents/tasks/task";
import { copyAgentTask, sortAgentTasks } from "@/lib/intelligence/agents/tasks/task";
import {
  isActiveTaskStatus,
  type TaskStatus,
} from "@/lib/intelligence/agents/tasks/task-lifecycle";
import {
  ALL_TASK_PRIORITIES,
  type TaskPriority,
} from "@/lib/intelligence/agents/tasks/task-priority";
import type {
  AgentTaskStoreSnapshot,
  TaskStorePriorityCounts,
  TaskStoreStatusCounts,
} from "@/lib/intelligence/agents/tasks/store/types";
import { AGENT_TASK_STORE_VERSION } from "@/lib/intelligence/agents/tasks/store/types";

/** All task lifecycle statuses in deterministic order. */
export const ALL_TASK_STATUSES: readonly TaskStatus[] = [
  "created",
  "queued",
  "ready",
  "running",
  "completed",
  "failed",
  "cancelled",
  "timeout",
];

/**
 * Count tasks matching a lifecycle status.
 */
export function countTasksByStatus(
  tasks: readonly AgentTask[],
  status: TaskStatus,
): number {
  return tasks.filter((task) => task.status === status).length;
}

/**
 * Count active non-terminal tasks.
 */
export function countActiveTasks(tasks: readonly AgentTask[]): number {
  return tasks.filter((task) => isActiveTaskStatus(task.status)).length;
}

/**
 * Build zero-initialized priority counts.
 */
export function createEmptyPriorityCounts(): TaskStorePriorityCounts {
  return {
    critical: 0,
    high: 0,
    normal: 0,
    low: 0,
    background: 0,
  };
}

/**
 * Build zero-initialized status counts.
 */
export function createEmptyStatusCounts(): TaskStoreStatusCounts {
  return {
    created: 0,
    queued: 0,
    ready: 0,
    running: 0,
    completed: 0,
    failed: 0,
    cancelled: 0,
    timeout: 0,
  };
}

/**
 * Count tasks grouped by priority tier.
 */
export function countTasksByPriority(tasks: readonly AgentTask[]): TaskStorePriorityCounts {
  const counts = createEmptyPriorityCounts();

  for (const task of tasks) {
    counts[task.priority] += 1;
  }

  return counts;
}

/**
 * Count tasks grouped by lifecycle status.
 */
export function countTasksByAllStatuses(tasks: readonly AgentTask[]): TaskStoreStatusCounts {
  const counts = createEmptyStatusCounts();

  for (const task of tasks) {
    counts[task.status] += 1;
  }

  return counts;
}

/**
 * Find the task with the latest updatedAt timestamp.
 */
export function findLatestTask(tasks: readonly AgentTask[]): AgentTask | null {
  if (tasks.length === 0) {
    return null;
  }

  return [...tasks].sort((a, b) => {
    const timeCompare = b.updatedAt.localeCompare(a.updatedAt);

    if (timeCompare !== 0) {
      return timeCompare;
    }

    return b.id.localeCompare(a.id);
  })[0];
}

/**
 * Build an immutable agent task store snapshot.
 */
export function buildAgentTaskStoreSnapshot(
  tasks: readonly AgentTask[],
): AgentTaskStoreSnapshot {
  const latest = findLatestTask(tasks);

  return {
    total: tasks.length,
    active: countActiveTasks(tasks),
    completed: countTasksByStatus(tasks, "completed"),
    failed: countTasksByStatus(tasks, "failed"),
    cancelled: countTasksByStatus(tasks, "cancelled"),
    timeout: countTasksByStatus(tasks, "timeout"),
    byPriority: countTasksByPriority(tasks),
    byStatus: countTasksByAllStatuses(tasks),
    latestTaskId: latest?.id ?? null,
    latestUpdatedAt: latest?.updatedAt ?? null,
    storeVersion: AGENT_TASK_STORE_VERSION,
  };
}

/**
 * Sort tasks deterministically by priority, createdAt, then id.
 */
export function sortStoredTasks(tasks: readonly AgentTask[]): AgentTask[] {
  return sortAgentTasks(tasks);
}

/**
 * Filter tasks by priority tier.
 */
export function filterTasksByPriority(
  tasks: readonly AgentTask[],
  priority: TaskPriority,
): AgentTask[] {
  return sortStoredTasks(tasks.filter((task) => task.priority === priority));
}

/**
 * Filter tasks by lifecycle status.
 */
export function filterTasksByStatus(
  tasks: readonly AgentTask[],
  status: TaskStatus,
): AgentTask[] {
  return sortStoredTasks(tasks.filter((task) => task.status === status));
}

/**
 * Produce a shallow copy of an agent task for external reads.
 */
export function copyStoredTask(task: AgentTask): AgentTask {
  return copyAgentTask(task);
}

/**
 * All priority tiers for deterministic iteration.
 */
export { ALL_TASK_PRIORITIES };
