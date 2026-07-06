import { IntelligencePipelineError } from "@/lib/intelligence/engine/errors";
import type { IntelligencePipelineStageId } from "@/lib/intelligence/pipeline-stage.types";
import {
  stageConfidenceAssessment,
  stageContradictionDetection,
  stageEvidenceCollection,
  stageGraphContext,
  stageIntelligenceResult,
  stageMemoryContext,
  stageReasoningTrace,
  stageRequest,
  stageTrustAssessment,
  type PipelineContext,
} from "@/lib/intelligence/engine/stages";
import { createTimelineEntry, type StageTimelineEntry } from "@/lib/intelligence/trace";
import type { IntelligenceRequest } from "@/lib/intelligence/request.types";
import type { IntelligenceResult } from "@/lib/intelligence/result.types";

/**
 * Generate a unique run identifier for pipeline trace correlation.
 *
 * Uses ISO timestamp + request id to remain deterministic-friendly
 * without requiring crypto APIs during static export.
 */
function createRunId(request: IntelligenceRequest): string {
  return `run-${request.id}-${Date.now()}`;
}

/**
 * Execute a single pipeline stage with governed error wrapping and timeline capture.
 */
async function runStage<T>(
  stageId: IntelligencePipelineStageId,
  timeline: StageTimelineEntry[],
  execute: () => T | Promise<T>,
): Promise<T> {
  const startedAt = new Date().toISOString();

  try {
    const result = await execute();
    timeline.push(
      createTimelineEntry(stageId, startedAt, new Date().toISOString(), "complete"),
    );
    return result;
  } catch (error) {
    timeline.push(
      createTimelineEntry(stageId, startedAt, new Date().toISOString(), "failed"),
    );
    const message =
      error instanceof Error
        ? error.message
        : "Unknown pipeline stage failure";
    throw new IntelligencePipelineError(message, stageId);
  }
}

/**
 * Execute the full Intelligence Engine pipeline in canonical order.
 *
 * Pipeline sequence:
 * Request → Evidence → Contradiction → Confidence → Trust → Graph → Memory → Reasoning Trace → Result
 *
 * Stage timing is captured in a timeline passed to the Reasoning Trace Layer.
 *
 * @param request - Intelligence request envelope
 * @returns Assembled {@link IntelligenceResult}
 */
export async function executePipeline(
  request: IntelligenceRequest,
): Promise<IntelligenceResult> {
  const runId = createRunId(request);
  const startedAt = new Date().toISOString();
  const timeline: StageTimelineEntry[] = [];

  const validatedRequest = await runStage("request", timeline, () =>
    stageRequest(request),
  );

  const evidence = await runStage("evidence-collection", timeline, () =>
    stageEvidenceCollection(validatedRequest),
  );

  const evidenceWithContradictions = await runStage(
    "contradiction-detection",
    timeline,
    () => stageContradictionDetection(validatedRequest, evidence),
  );

  const confidence = await runStage("confidence-assessment", timeline, () =>
    stageConfidenceAssessment(validatedRequest, evidenceWithContradictions),
  );

  const trust = await runStage("trust-assessment", timeline, () =>
    stageTrustAssessment(validatedRequest, evidenceWithContradictions, confidence),
  );

  const graphContext = await runStage("graph-context", timeline, () =>
    stageGraphContext(validatedRequest, evidenceWithContradictions),
  );

  const memoryContext = await runStage("memory-context", timeline, () =>
    stageMemoryContext(validatedRequest, evidenceWithContradictions),
  );

  const reasoningTrace = await runStage("reasoning-trace", timeline, () =>
    stageReasoningTrace({
      runId,
      pipelineStartedAt: startedAt,
      timeline: [...timeline],
      request: validatedRequest,
      evidence: evidenceWithContradictions,
      confidence,
      trust,
      graphContext,
      memoryContext,
    }),
  );

  const context: PipelineContext = {
    request: validatedRequest,
    runId,
    startedAt,
    evidence: evidenceWithContradictions,
    confidence,
    trust,
    graphContext,
    memoryContext,
    reasoningTrace,
    result: {} as IntelligenceResult,
  };

  const result = await runStage("intelligence-result", timeline, () =>
    stageIntelligenceResult(context),
  );

  return result;
}
