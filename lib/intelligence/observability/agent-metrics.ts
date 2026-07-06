import type { AgentRuntimeContract } from "@/lib/intelligence/agents/runtime/agent-contract";
import { localRuntimeAdapter } from "@/lib/intelligence/agents/providers/local";
import type { AgentTaskStore } from "@/lib/intelligence/agents/tasks/store/task-store";
import { defaultAgentTaskStore } from "@/lib/intelligence/agents/tasks/store/task-store";
import { isActiveTaskStatus } from "@/lib/intelligence/agents/tasks/task-lifecycle";
import type {
  AgentMetrics,
  DispatchReadinessSummary,
  ExecutionReadinessSummary,
} from "@/lib/intelligence/observability/types";

/**
 * Build dispatch readiness summary from task store contents.
 */
export function buildDispatchReadinessSummary(
  store: AgentTaskStore,
): DispatchReadinessSummary {
  const tasks = store.list();
  let dispatchReadyCount = 0;

  for (const task of tasks) {
    if (task.dispatchMetadata?.dispatchReady) {
      dispatchReadyCount += 1;
    }
  }

  const activeTasks = tasks.filter((task) => isActiveTaskStatus(task.status)).length;

  return {
    totalTasks: tasks.length,
    dispatchReadyCount,
    pendingDispatchCount: Math.max(0, activeTasks - dispatchReadyCount),
  };
}

/**
 * Build execution readiness summary from task store contents.
 */
export function buildExecutionReadinessSummary(
  store: AgentTaskStore,
): ExecutionReadinessSummary {
  const tasks = store.list();
  let queuedTaskCount = 0;
  let executionCandidateCount = 0;

  for (const task of tasks) {
    if (task.status === "queued") {
      queuedTaskCount += 1;

      if (task.dispatchMetadata?.dispatchReady) {
        executionCandidateCount += 1;
      }
    }
  }

  return {
    queuedTaskCount,
    executionCandidateCount,
  };
}

/**
 * Returns true when the local runtime adapter reports healthy availability.
 */
export function isLocalAdapterAvailable(
  adapter: AgentRuntimeContract = localRuntimeAdapter,
): boolean {
  return adapter.health().healthy;
}

/**
 * Collect agent layer metrics snapshot.
 */
export function collectAgentMetrics(input: {
  taskStore?: AgentTaskStore;
  localAdapter?: AgentRuntimeContract;
}): AgentMetrics {
  const taskStore = (input.taskStore ?? defaultAgentTaskStore).snapshot();
  const store = input.taskStore ?? defaultAgentTaskStore;

  return {
    taskStore,
    dispatchReadiness: buildDispatchReadinessSummary(store),
    executionReadiness: buildExecutionReadinessSummary(store),
    localAdapterAvailable: isLocalAdapterAvailable(input.localAdapter),
  };
}

export type { DispatchReadinessSummary, ExecutionReadinessSummary };
