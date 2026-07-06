import type { ConfidenceAssessment } from "@/lib/intelligence/confidence.types";
import type { GraphContext, MemoryContext } from "@/lib/intelligence/context.types";
import type { EvidenceCollection } from "@/lib/intelligence/evidence.types";
import type { IntelligenceRequest } from "@/lib/intelligence/request.types";
import {
  defaultResultAssembler,
} from "@/lib/intelligence/result";
import type { IntelligenceResult } from "@/lib/intelligence/result.types";
import type { ReasoningTrace } from "@/lib/intelligence/trace.types";
import type { TrustAssessment } from "@/lib/intelligence/trust.types";
import { IntelligenceValidationError } from "@/lib/intelligence/engine/errors";
import { defaultEvidenceCollector } from "@/lib/intelligence/evidence";
import { defaultConfidenceAssessor } from "@/lib/intelligence/confidence";
import {
  applyContradictionDetectionToEvidence,
  defaultContradictionDetector,
} from "@/lib/intelligence/contradictions";
import { defaultTrustAssessor } from "@/lib/intelligence/trust";
import { defaultGraphContextBuilder } from "@/lib/intelligence/graph";
import type { GraphContextBuildResult } from "@/lib/intelligence/graph";
import { defaultMemoryContextBuilder } from "@/lib/intelligence/memory";
import type { MemoryContextBuildResult } from "@/lib/intelligence/memory";
import {
  defaultReasoningTraceBuilder,
  type PipelineTraceInput,
} from "@/lib/intelligence/trace";

/** Semantic version of the skeleton engine — embedded in traces and trust producer metadata. */
export const ENGINE_SKELETON_VERSION = "0.1.0-skeleton";

/**
 * Accumulated state passed between pipeline stages.
 *
 * Extension point: future stages read prior outputs from this context
 * rather than recomputing upstream artifacts.
 */
export interface PipelineContext {
  /** Original intelligence request. */
  request: IntelligenceRequest;
  /** Unique run identifier for trace correlation. */
  runId: string;
  /** ISO-8601 pipeline start timestamp. */
  startedAt: string;
  /** Output of the evidence-collection stage. */
  evidence: EvidenceCollection;
  /** Output of the confidence-assessment stage. */
  confidence: ConfidenceAssessment;
  /** Output of the trust-assessment stage. */
  trust: TrustAssessment;
  /** Output of the graph-context stage; omitted when graph is disabled. */
  graphContext?: GraphContext;
  /** Output of the memory-context stage; omitted when memory is disabled. */
  memoryContext?: MemoryContext;
  /** Output of the reasoning-trace stage. */
  reasoningTrace: ReasoningTrace;
  /** Final intelligence product. */
  result: IntelligenceResult;
}

/**
 * Stage 1 — Request validation and normalization.
 *
 * Extension point: intent classification, entity scope resolution,
 * and tenant policy checks will be added here in future builds.
 *
 * @param request - Raw intelligence request from the caller
 * @returns Validated request (currently passthrough after field checks)
 * @throws {@link IntelligenceValidationError} when required fields are missing
 */
export function stageRequest(request: IntelligenceRequest): IntelligenceRequest {
  if (!request.id?.trim()) {
    throw new IntelligenceValidationError("Request id is required", "id");
  }
  if (!request.question?.trim()) {
    throw new IntelligenceValidationError("Request question is required", "question");
  }
  if (!request.requestedAt?.trim()) {
    throw new IntelligenceValidationError(
      "Request requestedAt is required",
      "requestedAt",
    );
  }

  return request;
}

/**
 * Stage 2 — Evidence collection via the Evidence Layer.
 *
 * Delegates to {@link DefaultEvidenceCollector}. Extension point: enable
 * source adapters in the registry to populate {@link EvidenceCollection.items}.
 *
 * @param request - Validated intelligence request
 * @returns Evidence collection from the default collector
 */
export async function stageEvidenceCollection(
  request: IntelligenceRequest,
): Promise<EvidenceCollection> {
  return defaultEvidenceCollector.collect(request);
}

/**
 * Stage 3 — Contradiction detection via the Contradiction Detection Layer.
 *
 * Delegates to {@link DefaultContradictionDetector}. Analyzes collected evidence
 * for objective conflicts and enriches the collection with contradiction metadata.
 *
 * @param request - Validated intelligence request
 * @param evidence - Collected evidence from stage 2 (includes quality assessment)
 * @returns Evidence collection with contradiction state and detection metadata
 */
