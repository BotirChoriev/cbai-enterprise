import { validateAgentTask } from "@/lib/intelligence/agents/tasks/task";
import { isTerminalTaskStatus } from "@/lib/intelligence/agents/tasks/task-lifecycle";
import type { AgentTask } from "@/lib/intelligence/agents/tasks/task";
import type { RuntimeScheduler } from "@/lib/intelligence/runtime/scheduler/scheduler";
import {
  isTaskEligibleForSchedule,
  isTaskEligibleForScheduleCancel,
  validateExplicitEvaluatedAt,
  validateScheduledForNotPast,
} from "@/lib/intelligence/agents/scheduler/agent-scheduler-state";
import type { AgentSchedulerBridgePolicy } from "@/lib/intelligence/agents/scheduler/types";
import { DEFAULT_AGENT_SCHEDULER_BRIDGE_POLICY } from "@/lib/intelligence/agents/scheduler/types";

/**
 * Validate agent task scheduling against bridge policy.
 */
export function validateAgentSchedulerSchedule(input: {
  task: AgentTask;
  scheduledFor: string;
  referenceAt: string;
  policy?: AgentSchedulerBridgePolicy;
  scheduledTaskIds?: ReadonlySet<string>;
}): { accepted: true } | { accepted: false; reason: string } {
  const policy = input.policy ?? DEFAULT_AGENT_SCHEDULER_BRIDGE_POLICY;
  const validation = validateAgentTask(input.task);

  if (!validation.valid) {
    return { accepted: false, reason: validation.reason };
  }

  if (policy.rejectTerminalTasks && isTerminalTaskStatus(input.task.status)) {
    return {
      accepted: false,
      reason: `Scheduler bridge reject: terminal task status "${input.task.status}" cannot be scheduled.`,
    };
  }

  if (!isTaskEligibleForSchedule(input.task)) {
    return {
      accepted: false,
      reason: `Scheduler bridge reject: task status "${input.task.status}" is not eligible for scheduling.`,
    };
  }

  if (policy.rejectDuplicateScheduledTask && input.scheduledTaskIds?.has(input.task.id)) {
    return {
      accepted: false,
      reason: `Scheduler bridge reject: duplicate scheduled task id "${input.task.id}".`,
    };
  }

  if (policy.rejectPastScheduledFor) {
    const pastValidation = validateScheduledForNotPast({
      scheduledFor: input.scheduledFor,
      referenceAt: input.referenceAt,
    });

    if (!pastValidation.valid) {
      return { accepted: false, reason: pastValidation.reason };
    }
  }

  return { accepted: true };
}

/**
 * Validate ready-task evaluation input.
 */
export function validateAgentSchedulerEvaluate(input: {
  evaluatedAt?: string;
  policy?: AgentSchedulerBridgePolicy;
}): { accepted: true; evaluatedAt: string } | { accepted: false; reason: string } {
  const policy = input.policy ?? DEFAULT_AGENT_SCHEDULER_BRIDGE_POLICY;

  if (!policy.requireExplicitEvaluatedAt) {
    const fallback = input.evaluatedAt ?? new Date().toISOString();
    return { accepted: true, evaluatedAt: fallback };
  }

  const evaluatedAtValidation = validateExplicitEvaluatedAt(input.evaluatedAt);

  if (!evaluatedAtValidation.valid) {
    return { accepted: false, reason: evaluatedAtValidation.reason };
  }

  return { accepted: true, evaluatedAt: evaluatedAtValidation.evaluatedAt };
}

/**
 * Validate scheduled task cancellation.
 */
export function validateAgentSchedulerCancel(input: {
  task: AgentTask | null;
  scheduleItemId: string | null;
}): { accepted: true } | { accepted: false; reason: string } {
  if (!input.task) {
    return {
      accepted: false,
      reason: "Scheduler bridge reject: task not found for cancellation.",
    };
  }

  if (!input.scheduleItemId) {
    return {
      accepted: false,
      reason: "Scheduler bridge reject: no active schedule item for task.",
    };
  }

  if (!isTaskEligibleForScheduleCancel(input.task)) {
    return {
      accepted: false,
      reason: `Scheduler bridge reject: task status "${input.task.status}" cannot be cancelled.`,
    };
  }

  return { accepted: true };
}

/**
 * Collect actively scheduled task ids from bridge registry.
 */
export function collectScheduledTaskIds(
  scheduler: RuntimeScheduler,
  taskIdByScheduleItemId: ReadonlyMap<string, string>,
): Set<string> {
  const taskIds = new Set<string>();

  for (const item of scheduler.list()) {
    if (item.status !== "scheduled") {
      continue;
    }

    const taskId = taskIdByScheduleItemId.get(item.id);

    if (taskId) {
      taskIds.add(taskId);
    }
  }

  return taskIds;
}
