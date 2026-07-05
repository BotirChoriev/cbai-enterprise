import { executePipeline } from "@/lib/intelligence/engine/pipeline";
import { ENGINE_SKELETON_VERSION } from "@/lib/intelligence/engine/stages";
import type { IntelligenceEngine } from "@/lib/intelligence/engine.types";
import type { IntelligenceRequest } from "@/lib/intelligence/request.types";
import type { IntelligenceResult } from "@/lib/intelligence/result.types";

/**
 * Default implementation of the CBAI Intelligence Engine (BUILD-022 skeleton).
 *
 * Provides the execution framework — pipeline orchestration, stage sequencing,
 * error governance, and typed placeholder outputs — without intelligence logic.
 *
 * Future builds replace individual stage functions while preserving this
 * class as the stable entry point for {@link IntelligenceEngine.run}.
 *
 * @see docs/build-022-report.md
 * @see docs/CBAI-Intelligence-Specification-v1.md
 */
export class DefaultIntelligenceEngine implements IntelligenceEngine {
  /** Engine version string recorded in traces and trust producer metadata. */
  readonly version = ENGINE_SKELETON_VERSION;

  /**
   * Execute the full intelligence pipeline for the given request.
   *
   * Delegates to {@link executePipeline} which runs all eight stages
   * in canonical order and returns a skeleton {@link IntelligenceResult}.
   *
   * @param request - Intelligence request envelope
   * @returns Promise resolving to assembled intelligence result
   */
  async run(request: IntelligenceRequest): Promise<IntelligenceResult> {
    return executePipeline(request);
  }

  /**
   * Structurally verify an existing intelligence result without re-running inference.
   *
   * Skeleton implementation: marks the trace verification as `degraded`
   * and appends a skeleton-mode cap when not already present.
   *
   * Extension point: full Specification §8 checkpoint validation.
   *
   * @param result - Existing intelligence result to verify
   * @returns Promise resolving to result with updated verification metadata
   */
  async verify(result: IntelligenceResult): Promise<IntelligenceResult> {
    const capsApplied = result.trust.capsApplied.includes("post-verify-review")
      ? result.trust.capsApplied
      : [...result.trust.capsApplied, "post-verify-review"];

    return {
      ...result,
      trust: {
        ...result.trust,
        capsApplied,
      },
      reasoningTrace: {
        ...result.reasoningTrace,
        verificationResult: "degraded",
        producerVersion: this.version,
      },
    };
  }
}

/**
 * Shared singleton instance for modules that need a default engine reference.
 *
 * Extension point: dependency injection will replace direct singleton usage
 * in production multi-tenant deployments.
 */
export const defaultIntelligenceEngine = new DefaultIntelligenceEngine();
