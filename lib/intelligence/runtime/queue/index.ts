/**
 * CBAI Intelligence Runtime — Queue Foundation (BUILD-042).
 *
 * In-memory queue for future queued intelligence executions.
 * No persistence, workers, browser APIs, or orchestrator wiring yet.
 *
 * @see docs/build-042-report.md
 */

export {
  DEFAULT_RUNTIME_QUEUE_ID,
  DefaultRuntimeQueue,
  defaultRuntimeQueue,
  type RuntimeQueue,
} from "@/lib/intelligence/runtime/queue/queue";

export {
  compareQueueItemsForDispatch,
  createQueueItem,
  createQueueItemId,
  incrementQueueItemAttempts,
  isTerminalQueueItemStatus,
  resetQueueItemSequence,
  updateQueueItemStatus,
} from "@/lib/intelligence/runtime/queue/queue-item";

export {
  DEFAULT_RUNTIME_QUEUE_POLICY,
  QUEUE_POLICY_FIFO,
  QUEUE_POLICY_MAX_ATTEMPTS,
  QUEUE_POLICY_MAX_QUEUE_SIZE,
  QUEUE_POLICY_PRIORITY,
  QUEUE_POLICY_REJECT_DUPLICATE_REQUEST_ID,
  resolveQueueItemMaxAttempts,
  resolveQueueItemPriority,
  validateEnqueue,
} from "@/lib/intelligence/runtime/queue/queue-policy";

export {
  buildRuntimeQueueSnapshot,
  collectActiveRequestIds,
  countQueueItemsByStatus,
} from "@/lib/intelligence/runtime/queue/queue-state";

export type {
  QueueDispatchMode,
  QueueEnqueueInput,
  QueueEnqueueResult,
  QueueItem,
  QueueItemStatus,
  RuntimeQueuePolicy,
  RuntimeQueueSnapshot,
} from "@/lib/intelligence/runtime/queue/types";

export { RUNTIME_QUEUE_VERSION } from "@/lib/intelligence/runtime/queue/types";
