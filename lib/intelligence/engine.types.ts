import type { IntelligenceRequest } from "@/lib/intelligence/request.types";
import type { IntelligenceResult } from "@/lib/intelligence/result.types";

/**
 * Execution status returned while an intelligence run is in progress.
 */
export type IntelligenceRunStatus = "idle" | "running" | "complete" | "failed";

/**
 * In-progress intelligence run envelope for streaming or staged UI consumption.
 *
 * Separated from {@link IntelligenceResult} so consumers can observe partial
 * pipeline progress without requiring a complete product.
 */
export interface IntelligenceRun {
  /** Current execution status. */
  status: IntelligenceRunStatus;
  /** The request driving this run. */
  request: IntelligenceRequest;
  /** Index of the active pipeline stage, when running. */
  activeStageIndex?: number;
  /** Complete result, present when {@link status} is `complete`. */
  result: IntelligenceResult | null;
  /** Error message when {@link status} is `failed`. */
  error?: string;
}

/**
 * Contract for the CBAI Intelligence Engine.
 *
 * Defines the framework-agnostic interface that future implementations
 * (mock, deterministic, model-backed) must satisfy. This build defines
 * types only — no implementation is provided.
 *
 * The engine orchestrates the Reason stage of the intelligence lifecycle:
 * consuming an {@link IntelligenceRequest}, gathering evidence from entity
 * index, knowledge graph, and memory context, and producing a governed
 * {@link IntelligenceResult}.
 *
 * @see docs/CBAI-Intelligence-Specification-v1.md
 * @see docs/CBAI-Domain-Model-v1.md §6
 */
export interface IntelligenceEngine {
  /**
   * Execute a full intelligence pipeline for the given request.
   *
   * Implementations must produce a result that satisfies Intelligence
   * Specification §1.1 or fail with a governed error — never return
   * high-confidence intelligence to mask pipeline failure (§15.2 F1).
   */
  run(request: IntelligenceRequest): Promise<IntelligenceResult>;

  /**
   * Optionally verify an existing result against structural rules
   * per Intelligence Specification §8 without re-running inference.
   *
   * Returns an updated result with verification metadata on the trace.
   */
  verify?(result: IntelligenceResult): Promise<IntelligenceResult>;
}
