import {
  appendWorkerWarnings,
  buildRuntimeWorkerDiagnostics,
  buildRuntimeWorkerSnapshot,
  createInitialWorkerTrackingState,
  incrementProcessedItems,
  transitionWorkerState,
} from "@/lib/intelligence/runtime/worker/worker-state";
import {
  buildRuntimeWorkerContext,
  type RuntimeWorkerDependencies,
} from "@/lib/intelligence/runtime/worker/worker-context";
import {
  collectSchedulerEvaluationWarnings,
  resolveNextWorkerProcessStep,
  validateWorkerInitialize,
  validateWorkerProcessNext,
  validateWorkerStart,
  validateWorkerStop,
  validateWorkerTick,
} from "@/lib/intelligence/runtime/worker/worker-policy";
import type {
  RuntimeWorkerContext,
  RuntimeWorkerDiagnostics,
  RuntimeWorkerLifecycleResult,
  RuntimeWorkerOperationInput,
  RuntimeWorkerPolicy,
  RuntimeWorkerProcessNextResult,
  RuntimeWorkerSnapshot,
  RuntimeWorkerTickResult,
} from "@/lib/intelligence/runtime/worker/types";
import { DEFAULT_RUNTIME_WORKER_POLICY } from "@/lib/intelligence/runtime/worker/types";

/** Stable identifier for the default runtime worker. */
export const DEFAULT_RUNTIME_WORKER_ID = "default-runtime-worker";

/**
 * Contract for the CBAI Runtime Worker (BUILD-059).
 *
 * Caller-driven coordination for future runtime processing.
 * No timers, polling, background threads, or agent execution.
 */
export interface RuntimeWorker {
  /** Prepare internal worker state. */
  initialize(): RuntimeWorkerLifecycleResult;

  /** Move worker to running — no loops or timers. */
  start(): RuntimeWorkerLifecycleResult;

  /** Move worker to stopped. */
  stop(): RuntimeWorkerLifecycleResult;

  /** Single deterministic evaluation cycle. */
  tick(input?: RuntimeWorkerOperationInput): RuntimeWorkerTickResult;

  /** Perform exactly one processing step. */
  processNext(input?: RuntimeWorkerOperationInput): RuntimeWorkerProcessNextResult;

  /** Return current worker diagnostics snapshot. */
  snapshot(): RuntimeWorkerSnapshot;
}

/**
 * Default runtime worker implementation (BUILD-059).
 */
export class DefaultRuntimeWorker implements RuntimeWorker {
  private readonly context: RuntimeWorkerContext;
  private readonly policy: RuntimeWorkerPolicy;
  private tracking = createInitialWorkerTrackingState();

  constructor(
    deps: RuntimeWorkerDependencies = {},
    policy: RuntimeWorkerPolicy = DEFAULT_RUNTIME_WORKER_POLICY,
  ) {
    this.context = buildRuntimeWorkerContext(deps);
    this.policy = { ...policy };
  }

  initialize(): RuntimeWorkerLifecycleResult {
    const validation = validateWorkerInitialize(this.tracking.workerState);

    if (!validation.accepted) {
      return {
        accepted: false,
        workerState: this.tracking.workerState,
        reason: validation.reason,
      };
    }

    const nextState = transitionWorkerState(this.tracking.workerState, "initialized");

    if (!nextState) {
      return {
        accepted: false,
        workerState: this.tracking.workerState,
        reason: "Worker reject: initialize transition failed.",
      };
    }

    this.tracking.workerState = nextState;

    return {
      accepted: true,
      workerState: this.tracking.workerState,
    };
  }

  start(): RuntimeWorkerLifecycleResult {
    const validation = validateWorkerStart(this.tracking.workerState);

    if (!validation.accepted) {
      return {
        accepted: false,
        workerState: this.tracking.workerState,
        reason: validation.reason,
      };
    }

    const nextState = transitionWorkerState(this.tracking.workerState, "running");

    if (!nextState) {
      return {
        accepted: false,
        workerState: this.tracking.workerState,
        reason: "Worker reject: start transition failed.",
      };
    }

    this.tracking.workerState = nextState;

    return {
      accepted: true,
      workerState: this.tracking.workerState,
    };
  }

  stop(): RuntimeWorkerLifecycleResult {
    const validation = validateWorkerStop(this.tracking.workerState);

    if (!validation.accepted) {
      return {
        accepted: false,
        workerState: this.tracking.workerState,
        reason: validation.reason,
      };
    }

    const nextState = transitionWorkerState(this.tracking.workerState, "stopped");

    if (!nextState) {
      return {
        accepted: false,
        workerState: this.tracking.workerState,
        reason: "Worker reject: stop transition failed.",
      };
    }

    this.tracking.workerState = nextState;

    return {
      accepted: true,
      workerState: this.tracking.workerState,
    };
  }

