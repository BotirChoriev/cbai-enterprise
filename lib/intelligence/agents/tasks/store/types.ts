import type { AgentTask } from "@/lib/intelligence/agents/tasks/task";
import type { TaskPriority } from "@/lib/intelligence/agents/tasks/task-priority";
import type { TaskStatus } from "@/lib/intelligence/agents/tasks/task-lifecycle";

/** Semantic version of the agent task store foundation. */
export const AGENT_TASK_STORE_VERSION = "0.1.0-agent-task-store";

/** Counts grouped by task priority tier. */
export type TaskStorePriorityCounts = Record<TaskPriority, number>;

/** Counts grouped by task lifecycle status. */
export type TaskStoreStatusCounts = Record<TaskStatus, number>;

/**
 * Result of an agent task add operation.
 */
export interface TaskStoreAddResult {
  /** Whether the task was accepted into the store. */
  accepted: boolean;
  /** Stored task copy when accepted. */
  task?: AgentTask;
  /** Rejection reason when not accepted. */
  reason?: string;
}

/**
 * Result of an agent task update operation.
 */
export interface TaskStoreUpdateResult {
  /** Whether the task was updated. */
  updated: boolean;
  /** Updated task copy when successful. */
  task?: AgentTask;
  /** Failure reason when not updated. */
  reason?: string;
}

/**
 * Immutable agent task store snapshot (BUILD-052).
 */
export interface AgentTaskStoreSnapshot {
  /** Total tasks tracked by the store. */
  total: number;
  /** Tasks in active non-terminal lifecycle states. */
  active: number;
  /** Tasks with completed status. */
  completed: number;
  /** Tasks with failed status. */
  failed: number;
  /** Tasks with cancelled status. */
  cancelled: number;
  /** Tasks with timeout status. */
  timeout: number;
  /** Task counts grouped by priority tier. */
  byPriority: TaskStorePriorityCounts;
  /** Task counts grouped by lifecycle status. */
  byStatus: TaskStoreStatusCounts;
  /** Task id with the most recent updatedAt, if any. */
  latestTaskId: string | null;
  /** Most recent updatedAt across all tasks, if any. */
  latestUpdatedAt: string | null;
  /** Store semantic version. */
  storeVersion: string;
}
