import type { OrchestratorStageId } from "@/lib/intelligence/orchestrator/types";
import type { RuntimeLifecycleStatus } from "@/lib/intelligence/runtime/runtime.types";

/** Deterministic runtime event types (BUILD-041). */
export type RuntimeEventType =
  | "SessionStarted"
  | "StageStarted"
  | "StageCompleted"
  | "StageFailed"
  | "SessionCompleted"
  | "SessionCancelled";

/** Runtime event: session started. */
export const RUNTIME_EVENT_SESSION_STARTED = "SessionStarted" as const;

/** Runtime event: stage started. */
export const RUNTIME_EVENT_STAGE_STARTED = "StageStarted" as const;

/** Runtime event: stage completed. */
export const RUNTIME_EVENT_STAGE_COMPLETED = "StageCompleted" as const;

/** Runtime event: stage failed. */
export const RUNTIME_EVENT_STAGE_FAILED = "StageFailed" as const;

/** Runtime event: session completed. */
export const RUNTIME_EVENT_SESSION_COMPLETED = "SessionCompleted" as const;

/** Runtime event: session cancelled. */
export const RUNTIME_EVENT_SESSION_CANCELLED = "SessionCancelled" as const;

/**
 * A deterministic runtime lifecycle event.
 */
export interface RuntimeEvent {
  /** Event type identifier. */
  type: RuntimeEventType;
  /** Session that produced the event. */
  sessionId: string;
  /** ISO-8601 timestamp when the event occurred. */
  timestamp: string;
  /** Lifecycle status after the event. */
  lifecycle: RuntimeLifecycleStatus;
  /** Related orchestrator stage, when applicable. */
  stageId?: OrchestratorStageId;
  /** Optional factual message — no business intelligence. */
  message?: string;
}

/**
 * Create a runtime event record.
 */
export function createRuntimeEvent(input: {
  type: RuntimeEventType;
  sessionId: string;
  timestamp: string;
  lifecycle: RuntimeLifecycleStatus;
  stageId?: OrchestratorStageId;
  message?: string;
}): RuntimeEvent {
  return {
    type: input.type,
    sessionId: input.sessionId,
    timestamp: input.timestamp,
    lifecycle: input.lifecycle,
    stageId: input.stageId,
    message: input.message,
  };
}
