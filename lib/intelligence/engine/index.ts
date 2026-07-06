/**
 * CBAI Intelligence Engine — execution skeleton (BUILD-022).
 *
 * Pipeline orchestration and stage functions with typed placeholder outputs.
 * No intelligence logic, AI calls, graph traversal, or memory implementation.
 *
 * @see docs/build-022-report.md
 */

export {
  DefaultIntelligenceEngine,
  defaultIntelligenceEngine,
} from "@/lib/intelligence/engine/engine";

export {
  IntelligenceEngineError,
  IntelligencePipelineError,
  IntelligenceValidationError,
} from "@/lib/intelligence/engine/errors";

export { executePipeline } from "@/lib/intelligence/engine/pipeline";

export {
  PIPELINE_STAGE_LABELS,
  PIPELINE_STAGE_ORDER,
  type IntelligencePipelineStageId,
} from "@/lib/intelligence/pipeline-stage.types";

export {
  ENGINE_SKELETON_VERSION,
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
