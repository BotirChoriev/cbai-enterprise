import { defaultAgentTaskStore } from "@/lib/intelligence/agents/tasks/store/task-store";
import { defaultSessionRegistry } from "@/lib/intelligence/runtime/registry/session-registry";
import { defaultRuntimeQueue } from "@/lib/intelligence/runtime/queue/queue";
import { defaultRuntimeScheduler } from "@/lib/intelligence/runtime/scheduler/scheduler";
import type {
  RuntimeActivityItem,
  RuntimeActivityKind,
} from "@/lib/intelligence/dashboard/types";

const ACTIVITY_KIND_ORDER: Record<RuntimeActivityKind, number> = {
  session: 0,
  task: 1,
  queue: 2,
  scheduler: 3,
};

/**
 * Build recent activity feed from in-memory runtime foundations.
 */
export function buildRuntimeActivityFeed(limit = 10): RuntimeActivityItem[] {
  const items: RuntimeActivityItem[] = [];

  for (const entry of defaultSessionRegistry.list()) {
    items.push({
      id: `session-${entry.sessionId}`,
      kind: "session",
      action: `Session ${entry.lifecycle}`,
      target: entry.requestId,
      timestamp: entry.updatedAt,
    });
  }

  for (const task of defaultAgentTaskStore.list()) {
    items.push({
      id: `task-${task.id}`,
      kind: "task",
      action: `Task ${task.status}`,
      target: task.title.trim() || task.id,
      timestamp: task.updatedAt,
    });
  }

  for (const queueItem of defaultRuntimeQueue.list()) {
    items.push({
      id: `queue-${queueItem.id}`,
      kind: "queue",
      action: `Queue item ${queueItem.status}`,
      target: queueItem.requestId,
      timestamp: queueItem.updatedAt,
    });
  }

  for (const scheduleItem of defaultRuntimeScheduler.list()) {
    items.push({
      id: `scheduler-${scheduleItem.id}`,
      kind: "scheduler",
      action: `Schedule ${scheduleItem.status}`,
      target: scheduleItem.requestId,
      timestamp: scheduleItem.updatedAt,
    });
  }

  return items
    .sort((a, b) => {
      const timeDelta = b.timestamp.localeCompare(a.timestamp);

      if (timeDelta !== 0) {
        return timeDelta;
      }

      return ACTIVITY_KIND_ORDER[a.kind] - ACTIVITY_KIND_ORDER[b.kind];
    })
    .slice(0, limit);
}

/**
 * Returns true when any runtime foundation has tracked records.
 */
export function hasRuntimeFoundationActivity(input: {
  sessionTotal: number;
  queueTotal: number;
  schedulerTotal: number;
  taskTotal: number;
  workerProcessedItems: number;
}): boolean {
  return (
    input.sessionTotal > 0 ||
    input.queueTotal > 0 ||
    input.schedulerTotal > 0 ||
    input.taskTotal > 0 ||
    input.workerProcessedItems > 0
  );
}
