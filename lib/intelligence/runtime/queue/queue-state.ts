import type {
  QueueItem,
  QueueItemStatus,
  RuntimeQueuePolicy,
  RuntimeQueueSnapshot,
} from "@/lib/intelligence/runtime/queue/types";
import { RUNTIME_QUEUE_VERSION } from "@/lib/intelligence/runtime/queue/types";

/**
 * Count queue items by status.
 */
export function countQueueItemsByStatus(
  items: readonly QueueItem[],
  status: QueueItemStatus,
): number {
  return items.filter((item) => item.status === status).length;
}

/**
 * Build an immutable runtime queue state snapshot.
 */
export function buildRuntimeQueueSnapshot(
  items: readonly QueueItem[],
  policy: RuntimeQueuePolicy,
): RuntimeQueueSnapshot {
  return {
    total: items.length,
    pending: countQueueItemsByStatus(items, "pending"),
    running: countQueueItemsByStatus(items, "running"),
    completed: countQueueItemsByStatus(items, "completed"),
    failed: countQueueItemsByStatus(items, "failed"),
    cancelled: countQueueItemsByStatus(items, "cancelled"),
    policy: { ...policy },
    queueVersion: RUNTIME_QUEUE_VERSION,
  };
}

/**
 * Collect active request ids from non-terminal queue items.
 */
export function collectActiveRequestIds(items: readonly QueueItem[]): Set<string> {
  const ids = new Set<string>();

  for (const item of items) {
    if (item.status === "pending" || item.status === "running") {
      ids.add(item.requestId);
    }
  }

  return ids;
}
