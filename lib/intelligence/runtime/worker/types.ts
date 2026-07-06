import type { AgentQueueIntegration } from "@/lib/intelligence/agents/queue/agent-queue-integration";
import type { AgentSchedulerBridge } from "@/lib/intelligence/agents/scheduler/agent-scheduler-bridge";
import type { AgentTaskStore } from "@/lib/intelligence/agents/tasks/store/task-store";
import type { RuntimeQueue } from "@/lib/intelligence/runtime/queue/queue";
import type { RuntimeScheduler } from "@/lib/intelligence/runtime/scheduler/scheduler";

/** Semantic version of the runtime worker foundation. */
export const RUNTIME_WORKER_VERSION = "0.1.0-runtime-worker";

/** Runtime worker lifecycle state (BUILD-059). */
export type RuntimeWorkerState = "created" | "initialized" | "running" | "stopped";

/** Single processing step classification for processNext(). */
export type RuntimeWorkerProcessStep = "schedule_evaluate" | "dequeue" | "idle";

/**
 * Runtime worker policy (BUILD-059).
 *
 * Caller-driven coordination only — no timers or automatic execution.
 */
export interface RuntimeWorkerPolicy {
  /** Require explicit evaluatedAt for tick and processNext. */
  requireExplicitEvaluatedAt: boolean;
  /** Evaluate scheduler during tick(). */
  evaluateSchedulerOnTick: boolean;
  /** Dequeue one task during tick(). */
  dequeueOnTick: boolean;
  /** Prefer scheduler evaluation before dequeue in processNext(). */
  schedulerFirstOnProcessNext: boolean;
}

/** Default runtime worker policy. */
export const DEFAULT_RUNTIME_WORKER_POLICY: RuntimeWorkerPolicy = {
  requireExplicitEvaluatedAt: false,
  evaluateSchedulerOnTick: true,
  dequeueOnTick: true,
  schedulerFirstOnProcessNext: true,
};

/**
 * Worker diagnostics returned by snapshot and lifecycle operations.
 */
export interface RuntimeWorkerDiagnostics {
  /** Current worker lifecycle state. */
  workerState: RuntimeWorkerState;
  /** Total items processed across tick/processNext calls. */
  processedItems: number;
  /** Non-blocking warnings accumulated during worker operations. */
  warnings: readonly string[];
  /** ISO-8601 timestamp of the last successful tick, if any. */
  lastTick: string | null;
}

/**
 * Immutable worker snapshot.
 */
export interface RuntimeWorkerSnapshot extends RuntimeWorkerDiagnostics {
  /** Worker semantic version. */
  workerVersion: string;
  /** Active worker policy at snapshot time. */
  policy: RuntimeWorkerPolicy;
}

/**
 * Input for tick() and processNext().
 */
export interface RuntimeWorkerOperationInput {
  /** Evaluation timestamp for scheduler readiness. */
  evaluatedAt?: string;
}

/**
 * Result of initialize(), start(), or stop().
 */
export interface RuntimeWorkerLifecycleResult {
  /** Whether the lifecycle transition succeeded. */
  accepted: boolean;
  /** Worker state after the operation. */
  workerState: RuntimeWorkerState;
  /** Rejection reason when not accepted. */
  reason?: string;
}

/**
 * Result of a single tick() evaluation cycle.
 */
export interface RuntimeWorkerTickResult {
  /** Whether tick completed while running. */
  accepted: boolean;
  /** Evaluation timestamp used. */
  evaluatedAt: string;
  /** Tasks promoted from scheduler to queue during tick. */
  schedulerEnqueuedCount: number;
  /** Whether one queue item was dequeued. */
  dequeued: boolean;
  /** Dequeued agent task id when dequeued. */
  dequeuedTaskId?: string;
  /** Non-blocking warnings from this tick. */
  warnings: readonly string[];
  /** Rejection reason when not accepted. */
  reason?: string;
}

/**
 * Result of a single processNext() step.
 */
export interface RuntimeWorkerProcessNextResult {
  /** Whether processNext completed while running. */
  accepted: boolean;
  /** Processing step performed. */
  step: RuntimeWorkerProcessStep;
  /** Evaluation timestamp used. */
  evaluatedAt: string;
  /** Tasks promoted when step is schedule_evaluate. */
  schedulerEnqueuedCount?: number;
  /** Whether a queue item was dequeued when step is dequeue. */
  dequeued?: boolean;
  /** Dequeued agent task id when dequeued. */
  dequeuedTaskId?: string;
  /** Non-blocking warnings from this step. */
  warnings: readonly string[];
  /** Rejection or idle reason when applicable. */
  reason?: string;
}

/**
 * Resolved runtime worker dependencies (BUILD-059).
 */
export interface RuntimeWorkerContext {
  /** Agent task store for task lifecycle tracking. */
  taskStore: AgentTaskStore;
  /** Scheduler bridge for caller-driven schedule evaluation. */
  schedulerBridge: AgentSchedulerBridge;
  /** Queue integration for enqueue/dequeue preparation. */
  queueIntegration: AgentQueueIntegration;
  /** Runtime scheduler for readiness probes (read-only). */
  scheduler: RuntimeScheduler;
  /** Runtime queue for pending probes (read-only). */
  queue: RuntimeQueue;
}
