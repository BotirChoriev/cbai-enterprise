/** Queue item lifecycle status (BUILD-042). */
export type QueueItemStatus =
  | "pending"
  | "running"
  | "completed"
  | "failed"
  | "cancelled";

/** Queue dispatch ordering mode. */
export type QueueDispatchMode = "fifo" | "priority";

/**
 * Policy governing runtime queue behavior (BUILD-042).
 */
export interface RuntimeQueuePolicy {
  /** Dispatch ordering — FIFO or priority-based. */
  dispatchMode: QueueDispatchMode;
  /** Maximum number of items allowed in the queue. */
  maxQueueSize: number;
  /** Default maximum execution attempts per item. */
  maxAttempts: number;
  /** Reject enqueue when request id already exists in queue. */
  rejectDuplicateRequestId: boolean;
}

/**
 * A queued intelligence execution item.
 */
export interface QueueItem {
  /** Unique queue item identifier. */
  id: string;
  /** Source intelligence request id. */
  requestId: string;
  /** Dispatch priority — higher values dequeue first in priority mode. */
  priority: number;
  /** Current queue item status. */
  status: QueueItemStatus;
  /** ISO-8601 timestamp when the item was enqueued. */
  createdAt: string;
  /** ISO-8601 timestamp when the item was last updated. */
  updatedAt: string;
  /** Number of execution attempts recorded. */
  attempts: number;
  /** Maximum allowed attempts before terminal failure. */
  maxAttempts: number;
  /** Optional factual reason or note — no business intelligence. */
  reason?: string;
}

/**
 * Input for enqueueing a new queue item.
 */
export interface QueueEnqueueInput {
  /** Intelligence request id to queue. */
  requestId: string;
  /** Dispatch priority (default 0). */
  priority?: number;
  /** Optional enqueue reason. */
  reason?: string;
  /** Override default max attempts for this item. */
  maxAttempts?: number;
}

/**
 * Result of an enqueue operation.
 */
export interface QueueEnqueueResult {
  /** Whether the item was accepted. */
  accepted: boolean;
  /** Enqueued item when accepted. */
  item?: QueueItem;
  /** Rejection reason when not accepted. */
  reason?: string;
}

/**
 * Immutable runtime queue state snapshot (BUILD-042).
 */
export interface RuntimeQueueSnapshot {
  /** Total items tracked by the queue. */
  total: number;
  /** Items awaiting dispatch. */
  pending: number;
  /** Items currently running. */
  running: number;
  /** Items completed successfully. */
  completed: number;
  /** Items that failed. */
  failed: number;
  /** Items cancelled. */
  cancelled: number;
  /** Active queue policy at snapshot time. */
  policy: RuntimeQueuePolicy;
  /** Queue semantic version. */
  queueVersion: string;
}

/** Semantic version of the runtime queue foundation. */
export const RUNTIME_QUEUE_VERSION = "0.1.0-queue-foundation";
