/**
 * CBAI Intelligence Engine — Runtime Layer (BUILD-041).
 *
 * Manages HOW a single intelligence execution lives.
 * The Orchestrator decides WHAT to execute.
 *
 * @see docs/build-041-report.md
 */

export {
  DEFAULT_INTELLIGENCE_RUNTIME_ID,
  DefaultIntelligenceRuntime,
  INTELLIGENCE_RUNTIME_VERSION,
  defaultIntelligenceRuntime,
  type IntelligenceRuntime,
} from "@/lib/intelligence/runtime/runtime";

export {
  RuntimeSession,
  createRuntimeSessionId,
  resetRuntimeSessionSequence,
} from "@/lib/intelligence/runtime/runtime-session";

export {
  RUNTIME_EVENT_SESSION_CANCELLED,
  RUNTIME_EVENT_SESSION_COMPLETED,
  RUNTIME_EVENT_SESSION_STARTED,
  RUNTIME_EVENT_STAGE_COMPLETED,
  RUNTIME_EVENT_STAGE_FAILED,
  RUNTIME_EVENT_STAGE_STARTED,
  createRuntimeEvent,
  type RuntimeEvent,
  type RuntimeEventType,
} from "@/lib/intelligence/runtime/runtime-events";

export {
  buildRuntimeState,
  computeRuntimeDurationMs,
  isTerminalRuntimeLifecycle,
  type RuntimeStateInput,
} from "@/lib/intelligence/runtime/runtime-state";

export type {
  RuntimeFailure,
  RuntimeLifecycleStatus,
  RuntimeState,
} from "@/lib/intelligence/runtime/runtime.types";