export async function stageContradictionDetection(
  request: IntelligenceRequest,
  evidence: EvidenceCollection,
): Promise<EvidenceCollection> {
  const result = await defaultContradictionDetector.detect(request, evidence);
  return applyContradictionDetectionToEvidence(evidence, result);
}

/**
 * Stage 4 — Confidence assessment via the Confidence Assessment Layer.
 *
 * Delegates to {@link DefaultConfidenceAssessor}. Extension point: graph and
 * entity signal factors when those layers are connected in future builds.
 *
 * @param request - Validated intelligence request
 * @param evidence - Collected evidence from stage 2 (with contradiction metadata)
 * @returns Conservative confidence assessment from evidence state
 */
export async function stageConfidenceAssessment(
  request: IntelligenceRequest,
  evidence: EvidenceCollection,
): Promise<ConfidenceAssessment> {
  return defaultConfidenceAssessor.assess(request, evidence);
}

/**
 * Stage 5 — Trust assessment via the Trust Assessment Layer.
 *
 * Delegates to {@link DefaultTrustAssessor}. Trust is evidence-grounded and
 * never copied from confidence score magnitude.
 *
 * @param request - Validated intelligence request
 * @param evidence - Collected evidence with contradiction metadata
 * @param confidence - Confidence assessment from stage 4 (caps only)
 * @returns Conservative trust assessment with governance permissions
 */
export async function stageTrustAssessment(
  request: IntelligenceRequest,
  evidence: EvidenceCollection,
  confidence: ConfidenceAssessment,
): Promise<TrustAssessment> {
  return defaultTrustAssessor.assess(request, evidence, confidence);
}

/**
 * Stage 6 — Graph context assembly via the Graph Context Layer.
 *
 * Delegates to {@link DefaultGraphContextBuilder}. Returns disabled context
 * when `includeGraph` is false; not-connected empty context when true.
 *
 * @param request - Validated intelligence request
 * @param evidence - Collected evidence from stage 2
 * @returns Graph context with explicit production status
 */
export async function stageGraphContext(
  request: IntelligenceRequest,
  evidence: EvidenceCollection,
): Promise<GraphContextBuildResult> {
  return defaultGraphContextBuilder.build(request, evidence);
}

/**
 * Stage 7 — Memory context assembly via the Memory Context Layer.
 *
 * Delegates to {@link DefaultMemoryContextBuilder}. Returns disabled context
 * when `includeMemory` is false; not-connected empty context when true.
 *
 * @param request - Validated intelligence request
 * @param evidence - Collected evidence from stage 2
 * @returns Memory context with explicit production status
 */
export async function stageMemoryContext(
  request: IntelligenceRequest,
  evidence: EvidenceCollection,
): Promise<MemoryContextBuildResult> {
  return defaultMemoryContextBuilder.build(request, evidence);
}

/**
 * Stage 8 — Reasoning trace assembly via the Reasoning Trace Layer.
 *
 * Delegates to {@link DefaultReasoningTraceBuilder}. Records only observed
 * pipeline execution — no AI reasoning or fabricated explanations.
 *
 * @param input - Pipeline artifacts and observed stage timeline
 * @returns Audit trace with verification summary
 */
export async function stageReasoningTrace(
  input: PipelineTraceInput,
): Promise<ReasoningTrace> {
  return defaultReasoningTraceBuilder.build(input);
}

/**
 * Stage 9 — Intelligence result assembly (BUILD-029).
 *
 * Delegates to the Result Layer for deterministic product assembly.
 *
 * @param context - Fully populated pipeline context from prior stages
 * @returns Assembled {@link IntelligenceResult}
 */
export async function stageIntelligenceResult(
  context: PipelineContext,
): Promise<IntelligenceResult> {
  const {
    request,
    runId,
    evidence,
    confidence,
    trust,
    graphContext,
    memoryContext,
    reasoningTrace,
  } = context;

  if (!graphContext || !memoryContext) {
    throw new IntelligenceValidationError(
      "Pipeline context missing graph or memory context required for result assembly.",
    );
  }

  return defaultResultAssembler.assemble({
    runId,
    request,
    evidence,
    confidence,
    trust,
    graphContext,
    memoryContext,
    reasoningTrace,
  });
}
