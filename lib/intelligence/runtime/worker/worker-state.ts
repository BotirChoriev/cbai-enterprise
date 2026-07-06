import type {
  RuntimeWorkerDiagnostics,
  RuntimeWorkerPolicy,
  RuntimeWorkerSnapshot,
  RuntimeWorkerState,
} from "@/lib/intelligence/runtime/worker/types";
import { RUNTIME_WORKER_VERSION } from "@/lib/intelligence/runtime/worker/types";

/** Valid worker lifecycle transitions (BUILD-059). */
const WORKER_STATE_TRANSITIONS: Readonly<
  Record<RuntimeWorkerState, readonly RuntimeWorkerState[]>
> = {
  created: ["initialized"],
  initialized: ["running"],
  running: ["stopped"],
  stopped: [],
};

/**
 * Returns true when a worker lifecycle transition is allowed.
 */
export function canTransitionWorkerState(
  from: RuntimeWorkerState,
  to: RuntimeWorkerState,
): boolean {
  return WORKER_STATE_TRANSITIONS[from].includes(to);
}

/**
 * Resolve the next worker state for a lifecycle operation.
 */
export function transitionWorkerState(
  current: RuntimeWorkerState,
  next: RuntimeWorkerState,
): RuntimeWorkerState | null {
  return canTransitionWorkerState(current, next) ? next : null;
}

/**
 * Create initial internal worker tracking state.
 */
export function createInitialWorkerTrackingState(): {
  workerState: RuntimeWorkerState;
  processedItems: number;
  warnings: string[];
  lastTick: string | null;
} {
  return {
    workerState: "created",
    processedItems: 0,
    warnings: [],
    lastTick: null,
  };
}

/**
 * Append warnings without duplicates.
 */
export function appendWorkerWarnings(
  existing: readonly string[],
  incoming: readonly string[],
): string[] {
  const merged = [...existing];

  for (const warning of incoming) {
    if (!merged.includes(warning)) {
      merged.push(warning);
    }
  }

  return merged;
}

/**
 * Build worker diagnostics from internal tracking state.
 */
export function buildRuntimeWorkerDiagnostics(input: {
  workerState: RuntimeWorkerState;
  processedItems: number;
  warnings: readonly string[];
  lastTick: string | null;
}): RuntimeWorkerDiagnostics {
  return {
    workerState: input.workerState,
    processedItems: input.processedItems,
    warnings: [...input.warnings],
    lastTick: input.lastTick,
  };
}

/**
 * Build immutable worker snapshot.
 */
export function buildRuntimeWorkerSnapshot(input: {
  workerState: RuntimeWorkerState;
  processedItems: number;
  warnings: readonly string[];
  lastTick: string | null;
  policy: RuntimeWorkerPolicy;
}): RuntimeWorkerSnapshot {
  return {
    workerState: input.workerState,
    processedItems: input.processedItems,
    warnings: [...input.warnings],
    lastTick: input.lastTick,
    workerVersion: RUNTIME_WORKER_VERSION,
    policy: { ...input.policy },
  };
}

/**
 * Copy worker snapshot for safe external use.
 */
export function copyRuntimeWorkerSnapshot(
  snapshot: RuntimeWorkerSnapshot,
): RuntimeWorkerSnapshot {
  return {
    ...snapshot,
    warnings: [...snapshot.warnings],
    policy: { ...snapshot.policy },
  };
}

/**
 * Increment processed item counter deterministically.
 */
export function incrementProcessedItems(
  current: number,
  delta: number,
): number {
  return Math.max(0, current + Math.max(0, delta));
}
