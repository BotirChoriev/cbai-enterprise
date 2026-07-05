import { IntelligencePipelineError } from "@/lib/intelligence/engine/errors";
import type { IntelligencePipelineStageId } from "@/lib/intelligence/pipeline-stage.types";
import {
  stageConfidenceAssessment,
  stageEvidenceCollection,
  stageGraphContext,
  stageIntelligenceResult,
  stageMemoryContext,
  stageReasoningTrace,
  stageRequest,
  stageTrustAssessment,
  type PipelineContext,
} from "@/lib/intelligence/engine/stages";
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
 * Execute a single pipeline stage with governed error wrapping.
 *
 * Extension point: stage timing, partial trace emission, and
 * streaming progress callbacks will hook in here.
 */
async function runStage<T>(
  stageId: IntelligencePipelineStageId,
  execute: () => T | Promise<T>,
): Promise<T> {
  try {
    return await execute();
  } catch (error) {
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
 * Pipeline sequence (BUILD-022):
 * Request → Evidence Collection → Confidence Assessment → Trust Assessment
 * → Graph Context → Memory Context → Reasoning Trace → Intelligence Result
 *
 * Each stage is a separate function returning typed placeholders.
 * No intelligence logic, scoring, graph traversal, or memory reads occur.
 *
 * @param request - Intelligence request envelope
 * @returns Assembled {@link IntelligenceResult} with skeleton placeholders
 * @throws {@link IntelligenceValidationError} when request validation fails
 * @throws {@link IntelligencePipelineError} when a stage throws unexpectedly
 */
export async function executePipeline(
  request: IntelligenceRequest,
): Promise<IntelligenceResult> {
  const runId = createRunId(request);
  const startedAt = new Date().toISOString();

  const validatedRequest = await runStage("request", () => stageRequest(request));

  const evidence = await runStage("evidence-collection", () =>
    stageEvidenceCollection(validatedRequest),
  );

  const confidence = await runStage("confidence-assessment", () =>
    stageConfidenceAssessment(validatedRequest, evidence),
  );

  const trust = await runStage("trust-assessment", () =>
    stageTrustAssessment(validatedRequest, evidence, confidence),
  );

  const graphContext = await runStage("graph-context", () =>
    stageGraphContext(validatedRequest, evidence),
  );

  const memoryContext = await runStage("memory-context", () =>
    stageMemoryContext(validatedRequest, evidence),
  );

  const completedAt = new Date().toISOString();

  const reasoningTrace = await runStage("reasoning-trace", () =>
    stageReasoningTrace(runId, startedAt, completedAt),
  );

  const context: PipelineContext = {
    request: validatedRequest,
    runId,
    startedAt,
    evidence,
    confidence,
    trust,
    graphContext,
    memoryContext,
    reasoningTrace,
    result: {} as IntelligenceResult,
  };

  const result = await runStage("intelligence-result", () =>
    stageIntelligenceResult(context),
  );

  return result;
}
