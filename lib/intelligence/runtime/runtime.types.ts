import type { OrchestratorPolicies } from "@/lib/intelligence/orchestrator/policies";
import type { OrchestratorStageId } from "@/lib/intelligence/orchestrator/types";

/** Runtime layer semantic version (BUILD-041). */
export const INTELLIGENCE_RUNTIME_VERSION = "0.1.0-runtime";

/** Runtime session lifecycle status (BUILD-041). */
export type RuntimeLifecycleStatus =
  | "created"
  | "running"
  | "paused"
  | "completed"
  | "failed"
  | "cancelled";

/**
 * A recorded runtime failure tied to a pipeline stage.
 */
export interface RuntimeFailure {
  /** Stage where the failure occurred. */
  stageId: OrchestratorStageId;
  /** Failure message. */
  message: string;
  /** ISO-8601 timestamp when the failure was recorded. */
  occurredAt: string;
}

/**
 * Immutable runtime state snapshot (BUILD-041).
 */
export interface RuntimeState {
  /** Unique runtime session identifier. */
  sessionId: string;
  /** Source intelligence request id. */
  requestId: string;
  /** Current lifecycle status. */
  lifecycle: RuntimeLifecycleStatus;
  /** ISO-8601 session start timestamp. */
  startedAt: string | null;
  /** ISO-8601 session finish timestamp. */
  finishedAt: string | null;
  /** Wall-clock duration in milliseconds when finished. */
  durationMs: number | null;
  /** Active orchestrator stage while running. */
  activeStage: OrchestratorStageId | null;
  /** Most recently completed orchestrator stage. */
  lastCompletedStage: OrchestratorStageId | null;
  /** Policies active for this session. */
  policies: OrchestratorPolicies;
  /** Runtime warnings collected during execution. */
  warnings: readonly string[];
  /** Runtime failures collected during execution. */
  failures: readonly RuntimeFailure[];
  /** Count of deterministic runtime events emitted. */
  eventCount: number;
  /** Runtime layer semantic version. */
  runtimeVersion: string;
}
