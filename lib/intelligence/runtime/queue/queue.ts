import {
  compareQueueItemsForDispatch,
  createQueueItem,
  incrementQueueItemAttempts,
  updateQueueItemStatus,
} from "@/lib/intelligence/runtime/queue/queue-item";
import {
  DEFAULT_RUNTIME_QUEUE_POLICY,
  resolveQueueItemMaxAttempts,
  resolveQueueItemPriority,
  validateEnqueue,
} from "@/lib/intelligence/runtime/queue/queue-policy";
import {
  buildRuntimeQueueSnapshot,
  collectActiveRequestIds,
} from "@/lib/intelligence/runtime/queue/queue-state";
import type {
  QueueEnqueueInput,
  QueueEnqueueResult,
  QueueItem,
  QueueItemStatus,
  RuntimeQueuePolicy,
  RuntimeQueueSnapshot,
} from "@/lib/intelligence/runtime/queue/types";

/** Stable identifier for the default runtime queue. */
export const DEFAULT_RUNTIME_QUEUE_ID = "default-runtime-queue";

/**
 * Contract for the CBAI Runtime Queue (BUILD-042).
 *
 * In-memory foundation for future queued intelligence executions.
 * No persistence, workers, or browser APIs.
 */
export interface RuntimeQueue {
  /** Active queue policy. */
  readonly policy: RuntimeQueuePolicy;

  /** Enqueue a new intelligence execution request. */
  enqueue(input: QueueEnqueueInput): QueueEnqueueResult;

  /** Remove and return the next pending item for dispatch. */
  dequeue(): QueueItem | null;

  /** Inspect the next pending item without removing it. */
  peek(): QueueItem | null;

  /** Current number of items in the queue. */
  size(): number;

  /** Remove all items from the queue. */
  clear(): void;

  /** Immutable queue state snapshot. */
  snapshot(): RuntimeQueueSnapshot;

  /** Returns a copy of all queue items in deterministic order. */
  list(): readonly QueueItem[];
}

/**
 * Default in-memory runtime queue (BUILD-042).
 */
export class DefaultRuntimeQueue implements RuntimeQueue {
  readonly policy: RuntimeQueuePolicy;
  private items: QueueItem[] = [];

  constructor(policy: RuntimeQueuePolicy = DEFAULT_RUNTIME_QUEUE_POLICY) {
    this.policy = { ...policy };
  }

  enqueue(input: QueueEnqueueInput): QueueEnqueueResult {
    const validation = validateEnqueue(
      input,
      this.policy,
      collectActiveRequestIds(this.items),
      this.items.length,
    );

    if (!validation.accepted) {
      return { accepted: false, reason: validation.reason };
    }

    const item = createQueueItem({
      requestId: input.requestId.trim(),
      priority: resolveQueueItemPriority(input),
      maxAttempts: resolveQueueItemMaxAttempts(input, this.policy),
      reason: input.reason,
    });

    this.items.push(item);

    return { accepted: true, item };
  }

  dequeue(): QueueItem | null {
    const next = this.selectNextPendingItem();

    if (!next) {
      return null;
    }

    const index = this.items.findIndex((item) => item.id === next.id);

    if (index === -1) {
      return null;
    }

    const withAttempt = incrementQueueItemAttempts(next);
    const running = updateQueueItemStatus(withAttempt, "running");
    this.items[index] = running;

    return { ...running };
  }

  peek(): QueueItem | null {
    const next = this.selectNextPendingItem();
    return next ? { ...next } : null;
  }

  size(): number {
    return this.items.length;
  }

  clear(): void {
    this.items = [];
  }

  snapshot(): RuntimeQueueSnapshot {
    return buildRuntimeQueueSnapshot(this.items, this.policy);
  }

  list(): readonly QueueItem[] {
    return [...this.items].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  /**
   * Mark a running item completed — extension point for future worker integration.
   */
  markCompleted(itemId: string, reason?: string): QueueItem | null {
    return this.updateItemById(itemId, "completed", reason);
  }

  /**
   * Mark a running item failed — extension point for future worker integration.
   */
  markFailed(itemId: string, reason?: string): QueueItem | null {
    return this.updateItemById(itemId, "failed", reason);
  }

  /**
   * Mark an item cancelled.
   */
  markCancelled(itemId: string, reason?: string): QueueItem | null {
    return this.updateItemById(itemId, "cancelled", reason);
  }

  private selectNextPendingItem(): QueueItem | null {
    const pending = this.items.filter((item) => item.status === "pending");

    if (pending.length === 0) {
      return null;
    }

    if (this.policy.dispatchMode === "fifo") {
      const sorted = [...pending].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
      return sorted[0] ?? null;
    }

    const sorted = [...pending].sort(compareQueueItemsForDispatch);
    return sorted[0] ?? null;
  }

  private updateItemById(
    itemId: string,
    status: QueueItemStatus,
    reason?: string,
  ): QueueItem | null {
    const index = this.items.findIndex((item) => item.id === itemId);

    if (index === -1) {
      return null;
    }

    const updated = updateQueueItemStatus(
      this.items[index],
      status,
      new Date().toISOString(),
      reason,
    );
    this.items[index] = updated;
    return { ...updated };
  }
}

/** Shared default runtime queue singleton. */
export const defaultRuntimeQueue = new DefaultRuntimeQueue();
