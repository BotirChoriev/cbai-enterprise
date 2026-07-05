/**
 * CBAI Intelligence Engine — Reasoning Trace Layer (BUILD-028).
 *
 * Structured pipeline execution audit. No AI reasoning, conclusions,
 * or fabricated explanations.
 *
 * @see docs/build-028-report.md
 */

export {
  DEFAULT_REASONING_TRACE_BUILDER_ID,
  DefaultReasoningTraceBuilder,
  defaultReasoningTraceBuilder,
  REASONING_TRACE_BUILDER_VERSION,
  type PipelineTraceInput,
  type ReasoningTraceBuilder,
} from "@/lib/intelligence/trace/trace-builder";

export {
  computeTimelineTotalDurationMs,
  createTimelineEntry,
  sortTimelineEntries,
  timelineEntryToStageTrace,
  TRACE_TIMELINE_STAGE_ORDER,
  type StageTimelineEntry,
} from "@/lib/intelligence/trace/timeline";

export {
  collectMissingContext,
  collectPipelineWarnings,
  resolveVerificationResult,
  verifyPipelineIntegrity,
  verifyPipelineTrace,
  verifyRequiredStagesExecuted,
  type PipelineTraceVerificationInput,
} from "@/lib/intelligence/trace/verification";
