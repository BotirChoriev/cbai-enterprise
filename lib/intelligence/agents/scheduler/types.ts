import type { ScheduleItem, ScheduleItemStatus } from "@/lib/intelligence/runtime/scheduler/types";
import type { AgentTask } from "@/lib/intelligence/agents/tasks/task";
import type { TaskStatus } from "@/lib/intelligence/agents/tasks/task-lifecycle";

/** Semantic version of the agent scheduler bridge foundation. */
export const AGENT_SCHEDULER_BRIDGE_VERSION = "0.1.0-agent-scheduler-bridge";

/**
 * Agent scheduler bridge policy (BUILD-057).
 */
export interface AgentSchedulerBridgePolicy {
  /** Reject scheduling terminal agent tasks. */
  rejectTerminalTasks: boolean;
  /** Reject duplicate scheduled task ids. */
  rejectDuplicateScheduledTask: boolean;
  /** Reject scheduledFor timestamps in the past. */
  rejectPastScheduledFor: boolean;
  /** Require explicit evaluatedAt for ready evaluation. */
  requireExplicitEvaluatedAt: boolean;
  /** Cancel schedule item after successful queue promotion. */
  cancelScheduleAfterEnqueue: boolean;
}

/** Default agent scheduler bridge policy. */
export const DEFAULT_AGENT_SCHEDULER_BRIDGE_POLICY: AgentSchedulerBridgePolicy = {
  rejectTerminalTasks: true,
  rejectDuplicateScheduledTask: true,
  rejectPastScheduledFor: true,
  requireExplicitEvaluatedAt: true,
  cancelScheduleAfterEnqueue: true,
};

/**
 * Scheduler bridge diagnostics (BUILD-057).
 */
export interface AgentSchedulerDiagnostics {
  /** Runtime schedule item id. */
  scheduleItemId: string | null;
  /** Agent task id. */
  taskId: string;
  /** Current task lifecycle status. */
  taskStatus: TaskStatus;
  /** Current schedule item status. */
  scheduleStatus: ScheduleItemStatus | null;
  /** Whether the task was promoted to the runtime queue. */
  queued: boolean;
  /** Non-blocking warnings. */
  warnings: readonly string[];
}

/**
 * Result of scheduling an agent task.
 */
export interface AgentSchedulerScheduleResult {
  /** Whether the task was scheduled. */
  accepted: boolean;
  /** Task record after store update. */
  task?: AgentTask;
  /** Created schedule item when accepted. */
  scheduleItem?: ScheduleItem;
  /** Integration diagnostics. */
  diagnostics?: AgentSchedulerDiagnostics;
  /** Rejection reason when not accepted. */
  reason?: string;
}

/**
 * Result of evaluating ready scheduled tasks.
 */
export interface AgentSchedulerEvaluateResult {
  /** Evaluation timestamp used. */
  evaluatedAt: string;
  /** Number of tasks successfully queued. */
  enqueuedCount: number;
  /** Per-task evaluation entries. */
  entries: readonly AgentSchedulerEvaluateEntry[];
}

/**
 * Single ready-task evaluation entry.
 */
export interface AgentSchedulerEvaluateEntry {
  /** Agent task id. */
  taskId: string;
  /** Schedule item id. */
  scheduleItemId: string;
  /** Whether queue promotion succeeded. */
  queued: boolean;
  /** Diagnostics for the entry. */
  diagnostics: AgentSchedulerDiagnostics;
  /** Optional rejection reason. */
  reason?: string;
}

/**
 * Result of cancelling a scheduled task.
 */
export interface AgentSchedulerCancelResult {
  /** Whether cancellation succeeded. */
  cancelled: boolean;
  /** Updated task record when available. */
  task?: AgentTask;
  /** Cancelled schedule item when available. */
  scheduleItem?: ScheduleItem;
  /** Integration diagnostics. */
  diagnostics?: AgentSchedulerDiagnostics;
  /** Failure reason when not cancelled. */
  reason?: string;
}
