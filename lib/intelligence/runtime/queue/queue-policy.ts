import type {
  QueueEnqueueInput,
  RuntimeQueuePolicy,
} from "@/lib/intelligence/runtime/queue/types";

/** Default runtime queue policy (BUILD-042). */
export const DEFAULT_RUNTIME_QUEUE_POLICY: RuntimeQueuePolicy = {
  dispatchMode: "fifo",
  maxQueueSize: 100,
  maxAttempts: 3,
  rejectDuplicateRequestId: true,
};

/** Policy flag label: FIFO dispatch. */
export const QUEUE_POLICY_FIFO = "FIFO" as const;

/** Policy flag label: priority dispatch. */
export const QUEUE_POLICY_PRIORITY = "priority" as const;

/** Policy flag label: max queue size. */
export const QUEUE_POLICY_MAX_QUEUE_SIZE = "maxQueueSize" as const;

/** Policy flag label: max attempts. */
export const QUEUE_POLICY_MAX_ATTEMPTS = "maxAttempts" as const;

/** Policy flag label: reject duplicate request id. */
export const QUEUE_POLICY_REJECT_DUPLICATE_REQUEST_ID =
  "rejectDuplicateRequestId" as const;

/**
 * Validate enqueue input against queue policy and current queue contents.
 */
export function validateEnqueue(
  input: QueueEnqueueInput,
  policy: RuntimeQueuePolicy,
  existingRequestIds: ReadonlySet<string>,
  currentSize: number,
): { accepted: true } | { accepted: false; reason: string } {
  if (!input.requestId.trim()) {
    return { accepted: false, reason: "Queue reject: request id is required." };
  }

  if (currentSize >= policy.maxQueueSize) {
    return {
      accepted: false,
      reason: `Queue reject: max queue size (${policy.maxQueueSize}) reached.`,
    };
  }

  if (policy.rejectDuplicateRequestId && existingRequestIds.has(input.requestId)) {
    return {
      accepted: false,
      reason: `Queue reject: duplicate request id "${input.requestId}".`,
    };
  }

  return { accepted: true };
}

/**
 * Resolve max attempts for a new queue item.
 */
export function resolveQueueItemMaxAttempts(
  input: QueueEnqueueInput,
  policy: RuntimeQueuePolicy,
): number {
  if (
    input.maxAttempts !== undefined &&
    Number.isInteger(input.maxAttempts) &&
    input.maxAttempts > 0
  ) {
    return input.maxAttempts;
  }

  return policy.maxAttempts;
}

/**
 * Resolve dispatch priority for a new queue item.
 */
export function resolveQueueItemPriority(input: QueueEnqueueInput): number {
  if (input.priority === undefined || !Number.isFinite(input.priority)) {
    return 0;
  }

  return Math.round(input.priority);
}
