import type { IntelligencePipelineStageId } from "@/lib/intelligence/pipeline-stage.types";
import { PIPELINE_STAGE_LABELS } from "@/lib/intelligence/pipeline-stage.types";
import type {
  ReasoningStageStatus,
  ReasoningStageTrace,
  StageVerificationResult,
} from "@/lib/intelligence/trace.types";

/**
 * Timeline entry for a single pipeline stage execution (BUILD-028).
 *
 * Records only observed timing and status — no inferred reasoning.
 */
export interface StageTimelineEntry {
  /** Pipeline stage identifier. */
  stageId: IntelligencePipelineStageId;
  /** Human-readable stage label. */
  label: string;
  /** ISO-8601 timestamp when the stage started. */
  startedAt: string;
  /** ISO-8601 timestamp when the stage finished. */
  finishedAt: string;
  /** Wall-clock duration in milliseconds. */
  durationMs: number;
  /** Observed execution status. */
  status: ReasoningStageStatus;
}

/** Stages recorded in the trace before result assembly. */
export const TRACE_TIMELINE_STAGE_ORDER: IntelligencePipelineStageId[] = [
  "request",
  "evidence-collection",
  "contradiction-detection",
  "confidence-assessment",
  "trust-assessment",
  "graph-context",
  "memory-context",
];

/**
 * Create a timeline entry from observed stage execution metrics.
 */
export function createTimelineEntry(
  stageId: IntelligencePipelineStageId,
  startedAt: string,
  finishedAt: string,
  status: ReasoningStageStatus,
): StageTimelineEntry {
  const startedMs = Date.parse(startedAt);
  const finishedMs = Date.parse(finishedAt);
  const durationMs =
    Number.isFinite(startedMs) && Number.isFinite(finishedMs)
      ? Math.max(0, finishedMs - startedMs)
      : 0;

  return {
    stageId,
    label: PIPELINE_STAGE_LABELS[stageId],
    startedAt,
    finishedAt,
    durationMs,
    status,
  };
}

/**
 * Convert a timeline entry to a {@link ReasoningStageTrace} audit record.
 *
 * @param entry - Observed timeline entry
 * @param output - Factual stage output summary (no fabricated reasoning)
 * @param verificationResult - Structural verification result for the stage
 */
export function timelineEntryToStageTrace(
  entry: StageTimelineEntry,
  output: string,
  verificationResult: StageVerificationResult,
): ReasoningStageTrace {
  return {
    stageId: entry.stageId,
    label: entry.label,
    status: entry.status,
    startedAt: entry.startedAt,
    completedAt: entry.finishedAt,
    durationMs: entry.durationMs,
    output,
    verificationResult,
  };
}

/**
 * Compute total pipeline duration from timeline entries.
 */
export function computeTimelineTotalDurationMs(
  entries: StageTimelineEntry[],
): number | undefined {
  if (entries.length === 0) {
    return undefined;
  }

  return entries.reduce((sum, entry) => sum + entry.durationMs, 0);
}

/**
 * Returns timeline entries sorted in canonical pipeline order.
 */
export function sortTimelineEntries(
  entries: StageTimelineEntry[],
): StageTimelineEntry[] {
  const order = new Map(
    TRACE_TIMELINE_STAGE_ORDER.map((stageId, index) => [stageId, index]),
  );

  return [...entries].sort((a, b) => {
    const indexA = order.get(a.stageId) ?? Number.MAX_SAFE_INTEGER;
    const indexB = order.get(b.stageId) ?? Number.MAX_SAFE_INTEGER;
    return indexA - indexB;
  });
}
