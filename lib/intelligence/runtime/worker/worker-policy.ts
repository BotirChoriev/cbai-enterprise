import { listReadyAt } from "@/lib/intelligence/runtime/scheduler/scheduler";
import type { RuntimeWorkerContext } from "@/lib/intelligence/runtime/worker/types";
import {
  DEFAULT_RUNTIME_WORKER_POLICY,
  type RuntimeWorkerOperationInput,
  type RuntimeWorkerPolicy,
  type RuntimeWorkerState,
} from "@/lib/intelligence/runtime/worker/types";

/**
 * Resolve evaluatedAt for worker operations.
 */
export function resolveWorkerEvaluatedAt(input?: RuntimeWorkerOperationInput): string {
  return input?.evaluatedAt?.trim() || new Date().toISOString();
}

/**
 * Validate initialize() against current worker state.
 */
export function validateWorkerInitialize(
  workerState: RuntimeWorkerState,
): { accepted: true } | { accepted: false; reason: string } {
  if (workerState !== "created") {
    return {
      accepted: false,
      reason: `Worker reject: initialize requires state "created", received "${workerState}".`,
    };
  }

  return { accepted: true };
}

/**
 * Validate start() against current worker state.
 */
export function validateWorkerStart(
  workerState: RuntimeWorkerState,
): { accepted: true } | { accepted: false; reason: string } {
  if (workerState !== "initialized") {
    return {
      accepted: false,
      reason: `Worker reject: start requires state "initialized", received "${workerState}".`,
    };
  }

  return { accepted: true };
}

/**
 * Validate stop() against current worker state.
 */
export function validateWorkerStop(
  workerState: RuntimeWorkerState,
): { accepted: true } | { accepted: false; reason: string } {
  if (workerState !== "running") {
    return {
      accepted: false,
      reason: `Worker reject: stop requires state "running", received "${workerState}".`,
    };
  }

  return { accepted: true };
}

/**
 * Validate tick() against worker state and policy.
 */
export function validateWorkerTick(input: {
  workerState: RuntimeWorkerState;
  operation?: RuntimeWorkerOperationInput;
  policy?: RuntimeWorkerPolicy;
}): { accepted: true; evaluatedAt: string } | { accepted: false; reason: string } {
  const policy = input.policy ?? DEFAULT_RUNTIME_WORKER_POLICY;

  if (input.workerState !== "running") {
    return {
      accepted: false,
      reason: `Worker reject: tick requires state "running", received "${input.workerState}".`,
    };
  }

  const evaluatedAt = resolveWorkerEvaluatedAt(input.operation);

  if (policy.requireExplicitEvaluatedAt && !input.operation?.evaluatedAt?.trim()) {
    return {
      accepted: false,
      reason: "Worker reject: tick requires explicit evaluatedAt.",
    };
  }

  return { accepted: true, evaluatedAt };
}

/**
 * Validate processNext() against worker state and policy.
 */
export function validateWorkerProcessNext(input: {
  workerState: RuntimeWorkerState;
  operation?: RuntimeWorkerOperationInput;
  policy?: RuntimeWorkerPolicy;
}): { accepted: true; evaluatedAt: string } | { accepted: false; reason: string } {
  const policy = input.policy ?? DEFAULT_RUNTIME_WORKER_POLICY;

  if (input.workerState !== "running") {
    return {
      accepted: false,
      reason: `Worker reject: processNext requires state "running", received "${input.workerState}".`,
    };
  }

  const evaluatedAt = resolveWorkerEvaluatedAt(input.operation);

  if (policy.requireExplicitEvaluatedAt && !input.operation?.evaluatedAt?.trim()) {
    return {
      accepted: false,
      reason: "Worker reject: processNext requires explicit evaluatedAt.",
    };
  }

  return { accepted: true, evaluatedAt };
}

/**
 * Returns true when the scheduler has due items at evaluatedAt.
 */
export function hasSchedulerReadyItems(
  context: RuntimeWorkerContext,
  evaluatedAt: string,
): boolean {
  return listReadyAt(context.scheduler, evaluatedAt).length > 0;
}

/**
 * Returns true when the runtime queue has pending items.
 */
export function hasQueuePendingItems(context: RuntimeWorkerContext): boolean {
  return context.queue.snapshot().pending > 0;
}

/**
 * Resolve the next processNext step without performing it.
 */
export function resolveNextWorkerProcessStep(input: {
  context: RuntimeWorkerContext;
  evaluatedAt: string;
  policy?: RuntimeWorkerPolicy;
}): "schedule_evaluate" | "dequeue" | "idle" {
  const policy = input.policy ?? DEFAULT_RUNTIME_WORKER_POLICY;
  const schedulerReady = hasSchedulerReadyItems(input.context, input.evaluatedAt);
  const queuePending = hasQueuePendingItems(input.context);

  if (policy.schedulerFirstOnProcessNext) {
    if (schedulerReady) {
      return "schedule_evaluate";
    }

    if (queuePending) {
      return "dequeue";
    }

    return "idle";
  }

  if (queuePending) {
    return "dequeue";
  }

  if (schedulerReady) {
    return "schedule_evaluate";
  }

  return "idle";
}

/**
 * Collect warnings from scheduler evaluation entries.
 */
export function collectSchedulerEvaluationWarnings(
  entries: readonly { queued: boolean; reason?: string }[],
): string[] {
  const warnings: string[] = [];

  for (const entry of entries) {
    if (!entry.queued && entry.reason) {
      warnings.push(entry.reason);
    }
  }

  return warnings;
}
