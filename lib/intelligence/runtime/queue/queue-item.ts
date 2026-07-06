import type { QueueItem, QueueItemStatus } from "@/lib/intelligence/runtime/queue/types";

/** Queue item sequence for deterministic id generation within a process. */
let queueItemSequence = 0;

/**
 * Reset queue item sequence — useful for deterministic tests.
 */
export function resetQueueItemSequence(): void {
  queueItemSequence = 0;
}

/**
 * Generate a unique queue item identifier.
 */
export function createQueueItemId(requestId: string): string {
  queueItemSequence += 1;
  return `queue-item-${requestId}-${queueItemSequence}`;
}

/**
 * Create a new pending queue item.
 */
export function createQueueItem(input: {
  requestId: string;
  priority: number;
  maxAttempts: number;
  reason?: string;
  timestamp?: string;
}): QueueItem {
  const timestamp = input.timestamp ?? new Date().toISOString();

  return {
    id: createQueueItemId(input.requestId),
    requestId: input.requestId,
    priority: input.priority,
    status: "pending",
    createdAt: timestamp,
    updatedAt: timestamp,
    attempts: 0,
    maxAttempts: input.maxAttempts,
    reason: input.reason,
  };
}

/**
 * Produce an updated queue item with a new status.
 */
export function updateQueueItemStatus(
  item: QueueItem,
  status: QueueItemStatus,
  timestamp: string = new Date().toISOString(),
  reason?: string,
): QueueItem {
  return {
    ...item,
    status,
    updatedAt: timestamp,
    reason: reason ?? item.reason,
  };
}

/**
 * Increment attempt count on a queue item.
 */
export function incrementQueueItemAttempts(
  item: QueueItem,
  timestamp: string = new Date().toISOString(),
): QueueItem {
  return {
    ...item,
    attempts: item.attempts + 1,
    updatedAt: timestamp,
  };
}

/**
 * Compare queue items for deterministic dispatch ordering.
 */
export function compareQueueItemsForDispatch(a: QueueItem, b: QueueItem): number {
  if (b.priority !== a.priority) {
    return b.priority - a.priority;
  }

  const createdCompare = a.createdAt.localeCompare(b.createdAt);

  if (createdCompare !== 0) {
    return createdCompare;
  }

  return a.id.localeCompare(b.id);
}

/**
 * Returns true when a queue item is in a terminal status.
 */
export function isTerminalQueueItemStatus(status: QueueItemStatus): boolean {
  return status === "completed" || status === "failed" || status === "cancelled";
}
