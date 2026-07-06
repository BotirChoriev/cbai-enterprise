import type { AgentTask } from "@/lib/intelligence/agents/tasks/task";
import {
  canFailOrCancelTask,
  isTerminalTaskStatus,
} from "@/lib/intelligence/agents/tasks/task-lifecycle";
import { mapTaskPriorityToQueuePriority } from "@/lib/intelligence/agents/queue/agent-queue-state";
import type { ScheduleItem, ScheduleItemStatus } from "@/lib/intelligence/runtime/scheduler/types";
import type { AgentSchedulerDiagnostics } from "@/lib/intelligence/agents/scheduler/types";

/**
 * Build scheduler bridge diagnostics envelope.
 */
export function buildAgentSchedulerDiagnostics(input: {
  task: AgentTask;
  scheduleItem: ScheduleItem | null;
  queued?: boolean;
  warnings?: readonly string[];
}): AgentSchedulerDiagnostics {
  return {
    scheduleItemId: input.scheduleItem?.id ?? null,
    taskId: input.task.id,
    taskStatus: input.task.status,
    scheduleStatus: input.scheduleItem?.status ?? null,
    queued: input.queued ?? false,
    warnings: input.warnings ? [...input.warnings] : [],
  };
}

/**
 * Copy diagnostics for external consumers.
 */
export function copyAgentSchedulerDiagnostics(
  diagnostics: AgentSchedulerDiagnostics,
): AgentSchedulerDiagnostics {
  return {
    ...diagnostics,
    warnings: [...diagnostics.warnings],
  };
}

/**
 * Returns true when a task may be scheduled under bridge rules.
 */
export function isTaskEligibleForSchedule(task: AgentTask): boolean {
  return !isTerminalTaskStatus(task.status);
}

/**
 * Returns true when a task may be cancelled from scheduler bridge.
 */
export function isTaskEligibleForScheduleCancel(task: AgentTask): boolean {
  return canFailOrCancelTask(task.status);
}

/**
 * Resolve schedule priority from agent task priority tier.
 */
export function mapTaskPriorityToSchedulePriority(task: AgentTask): number {
  return mapTaskPriorityToQueuePriority(task.priority);
}

/**
 * Returns true when schedule item is actively scheduled.
 */
export function isActiveScheduleStatus(status: ScheduleItemStatus): boolean {
  return status === "scheduled";
}

/**
 * Validate evaluatedAt is explicit and parseable.
 */
export function validateExplicitEvaluatedAt(
  evaluatedAt: string | undefined,
): { valid: true; evaluatedAt: string } | { valid: false; reason: string } {
  if (!evaluatedAt || !evaluatedAt.trim()) {
    return {
      valid: false,
      reason: "Scheduler bridge reject: evaluatedAt is required for ready evaluation.",
    };
  }

  const parsed = Date.parse(evaluatedAt);

  if (!Number.isFinite(parsed)) {
    return {
      valid: false,
      reason: "Scheduler bridge reject: evaluatedAt must be a valid ISO-8601 timestamp.",
    };
  }

  return { valid: true, evaluatedAt: evaluatedAt.trim() };
}

/**
 * Validate scheduledFor is not in the past relative to reference time.
 */
export function validateScheduledForNotPast(input: {
  scheduledFor: string;
  referenceAt: string;
}): { valid: true } | { valid: false; reason: string } {
  if (input.scheduledFor.localeCompare(input.referenceAt) < 0) {
    return {
      valid: false,
      reason: "Scheduler bridge reject: scheduledFor is in the past.",
    };
  }

  return { valid: true };
}
