import type { QueueItem, QueueItemStatus } from "@/lib/intelligence/runtime/queue/types";
import type { AgentTask } from "@/lib/intelligence/agents/tasks/task";
import type { TaskStatus } from "@/lib/intelligence/agents/tasks/task-lifecycle";

/** Semantic version of the agent queue integration foundation. */
export const AGENT_QUEUE_INTEGRATION_VERSION = "0.1.0-agent-queue-integration";

/**
 * Agent queue integration policy (BUILD-056).
 */
export interface AgentQueuePolicy {
  /** Reject enqueue when task id is already tracked in the active queue. */
  rejectDuplicateTaskId: boolean;
  /** Reject enqueue for terminal task lifecycle states. */
  rejectTerminalTasks: boolean;
}

/** Default agent queue integration policy. */
export const DEFAULT_AGENT_QUEUE_POLICY: AgentQueuePolicy = {
  rejectDuplicateTaskId: true,
  rejectTerminalTasks: true,
};

/**
 * Queue integration diagnostics (BUILD-056).
 */
export interface AgentQueueDiagnostics {
  /** Runtime queue item id. */
  queueItemId: string | null;
  /** Agent task id. */
  taskId: string;
  /** Current task lifecycle status. */
  taskStatus: TaskStatus;
  /** Current queue item status. */
  queueStatus: QueueItemStatus | null;
  /** Non-blocking warnings. */
  warnings: readonly string[];
  /** Whether the dequeued task is ready for dispatch preparation. */
  readyForDispatch: boolean;
}

/**
 * Result of enqueueing an agent task.
 */
export interface AgentQueueEnqueueResult {
  /** Whether the task was enqueued. */
  accepted: boolean;
  /** Updated task record when accepted. */
  task?: AgentTask;
  /** Enqueued queue item when accepted. */
  queueItem?: QueueItem;
  /** Integration diagnostics. */
  diagnostics?: AgentQueueDiagnostics;
  /** Rejection reason when not accepted. */
  reason?: string;
}

/**
 * Result of dequeuing an agent task.
 */
export interface AgentQueueDequeueResult {
  /** Whether a task was dequeued. */
  dequeued: boolean;
  /** Resolved agent task when dequeued. */
  task?: AgentTask;
  /** Dequeued queue item when successful. */
  queueItem?: QueueItem;
  /** Integration diagnostics. */
  diagnostics?: AgentQueueDiagnostics;
  /** Reason when queue was empty or task missing. */
  reason?: string;
}
