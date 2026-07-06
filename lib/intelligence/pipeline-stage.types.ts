/**
 * Canonical stage identifiers for the Intelligence Engine execution pipeline.
 *
 * Shared between the engine skeleton and {@link ReasoningTrace} stage records.
 * Ordered sequence enforced by {@link executePipeline} in `engine/pipeline.ts`.
 */
export type IntelligencePipelineStageId =
  | "request"
  | "evidence-collection"
  | "contradiction-detection"
  | "confidence-assessment"
  | "trust-assessment"
  | "graph-context"
  | "memory-context"
  | "reasoning-trace"
  | "intelligence-result";

/** Human-readable labels for pipeline stages. */
export const PIPELINE_STAGE_LABELS: Record<IntelligencePipelineStageId, string> =
  {
    request: "Request",
    "evidence-collection": "Evidence Collection",
    "contradiction-detection": "Contradiction Detection",
    "confidence-assessment": "Confidence Assessment",
    "trust-assessment": "Trust Assessment",
    "graph-context": "Graph Context",
    "memory-context": "Memory Context",
    "reasoning-trace": "Reasoning Trace",
    "intelligence-result": "Intelligence Result",
  };

/** Ordered pipeline stage sequence for BUILD-022 skeleton. */
export const PIPELINE_STAGE_ORDER: IntelligencePipelineStageId[] = [
  "request",
  "evidence-collection",
  "contradiction-detection",
  "confidence-assessment",
  "trust-assessment",
  "graph-context",
  "memory-context",
  "reasoning-trace",
  "intelligence-result",
];
