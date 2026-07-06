import type { ConfidenceAssessment } from "@/lib/intelligence/confidence.types";
import type { GraphContext, MemoryContext } from "@/lib/intelligence/context.types";
import type { EvidenceCollection } from "@/lib/intelligence/evidence.types";
import type { IntelligenceRequest } from "@/lib/intelligence/request.types";
import { ENGINE_SKELETON_VERSION } from "@/lib/intelligence/engine/stages";
import {
  computeTimelineTotalDurationMs,
  createTimelineEntry,
  sortTimelineEntries,
  timelineEntryToStageTrace,
  type StageTimelineEntry,
} from "@/lib/intelligence/trace/timeline";
import {
  verifyPipelineTrace,
  type PipelineTraceVerificationInput,
} from "@/lib/intelligence/trace/verification";
import type { ReasoningTrace, StageVerificationResult } from "@/lib/intelligence/trace.types";
import type { TrustAssessment } from "@/lib/intelligence/trust.types";

/** Semantic version of the default reasoning trace builder. */
export const REASONING_TRACE_BUILDER_VERSION = "0.1.0-foundation";

/** Stable identifier for audit metadata. */
export const DEFAULT_REASONING_TRACE_BUILDER_ID = "default-reasoning-trace-builder";

/**
 * Input bundle for building a pipeline execution trace.
 */
export interface PipelineTraceInput {
  /** Unique pipeline run identifier. */
  runId: string;
  /** ISO-8601 timestamp when the pipeline started. */
  pipelineStartedAt: string;
  /** Observed timeline entries from executed stages (request → memory). */
  timeline: StageTimelineEntry[];
  request: IntelligenceRequest;
  evidence: EvidenceCollection;
  confidence: ConfidenceAssessment;
  trust: TrustAssessment;
  graphContext: GraphContext;
  memoryContext: MemoryContext;
}

/**
 * Contract for the CBAI Reasoning Trace Layer.
 *
 * Assembles {@link ReasoningTrace} from observed pipeline execution only.
 * No AI reasoning, conclusions, or fabricated explanations.
 */
export interface ReasoningTraceBuilder {
  /**
   * Build an audit trace from pipeline artifacts and observed timeline.
   */
  build(input: PipelineTraceInput): Promise<ReasoningTrace>;
}

/**
 * Build factual stage output summary from layer artifacts — no conclusions.
 */
function buildStageOutputSummary(
  stageId: StageTimelineEntry["stageId"],
  input: PipelineTraceInput,
): string {
  switch (stageId) {
    case "request":
      return `Request validated: id=${input.request.id}.`;
    case "evidence-collection":
      return `Evidence collection status=${input.evidence.metadata?.status ?? "unknown"}; items=${input.evidence.items.length}; sufficiency=${input.evidence.sufficiencyStatus}.`;
    case "contradiction-detection":
      return `Contradiction detection state=${input.evidence.contradictionState}; total=${input.evidence.contradictionSummary?.totalContradictions ?? 0}; blocking=${input.evidence.contradictionSummary?.hasBlockingConflict ?? false}.`;
    case "confidence-assessment":
      return `Confidence score=${input.confidence.score}; band=${input.confidence.band}; degraded=${input.confidence.degraded}.`;
    case "trust-assessment":
      return `Trust level=${input.trust.trustLevel}; score=${input.trust.trustScore}; automation=${input.trust.allowAutomation}.`;
    case "graph-context":
      return `Graph context enabled=${input.graphContext.enabled}; status=${input.graphContext.metadata?.status ?? "unknown"}; paths=${input.graphContext.traversedPaths.length}.`;
    case "memory-context":
      return `Memory context enabled=${input.memoryContext.enabled}; status=${input.memoryContext.metadata?.status ?? "unknown"}; entries=${input.memoryContext.entries.length}.`;
    default:
      return `Stage ${stageId} executed.`;
  }
}

/**
 * Resolve per-stage verification result from layer state.
 */
function resolveStageVerificationResult(
  stageId: StageTimelineEntry["stageId"],
  summaryDegraded: boolean,
): StageVerificationResult {
  if (!summaryDegraded || stageId === "request") {
    return "pass";
  }

  return "degraded";
}

/**
 * Default reasoning trace builder for the CBAI Intelligence Engine (BUILD-028).
 */
export class DefaultReasoningTraceBuilder implements ReasoningTraceBuilder {
  /**
   * Build trace recording only what actually happened during pipeline execution.
   */
  async build(input: PipelineTraceInput): Promise<ReasoningTrace> {
    const traceBuildStartedAt = new Date().toISOString();

    const verificationInput: PipelineTraceVerificationInput = {
      request: input.request,
      evidence: input.evidence,
      confidence: input.confidence,
      trust: input.trust,
      graphContext: input.graphContext,
      memoryContext: input.memoryContext,
      timeline: input.timeline,
    };

    const verificationSummary = verifyPipelineTrace(verificationInput);
    const sortedTimeline = sortTimelineEntries(input.timeline);

    const stageTraces = sortedTimeline.map((entry) =>
      timelineEntryToStageTrace(
        entry,
        buildStageOutputSummary(entry.stageId, input),
        resolveStageVerificationResult(
          entry.stageId,
          verificationSummary.degradedExecution,
        ),
      ),
    );

    const traceBuildFinishedAt = new Date().toISOString();

    const traceStageEntry = createTimelineEntry(
      "reasoning-trace",
      traceBuildStartedAt,
      traceBuildFinishedAt,
      "complete",
    );

    stageTraces.push(
      timelineEntryToStageTrace(
        traceStageEntry,
        `Trace assembled by ${DEFAULT_REASONING_TRACE_BUILDER_ID}; verification=${verificationSummary.result}.`,
        verificationSummary.result === "fail" ? "fail" : verificationSummary.result,
      ),
    );

    const completedAt = traceBuildFinishedAt;
    const totalDurationMs = computeTimelineTotalDurationMs([
      ...sortedTimeline,
      traceStageEntry,
    ]);

    return {
      runId: input.runId,
      stages: stageTraces,
      agentDecisions: [],
      verificationResult: verificationSummary.result,
      verificationSummary,
      warnings: verificationSummary.warnings,
      producerVersion: ENGINE_SKELETON_VERSION,
      startedAt: input.pipelineStartedAt,
      completedAt,
      totalDurationMs,
    };
  }
}

/** Shared default trace builder singleton used by the intelligence engine pipeline. */
export const defaultReasoningTraceBuilder = new DefaultReasoningTraceBuilder();
