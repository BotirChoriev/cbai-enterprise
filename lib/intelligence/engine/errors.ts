import type { IntelligencePipelineStageId } from "@/lib/intelligence/pipeline-stage.types";

/**
 * Base error for all Intelligence Engine failures.
 *
 * Governed failures must never be masked as high-confidence intelligence
 * per Intelligence Specification §15.2 F1.
 */
export class IntelligenceEngineError extends Error {
  /** Stable error code for logging and UI handling. */
  readonly code: string;

  constructor(message: string, code = "INTELLIGENCE_ENGINE_ERROR") {
    super(message);
    this.name = "IntelligenceEngineError";
    this.code = code;
  }
}

/**
 * Thrown when an {@link IntelligenceRequest} fails structural validation
 * before pipeline execution begins.
 */
export class IntelligenceValidationError extends IntelligenceEngineError {
  /** Request field that failed validation, when applicable. */
  readonly field?: string;

  constructor(message: string, field?: string) {
    super(message, "INTELLIGENCE_VALIDATION_ERROR");
    this.name = "IntelligenceValidationError";
    this.field = field;
  }
}

/**
 * Thrown when a pipeline stage fails during execution.
 *
 * Carries the stage identifier so callers can surface partial traces
 * and apply the degradation ladder per Specification §15.3.
 */
export class IntelligencePipelineError extends IntelligenceEngineError {
  /** Pipeline stage that failed. */
  readonly stage: IntelligencePipelineStageId;

  constructor(message: string, stage: IntelligencePipelineStageId) {
    super(message, "INTELLIGENCE_PIPELINE_ERROR");
    this.name = "IntelligencePipelineError";
    this.stage = stage;
  }
}
