/**
 * CBAI Intelligence — Runtime Worker Abstraction (BUILD-059).
 *
 * Caller-driven coordination for future runtime processing.
 * No timers, polling, background threads, or agent execution.
 *
 * @see docs/build-059-report.md
 */

export {
  RUNTIME_WORKER_VERSION,
  DEFAULT_RUNTIME_WORKER_POLICY,
  type RuntimeWorkerState,
  type RuntimeWorkerProcessStep,
  type RuntimeWorkerPolicy,
  type RuntimeWorkerDiagnostics,
  type RuntimeWorkerSnapshot,
  type RuntimeWorkerOperationInput,
  type RuntimeWorkerLifecycleResult,
  type RuntimeWorkerTickResult,
  type RuntimeWorkerProcessNextResult,
  type RuntimeWorkerContext,
} from "@/lib/intelligence/runtime/worker/types";

export {
  buildRuntimeWorkerContext,
  copyRuntimeWorkerContext,
  type RuntimeWorkerDependencies,
} from "@/lib/intelligence/runtime/worker/worker-context";

export {
  canTransitionWorkerState,
  transitionWorkerState,
  createInitialWorkerTrackingState,
  appendWorkerWarnings,
  buildRuntimeWorkerDiagnostics,
  buildRuntimeWorkerSnapshot,
  copyRuntimeWorkerSnapshot,
  incrementProcessedItems,
} from "@/lib/intelligence/runtime/worker/worker-state";

export {
  resolveWorkerEvaluatedAt,
  validateWorkerInitialize,
  validateWorkerStart,
  validateWorkerStop,
  validateWorkerTick,
  validateWorkerProcessNext,
  hasSchedulerReadyItems,
  hasQueuePendingItems,
  resolveNextWorkerProcessStep,
  collectSchedulerEvaluationWarnings,
} from "@/lib/intelligence/runtime/worker/worker-policy";

export {
  DEFAULT_RUNTIME_WORKER_ID,
  DefaultRuntimeWorker,
  defaultRuntimeWorker,
  initializeRuntimeWorker,
  tickRuntimeWorker,
  type RuntimeWorker,
} from "@/lib/intelligence/runtime/worker/worker";
