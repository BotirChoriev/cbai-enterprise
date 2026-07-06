import type { RuntimeScheduler } from "@/lib/intelligence/runtime/scheduler/scheduler";
import { listReadyAt } from "@/lib/intelligence/runtime/scheduler/scheduler";
import { defaultRuntimeScheduler } from "@/lib/intelligence/runtime/scheduler/scheduler";
import type { AgentTaskStore } from "@/lib/intelligence/agents/tasks/store/task-store";
import { defaultAgentTaskStore } from "@/lib/intelligence/agents/tasks/store/task-store";
import type { AgentQueueIntegration } from "@/lib/intelligence/agents/queue/agent-queue-integration";
import { defaultAgentQueueIntegration } from "@/lib/intelligence/agents/queue/agent-queue-integration";
import type { AgentTask } from "@/lib/intelligence/agents/tasks/task";
import { withAgentTaskStatus } from "@/lib/intelligence/agents/tasks/task";
import { ensureTaskInStore } from "@/lib/intelligence/agents/integration/agent-dispatch-integration";
import { queryByRequestId } from "@/lib/intelligence/agents/tasks/store/task-store-query";
import {
  buildAgentSchedulerDiagnostics,
  copyAgentSchedulerDiagnostics,
  mapTaskPriorityToSchedulePriority,
} from "@/lib/intelligence/agents/scheduler/agent-scheduler-state";
import {
  collectScheduledTaskIds,
  validateAgentSchedulerCancel,
  validateAgentSchedulerEvaluate,
  validateAgentSchedulerSchedule,
} from "@/lib/intelligence/agents/scheduler/agent-scheduler-policy";
import type {
  AgentSchedulerBridgePolicy,
  AgentSchedulerCancelResult,
  AgentSchedulerDiagnostics,
  AgentSchedulerEvaluateEntry,
  AgentSchedulerEvaluateResult,
  AgentSchedulerScheduleResult,
} from "@/lib/intelligence/agents/scheduler/types";
import { DEFAULT_AGENT_SCHEDULER_BRIDGE_POLICY } from "@/lib/intelligence/agents/scheduler/types";

/** Stable identifier for the default agent scheduler bridge. */
export const DEFAULT_AGENT_SCHEDULER_BRIDGE_ID = "default-agent-scheduler-bridge";

/**
 * Contract for agent scheduler bridge (BUILD-057).
 *
 * Connects Runtime Scheduler to Agent Queue Integration via caller-driven evaluation.
 * No timers, workers, or auto-execution.
 */
export interface AgentSchedulerBridge {
  /** Schedule an agent task for future queue promotion. */
  scheduleTask(
    task: AgentTask,
    scheduledFor: string,
    input?: { referenceAt?: string },
  ): AgentSchedulerScheduleResult;

  /** Evaluate ready scheduled tasks and enqueue via queue integration. */
  evaluateReadyTasks(evaluatedAt: string): AgentSchedulerEvaluateResult;

  /** Cancel a scheduled task by task id. */
  cancelScheduledTask(taskId: string, reason?: string): AgentSchedulerCancelResult;
}

/**
 * Default agent scheduler bridge (BUILD-057).
 */
export class DefaultAgentSchedulerBridge implements AgentSchedulerBridge {
  private readonly store: AgentTaskStore;
  private readonly scheduler: RuntimeScheduler;
  private readonly queueIntegration: AgentQueueIntegration;
  private readonly policy: AgentSchedulerBridgePolicy;
  private readonly taskIdByScheduleItemId = new Map<string, string>();
  private readonly scheduleItemIdByTaskId = new Map<string, string>();

  constructor(
    store: AgentTaskStore = defaultAgentTaskStore,
    scheduler: RuntimeScheduler = defaultRuntimeScheduler,
    queueIntegration: AgentQueueIntegration = defaultAgentQueueIntegration,
    policy: AgentSchedulerBridgePolicy = DEFAULT_AGENT_SCHEDULER_BRIDGE_POLICY,
  ) {
    this.store = store;
    this.scheduler = scheduler;
    this.queueIntegration = queueIntegration;
    this.policy = { ...policy };
  }

  scheduleTask(
    task: AgentTask,
    scheduledFor: string,
    input?: { referenceAt?: string },
  ): AgentSchedulerScheduleResult {
    const referenceAt = input?.referenceAt ?? new Date().toISOString();
    const scheduledTaskIds = collectScheduledTaskIds(
      this.scheduler,
      this.taskIdByScheduleItemId,
    );

    const validation = validateAgentSchedulerSchedule({
      task,
      scheduledFor,
      referenceAt,
      policy: this.policy,
      scheduledTaskIds,
    });

    if (!validation.accepted) {
      return {
        accepted: false,
        reason: validation.reason,
        diagnostics: buildAgentSchedulerDiagnostics({
          task,
          scheduleItem: null,
        }),
      };
    }

    const { task: storedTask } = ensureTaskInStore(task, this.store);

    const scheduleResult = this.scheduler.schedule({
      requestId: storedTask.requestId,
      scheduledFor: scheduledFor.trim(),
      priority: mapTaskPriorityToSchedulePriority(storedTask),
      reason: `Agent task "${storedTask.id}" scheduled for queue promotion.`,
      referenceAt,
    });

    if (!scheduleResult.accepted || !scheduleResult.item) {
      return {
        accepted: false,
        reason: scheduleResult.reason ?? "Scheduler bridge reject: runtime schedule failed.",
        task: storedTask,
      };
    }

    this.taskIdByScheduleItemId.set(scheduleResult.item.id, storedTask.id);
    this.scheduleItemIdByTaskId.set(storedTask.id, scheduleResult.item.id);

    const diagnostics = copyAgentSchedulerDiagnostics(
      buildAgentSchedulerDiagnostics({
        task: storedTask,
        scheduleItem: scheduleResult.item,
        queued: false,
      }),
    );

    return {
      accepted: true,
      task: storedTask,
      scheduleItem: scheduleResult.item,
      diagnostics,
    };
  }

