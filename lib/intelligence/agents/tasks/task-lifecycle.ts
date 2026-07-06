import type { TaskResultStatus } from "@/lib/intelligence/agents/tasks/types";

/** Agent task lifecycle status (BUILD-048). */
export type TaskStatus =
  | "created"
  | "queued"
  | "ready"
  | "running"
  | "completed"
  | "failed"
  | "cancelled"
  | "timeout";

/** Terminal task lifecycle states. */
const TERMINAL_TASK_STATUS: ReadonlySet<TaskStatus> = new Set([
  "completed",
  "failed",
  "cancelled",
  "timeout",
]);

/** Active non-terminal task states eligible for dispatch tracking. */
const ACTIVE_TASK_STATUS: ReadonlySet<TaskStatus> = new Set([
  "created",
  "queued",
  "ready",
  "running",
]);

/**
 * Returns true when task status represents a terminal lifecycle state.
 */
export function isTerminalTaskStatus(status: TaskStatus): boolean {
  return TERMINAL_TASK_STATUS.has(status);
}

/**
 * Returns true when task status represents an active non-terminal state.
 */
export function isActiveTaskStatus(status: TaskStatus): boolean {
  return ACTIVE_TASK_STATUS.has(status);
}

/**
 * Returns true when a task may transition to queued.
 */
export function canQueueTask(status: TaskStatus): boolean {
  return status === "created";
}

/**
 * Returns true when a task may transition to ready.
 */
export function canMarkTaskReady(status: TaskStatus): boolean {
  return status === "queued";
}

/**
 * Returns true when a task may transition to running.
 */
export function canStartTask(status: TaskStatus): boolean {
  return status === "ready";
}

/**
 * Returns true when a task may transition to completed.
 */
export function canCompleteTask(status: TaskStatus): boolean {
  return status === "running";
}

/**
 * Returns true when a task may transition to failed or cancelled from a non-terminal state.
 */
export function canFailOrCancelTask(status: TaskStatus): boolean {
  return !isTerminalTaskStatus(status);
}

/**
 * Validate a lifecycle transition — deterministic, no side effects.
 */
export function validateTaskLifecycleTransition(
  from: TaskStatus,
  to: TaskStatus,
): { valid: true } | { valid: false; reason: string } {
  if (from === to) {
    return { valid: true };
  }

  if (isTerminalTaskStatus(from)) {
    return {
      valid: false,
      reason: `Task lifecycle reject: cannot transition from terminal status "${from}".`,
    };
  }

  const allowed: Record<TaskStatus, readonly TaskStatus[]> = {
    created: ["queued", "ready", "cancelled", "failed"],
    queued: ["ready", "cancelled", "failed", "timeout"],
    ready: ["running", "cancelled", "failed", "timeout"],
    running: ["completed", "failed", "cancelled", "timeout"],
    completed: [],
    failed: [],
    cancelled: [],
    timeout: [],
  };

  if (!allowed[from].includes(to)) {
    return {
      valid: false,
      reason: `Task lifecycle reject: transition "${from}" → "${to}" is not allowed.`,
    };
  }

  return { valid: true };
}

/**
 * Map terminal task status to task result status.
 */
export function taskResultStatusFromTaskStatus(status: TaskStatus): TaskResultStatus {
  switch (status) {
    case "completed":
      return "completed";
    case "failed":
      return "failed";
    case "cancelled":
      return "cancelled";
    case "timeout":
      return "timeout";
    default:
      return "pending";
  }
}
