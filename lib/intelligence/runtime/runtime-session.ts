import type { OrchestratorPolicies } from "@/lib/intelligence/orchestrator/policies";
import type { OrchestratorStageId } from "@/lib/intelligence/orchestrator/types";
import type { IntelligenceRequest } from "@/lib/intelligence/request.types";
import {
  createRuntimeEvent,
  RUNTIME_EVENT_SESSION_CANCELLED,
  RUNTIME_EVENT_SESSION_COMPLETED,
  RUNTIME_EVENT_SESSION_STARTED,
  RUNTIME_EVENT_STAGE_COMPLETED,
  RUNTIME_EVENT_STAGE_FAILED,
  RUNTIME_EVENT_STAGE_STARTED,
  type RuntimeEvent,
} from "@/lib/intelligence/runtime/runtime-events";
import { buildRuntimeState } from "@/lib/intelligence/runtime/runtime-state";
import type {
  RuntimeFailure,
  RuntimeLifecycleStatus,
  RuntimeState,
} from "@/lib/intelligence/runtime/runtime.types";

/** Session sequence for deterministic id generation within a process. */
let runtimeSessionSequence = 0;

/**
 * Generate a unique runtime session identifier.
 */
export function createRuntimeSessionId(requestId: string): string {
  runtimeSessionSequence += 1;
  return `runtime-${requestId}-${runtimeSessionSequence}-${Date.now()}`;
}

/**
 * Reset session sequence counter — useful for deterministic test runs.
 */
export function resetRuntimeSessionSequence(): void {
  runtimeSessionSequence = 0;
}

/**
 * Runtime session tracking a single intelligence execution (BUILD-041).
 *
 * Manages HOW execution lives — lifecycle, events, warnings, and failures.
 * Does not decide WHAT to execute (see Orchestrator).
 */
export class RuntimeSession {
  readonly sessionId: string;
  readonly requestId: string;
  readonly policies: OrchestratorPolicies;

  private lifecycle: RuntimeLifecycleStatus = "created";
  private startedAt: string | null = null;
  private finishedAt: string | null = null;
  private activeStage: OrchestratorStageId | null = null;
  private lastCompletedStage: OrchestratorStageId | null = null;
  private readonly warnings: string[] = [];
  private readonly failures: RuntimeFailure[] = [];
  private readonly events: RuntimeEvent[] = [];

  constructor(request: IntelligenceRequest, policies: OrchestratorPolicies) {
    this.sessionId = createRuntimeSessionId(request.id);
    this.requestId = request.id;
    this.policies = { ...policies };
  }

  /** Current lifecycle status. */
  get status(): RuntimeLifecycleStatus {
    return this.lifecycle;
  }

  /** All deterministic events emitted for this session. */
  get eventLog(): readonly RuntimeEvent[] {
    return [...this.events];
  }

  /**
   * Transition session to running and emit SessionStarted.
   */
  start(timestamp: string = new Date().toISOString()): void {
    if (this.lifecycle !== "created") {
      return;
    }

    this.lifecycle = "running";
    this.startedAt = timestamp;
    this.emit(RUNTIME_EVENT_SESSION_STARTED, timestamp);
  }

  /**
   * Mark session paused — reserved for future agent runtime integration.
   */
  pause(timestamp: string = new Date().toISOString()): void {
    if (this.lifecycle !== "running") {
      return;
    }

    this.lifecycle = "paused";
    this.activeStage = null;
    this.appendWarning(`Session paused at ${timestamp}.`);
  }

  /**
   * Resume a paused session.
   */
  resume(timestamp: string = new Date().toISOString()): void {
    if (this.lifecycle !== "paused") {
      return;
    }

    this.lifecycle = "running";
    this.appendWarning(`Session resumed at ${timestamp}.`);
  }

  /**
   * Record stage start and emit StageStarted.
   */
  onStageStarted(
    stageId: OrchestratorStageId,
    timestamp: string = new Date().toISOString(),
  ): void {
    this.activeStage = stageId;
    this.emit(RUNTIME_EVENT_STAGE_STARTED, timestamp, stageId);
  }

  /**
   * Record stage completion and emit StageCompleted.
   */
  onStageCompleted(
    stageId: OrchestratorStageId,
    timestamp: string = new Date().toISOString(),
  ): void {
    this.lastCompletedStage = stageId;
    this.activeStage = null;
    this.emit(RUNTIME_EVENT_STAGE_COMPLETED, timestamp, stageId);
  }

  /**
   * Record stage failure and emit StageFailed.
   */
  onStageFailed(
    stageId: OrchestratorStageId,
    message: string,
    timestamp: string = new Date().toISOString(),
  ): void {
    this.activeStage = null;
    this.failures.push({
      stageId,
      message,
      occurredAt: timestamp,
    });
    this.emit(RUNTIME_EVENT_STAGE_FAILED, timestamp, stageId, message);
  }

  /**
   * Append a runtime warning (deduplicated).
   */
  appendWarning(warning: string): void {
    if (!this.warnings.includes(warning)) {
      this.warnings.push(warning);
    }
  }

  /**
   * Append multiple runtime warnings.
   */
  appendWarnings(warnings: readonly string[]): void {
    for (const warning of warnings) {
      this.appendWarning(warning);
    }
  }

  /**
   * Complete the session successfully.
   */
  complete(timestamp: string = new Date().toISOString()): void {
    if (isTerminalLifecycle(this.lifecycle)) {
      return;
    }

    this.lifecycle = "completed";
    this.finishedAt = timestamp;
    this.activeStage = null;
    this.emit(RUNTIME_EVENT_SESSION_COMPLETED, timestamp);
  }

  /**
   * Mark the session as failed.
   */
  fail(message: string, timestamp: string = new Date().toISOString()): void {
    if (isTerminalLifecycle(this.lifecycle)) {
      return;
    }

    this.lifecycle = "failed";
    this.finishedAt = timestamp;
    this.activeStage = null;
    this.appendWarning(message);
  }

  /**
   * Cancel the session and emit SessionCancelled.
   */
  cancel(
    reason: string,
    timestamp: string = new Date().toISOString(),
  ): void {
    if (isTerminalLifecycle(this.lifecycle)) {
      return;
    }

    this.lifecycle = "cancelled";
    this.finishedAt = timestamp;
    this.activeStage = null;
    this.appendWarning(reason);
    this.emit(RUNTIME_EVENT_SESSION_CANCELLED, timestamp, undefined, reason);
  }

  /**
   * Produce an immutable runtime state snapshot.
   */
  snapshot(): RuntimeState {
    return buildRuntimeState({
      sessionId: this.sessionId,
      requestId: this.requestId,
      lifecycle: this.lifecycle,
      startedAt: this.startedAt,
      finishedAt: this.finishedAt,
      activeStage: this.activeStage,
      lastCompletedStage: this.lastCompletedStage,
      policies: this.policies,
      warnings: this.warnings,
      failures: this.failures,
      eventCount: this.events.length,
    });
  }

  private emit(
    type: RuntimeEvent["type"],
    timestamp: string,
    stageId?: OrchestratorStageId,
    message?: string,
  ): void {
    this.events.push(
      createRuntimeEvent({
        type,
        sessionId: this.sessionId,
        timestamp,
        lifecycle: this.lifecycle,
        stageId,
        message,
      }),
    );
  }
}

function isTerminalLifecycle(lifecycle: RuntimeLifecycleStatus): boolean {
  return lifecycle === "completed" || lifecycle === "failed" || lifecycle === "cancelled";
}
