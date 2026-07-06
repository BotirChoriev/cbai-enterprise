import type {
  RuntimeFailure,
  RuntimeLifecycleStatus,
  RuntimeState,
} from "@/lib/intelligence/runtime/runtime.types";
import type { OrchestratorPolicies } from "@/lib/intelligence/orchestrator/policies";
import type { OrchestratorStageId } from "@/lib/intelligence/orchestrator/types";
import { INTELLIGENCE_RUNTIME_VERSION } from "@/lib/intelligence/runtime/runtime.types";

/**
 * Input for building an immutable {@link RuntimeState} snapshot.
 */
export interface RuntimeStateInput {
  sessionId: string;
  requestId: string;
  lifecycle: RuntimeLifecycleStatus;
  startedAt: string | null;
  finishedAt: string | null;
  activeStage: OrchestratorStageId | null;
  lastCompletedStage: OrchestratorStageId | null;
  policies: OrchestratorPolicies;
  warnings: readonly string[];
  failures: readonly RuntimeFailure[];
  eventCount: number;
}

/**
 * Compute duration in milliseconds from start and finish timestamps.
 */
export function computeRuntimeDurationMs(
  startedAt: string | null,
  finishedAt: string | null,
): number | null {
  if (!startedAt || !finishedAt) {
    return null;
  }

  const startedMs = Date.parse(startedAt);
  const finishedMs = Date.parse(finishedAt);

  if (!Number.isFinite(startedMs) || !Number.isFinite(finishedMs)) {
    return null;
  }

  return Math.max(0, finishedMs - startedMs);
}

/**
 * Build an immutable runtime state snapshot.
 */
export function buildRuntimeState(input: RuntimeStateInput): RuntimeState {
  return {
    sessionId: input.sessionId,
    requestId: input.requestId,
    lifecycle: input.lifecycle,
    startedAt: input.startedAt,
    finishedAt: input.finishedAt,
    durationMs: computeRuntimeDurationMs(input.startedAt, input.finishedAt),
    activeStage: input.activeStage,
    lastCompletedStage: input.lastCompletedStage,
    policies: { ...input.policies },
    warnings: [...input.warnings],
    failures: input.failures.map((failure) => ({ ...failure })),
    eventCount: input.eventCount,
    runtimeVersion: INTELLIGENCE_RUNTIME_VERSION,
  };
}

/**
 * Returns true when lifecycle status represents a terminal session state.
 */
export function isTerminalRuntimeLifecycle(
  lifecycle: RuntimeLifecycleStatus,
): boolean {
  return (
    lifecycle === "completed" ||
    lifecycle === "failed" ||
    lifecycle === "cancelled"
  );
}