  tick(input?: RuntimeWorkerOperationInput): RuntimeWorkerTickResult {
    const validation = validateWorkerTick({
      workerState: this.tracking.workerState,
      operation: input,
      policy: this.policy,
    });

    if (!validation.accepted) {
      return {
        accepted: false,
        evaluatedAt: input?.evaluatedAt?.trim() ?? "",
        schedulerEnqueuedCount: 0,
        dequeued: false,
        warnings: [...this.tracking.warnings],
        reason: validation.reason,
      };
    }

    const tickWarnings: string[] = [];
    let schedulerEnqueuedCount = 0;
    let dequeued = false;
    let dequeuedTaskId: string | undefined;

    if (this.policy.evaluateSchedulerOnTick) {
      const evaluation = this.context.schedulerBridge.evaluateReadyTasks(
        validation.evaluatedAt,
      );
      schedulerEnqueuedCount = evaluation.enqueuedCount;
      tickWarnings.push(...collectSchedulerEvaluationWarnings(evaluation.entries));
      this.tracking.processedItems = incrementProcessedItems(
        this.tracking.processedItems,
        evaluation.enqueuedCount,
      );
    }

    if (this.policy.dequeueOnTick) {
      const dequeueResult = this.context.queueIntegration.dequeueTask();

      if (dequeueResult.dequeued && dequeueResult.task) {
        dequeued = true;
        dequeuedTaskId = dequeueResult.task.id;
        this.tracking.processedItems = incrementProcessedItems(
          this.tracking.processedItems,
          1,
        );
      } else if (dequeueResult.reason) {
        tickWarnings.push(dequeueResult.reason);
      }
    }

    this.tracking.warnings = appendWorkerWarnings(this.tracking.warnings, tickWarnings);
    this.tracking.lastTick = validation.evaluatedAt;

    return {
      accepted: true,
      evaluatedAt: validation.evaluatedAt,
      schedulerEnqueuedCount,
      dequeued,
      dequeuedTaskId,
      warnings: [...tickWarnings],
    };
  }

  processNext(input?: RuntimeWorkerOperationInput): RuntimeWorkerProcessNextResult {
    const validation = validateWorkerProcessNext({
      workerState: this.tracking.workerState,
      operation: input,
      policy: this.policy,
    });

    if (!validation.accepted) {
      return {
        accepted: false,
        step: "idle",
        evaluatedAt: input?.evaluatedAt?.trim() ?? "",
        warnings: [...this.tracking.warnings],
        reason: validation.reason,
      };
    }

    const step = resolveNextWorkerProcessStep({
      context: this.context,
      evaluatedAt: validation.evaluatedAt,
      policy: this.policy,
    });

    if (step === "idle") {
      return {
        accepted: true,
        step: "idle",
        evaluatedAt: validation.evaluatedAt,
        warnings: [],
        reason: "Worker idle: no scheduler-ready or queue-pending work.",
      };
    }

    if (step === "schedule_evaluate") {
      const evaluation = this.context.schedulerBridge.evaluateReadyTasks(
        validation.evaluatedAt,
      );
      const stepWarnings = collectSchedulerEvaluationWarnings(evaluation.entries);
      this.tracking.processedItems = incrementProcessedItems(
        this.tracking.processedItems,
        evaluation.enqueuedCount,
      );
      this.tracking.warnings = appendWorkerWarnings(this.tracking.warnings, stepWarnings);

      return {
        accepted: true,
        step: "schedule_evaluate",
        evaluatedAt: validation.evaluatedAt,
        schedulerEnqueuedCount: evaluation.enqueuedCount,
        warnings: [...stepWarnings],
      };
    }

    const dequeueResult = this.context.queueIntegration.dequeueTask();
    const stepWarnings = dequeueResult.reason ? [dequeueResult.reason] : [];

    if (dequeueResult.dequeued && dequeueResult.task) {
      this.tracking.processedItems = incrementProcessedItems(
        this.tracking.processedItems,
        1,
      );
    } else if (dequeueResult.reason) {
      this.tracking.warnings = appendWorkerWarnings(this.tracking.warnings, stepWarnings);
    }

    return {
      accepted: dequeueResult.dequeued,
      step: "dequeue",
      evaluatedAt: validation.evaluatedAt,
      dequeued: dequeueResult.dequeued,
      dequeuedTaskId: dequeueResult.task?.id,
      warnings: [...stepWarnings],
      reason: dequeueResult.dequeued ? undefined : dequeueResult.reason,
    };
  }

  snapshot(): RuntimeWorkerSnapshot {
    return buildRuntimeWorkerSnapshot({
      workerState: this.tracking.workerState,
      processedItems: this.tracking.processedItems,
      warnings: this.tracking.warnings,
      lastTick: this.tracking.lastTick,
      policy: this.policy,
    });
  }

  /** Expose diagnostics without full snapshot — useful for internal callers. */
  diagnostics(): RuntimeWorkerDiagnostics {
    return buildRuntimeWorkerDiagnostics({
      workerState: this.tracking.workerState,
      processedItems: this.tracking.processedItems,
      warnings: this.tracking.warnings,
      lastTick: this.tracking.lastTick,
    });
  }
}

/** Shared default runtime worker singleton. */
export const defaultRuntimeWorker = new DefaultRuntimeWorker();

/**
 * Convenience helper — initialize the default worker.
 */
export function initializeRuntimeWorker(
  worker: RuntimeWorker = defaultRuntimeWorker,
): RuntimeWorkerLifecycleResult {
  return worker.initialize();
}

/**
 * Convenience helper — run one tick on the default worker.
 */
export function tickRuntimeWorker(
  input?: RuntimeWorkerOperationInput,
  worker: RuntimeWorker = defaultRuntimeWorker,
): RuntimeWorkerTickResult {
  return worker.tick(input);
}

export type { RuntimeWorkerDependencies };
