import type { AgentQueueIntegration } from "@/lib/intelligence/agents/queue/agent-queue-integration";
import { DefaultAgentQueueIntegration } from "@/lib/intelligence/agents/queue/agent-queue-integration";
import type { AgentSchedulerBridge } from "@/lib/intelligence/agents/scheduler/agent-scheduler-bridge";
import { DefaultAgentSchedulerBridge } from "@/lib/intelligence/agents/scheduler/agent-scheduler-bridge";
import type { AgentTaskStore } from "@/lib/intelligence/agents/tasks/store/task-store";
import { defaultAgentTaskStore } from "@/lib/intelligence/agents/tasks/store/task-store";
import type { RuntimeQueue } from "@/lib/intelligence/runtime/queue/queue";
import { defaultRuntimeQueue } from "@/lib/intelligence/runtime/queue/queue";
import type { RuntimeScheduler } from "@/lib/intelligence/runtime/scheduler/scheduler";
import { defaultRuntimeScheduler } from "@/lib/intelligence/runtime/scheduler/scheduler";
import type { RuntimeWorkerContext } from "@/lib/intelligence/runtime/worker/types";

/**
 * Optional dependency overrides for runtime worker construction.
 */
export interface RuntimeWorkerDependencies {
  taskStore?: AgentTaskStore;
  schedulerBridge?: AgentSchedulerBridge;
  queueIntegration?: AgentQueueIntegration;
  scheduler?: RuntimeScheduler;
  queue?: RuntimeQueue;
}

/**
 * Build resolved runtime worker context from optional dependency overrides.
 */
export function buildRuntimeWorkerContext(
  deps: RuntimeWorkerDependencies = {},
): RuntimeWorkerContext {
  const taskStore = deps.taskStore ?? defaultAgentTaskStore;
  const queue = deps.queue ?? defaultRuntimeQueue;
  const scheduler = deps.scheduler ?? defaultRuntimeScheduler;
  const queueIntegration =
    deps.queueIntegration ?? new DefaultAgentQueueIntegration(taskStore, queue);
  const schedulerBridge =
    deps.schedulerBridge ??
    new DefaultAgentSchedulerBridge(taskStore, scheduler, queueIntegration);

  return {
    taskStore,
    schedulerBridge,
    queueIntegration,
    scheduler,
    queue,
  };
}

/**
 * Copy runtime worker context references for diagnostics.
 */
export function copyRuntimeWorkerContext(context: RuntimeWorkerContext): RuntimeWorkerContext {
  return {
    taskStore: context.taskStore,
    schedulerBridge: context.schedulerBridge,
    queueIntegration: context.queueIntegration,
    scheduler: context.scheduler,
    queue: context.queue,
  };
}