  evaluateReadyTasks(evaluatedAt: string): AgentSchedulerEvaluateResult {
    const validation = validateAgentSchedulerEvaluate({
      evaluatedAt,
      policy: this.policy,
    });

    if (!validation.accepted) {
      return {
        evaluatedAt: evaluatedAt?.trim() ?? "",
        enqueuedCount: 0,
        entries: [],
      };
    }

    const readyItems = listReadyAt(this.scheduler, validation.evaluatedAt);
    const entries: AgentSchedulerEvaluateEntry[] = [];
    let enqueuedCount = 0;

    for (const scheduleItem of readyItems) {
      const taskId = this.taskIdByScheduleItemId.get(scheduleItem.id);
      let task = taskId ? this.store.get(taskId) : null;

      if (!task) {
        task = queryByRequestId(this.store, scheduleItem.requestId)[0] ?? null;
      }

      if (!task) {
        entries.push({
          taskId: taskId ?? "",
          scheduleItemId: scheduleItem.id,
          queued: false,
          reason: `Scheduler bridge reject: no agent task found for schedule item "${scheduleItem.id}".`,
          diagnostics: buildAgentSchedulerDiagnostics({
            task: {
              id: taskId ?? scheduleItem.requestId,
              agentId: "unknown",
              requestId: scheduleItem.requestId,
              title: "",
              description: "",
              priority: "normal",
              status: "created",
              taskRequest: {
                intent: "general",
                requestedCapabilities: [],
                subjectEntities: [],
                context: {},
              },
              createdAt: validation.evaluatedAt,
              updatedAt: validation.evaluatedAt,
              taskVersion: "unknown",
            },
            scheduleItem,
          }),
        });
        continue;
      }

      const enqueueResult = this.queueIntegration.enqueueTask(task, validation.evaluatedAt);

      if (!enqueueResult.accepted) {
        entries.push({
          taskId: task.id,
          scheduleItemId: scheduleItem.id,
          queued: false,
          diagnostics: buildAgentSchedulerDiagnostics({
            task,
            scheduleItem,
            warnings: enqueueResult.diagnostics?.warnings,
          }),
          reason: enqueueResult.reason,
        });
        continue;
      }

      if (this.policy.cancelScheduleAfterEnqueue) {
        this.scheduler.cancel(
          scheduleItem.id,
          `Promoted agent task "${task.id}" to runtime queue.`,
        );
        this.taskIdByScheduleItemId.delete(scheduleItem.id);
        this.scheduleItemIdByTaskId.delete(task.id);
      }

      enqueuedCount += 1;

      entries.push({
        taskId: task.id,
        scheduleItemId: scheduleItem.id,
        queued: true,
        diagnostics: copyAgentSchedulerDiagnostics(
          buildAgentSchedulerDiagnostics({
            task: enqueueResult.task ?? task,
            scheduleItem: this.scheduler.get(scheduleItem.id) ?? {
              ...scheduleItem,
              status: "cancelled",
            },
            queued: true,
            warnings: enqueueResult.diagnostics?.warnings,
          }),
        ),
      });
    }

    return {
      evaluatedAt: validation.evaluatedAt,
      enqueuedCount,
      entries,
    };
  }

  cancelScheduledTask(taskId: string, reason?: string): AgentSchedulerCancelResult {
    const task = this.store.get(taskId);
    const scheduleItemId = this.scheduleItemIdByTaskId.get(taskId) ?? null;

    const validation = validateAgentSchedulerCancel({
      task,
      scheduleItemId,
    });

    if (!validation.accepted) {
      return {
        cancelled: false,
        reason: validation.reason,
        task: task ?? undefined,
        diagnostics: task
          ? buildAgentSchedulerDiagnostics({ task, scheduleItem: null })
          : undefined,
      };
    }

    const cancelledItem = this.scheduler.cancel(
      scheduleItemId!,
      reason ?? `Agent task "${taskId}" schedule cancelled.`,
    );

    if (!cancelledItem) {
      return {
        cancelled: false,
        reason: `Scheduler bridge reject: schedule item "${scheduleItemId}" not found.`,
        task: task ?? undefined,
      };
    }

    this.taskIdByScheduleItemId.delete(scheduleItemId!);
    this.scheduleItemIdByTaskId.delete(taskId);

    let updatedTask = task!;

    if (updatedTask.status !== "cancelled") {
      updatedTask = withAgentTaskStatus(updatedTask, "cancelled");
      const updateResult = this.store.update(updatedTask.id, updatedTask);

      if (updateResult.updated && updateResult.task) {
        updatedTask = updateResult.task;
      }
    }

    const diagnostics = copyAgentSchedulerDiagnostics(
      buildAgentSchedulerDiagnostics({
        task: updatedTask,
        scheduleItem: cancelledItem,
        queued: false,
      }),
    );

    return {
      cancelled: true,
      task: updatedTask,
      scheduleItem: cancelledItem,
      diagnostics,
    };
  }
}

/** Shared default agent scheduler bridge singleton. */
export const defaultAgentSchedulerBridge = new DefaultAgentSchedulerBridge();

export type { AgentSchedulerDiagnostics, AgentSchedulerScheduleResult };
