import type { ConfidenceAssessment } from "@/lib/intelligence/confidence.types";
import type { GraphContext, MemoryContext } from "@/lib/intelligence/context.types";
import type { EvidenceCollection } from "@/lib/intelligence/evidence.types";
import type { IntelligenceRequest } from "@/lib/intelligence/request.types";
import type { IntelligenceResult } from "@/lib/intelligence/result.types";
import type { ReasoningTrace } from "@/lib/intelligence/trace.types";
import type { TrustAssessment } from "@/lib/intelligence/trust.types";
import { IntelligenceValidationError } from "@/lib/intelligence/engine/errors";
import { defaultEvidenceCollector } from "@/lib/intelligence/evidence";
import { defaultConfidenceAssessor } from "@/lib/intelligence/confidence";
import { defaultTrustAssessor } from "@/lib/intelligence/trust";
import { defaultGraphContextBuilder } from "@/lib/intelligence/graph";
import type { GraphContextBuildResult } from "@/lib/intelligence/graph";
import {
  PIPELINE_STAGE_LABELS,
  PIPELINE_STAGE_ORDER,
} from "@/lib/intelligence/pipeline-stage.types";

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
 * Stage 3 — Confidence assessment via the Confidence Assessment Layer.
 *
 * Delegates to {@link DefaultConfidenceAssessor}. Extension point: graph and
 * entity signal factors when those layers are connected in future builds.
 *
 * @param request - Validated intelligence request
 * @param evidence - Collected evidence from stage 2
 * @returns Conservative confidence assessment from evidence state
 */
export async function stageConfidenceAssessment(
  request: IntelligenceRequest,
  evidence: EvidenceCollection,
): Promise<ConfidenceAssessment> {
  return defaultConfidenceAssessor.assess(request, evidence);
}

/**
 * Stage 4 — Trust assessment via the Trust Assessment Layer.
 *
 * Delegates to {@link DefaultTrustAssessor}. Trust is evidence-grounded and
 * never copied from confidence score magnitude.
 *
 * @param request - Validated intelligence request
 * @param evidence - Collected evidence from stage 2
 * @param confidence - Confidence assessment from stage 3 (caps only)
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
 * Stage 5 — Graph context assembly via the Graph Context Layer.
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
 * Stage 6 — Memory context assembly.
 *
 * Extension point: pinned knowledge, conversations, watchlists
 * per Intelligence Specification §9.
 *
 * @param request - Validated intelligence request
 * @returns Typed placeholder — empty entries, tenant passthrough
 */
export function stageMemoryContext(request: IntelligenceRequest): MemoryContext {
  return {
    entries: [],
    tenantId: request.tenantId,
  };
}

/**
 * Stage 7 — Reasoning trace assembly.
 *
 * Extension point: per-stage timing, verification results,
 * and agent decision records per Specification §8.5.
 *
 * @param runId - Pipeline run identifier
 * @param startedAt - Pipeline start timestamp
 * @param completedAt - Pipeline completion timestamp
 * @returns Typed placeholder trace marking skeleton execution as degraded
 */
export function stageReasoningTrace(
  runId: string,
  startedAt: string,
  completedAt: string,
): ReasoningTrace {
  const startedMs = Date.parse(startedAt);
  const completedMs = Date.parse(completedAt);
  const totalDurationMs =
    Number.isFinite(startedMs) && Number.isFinite(completedMs)
      ? Math.max(0, completedMs - startedMs)
      : undefined;

  return {
    runId,
    stages: PIPELINE_STAGE_ORDER.map((stageId) => ({
      stageId,
      label: PIPELINE_STAGE_LABELS[stageId],
      status: "complete" as const,
      startedAt,
      completedAt,
      output: "Skeleton placeholder — stage executed without intelligence logic",
      verificationResult: "degraded" as const,
    })),
    agentDecisions: [],
    verificationResult: "degraded",
    producerVersion: ENGINE_SKELETON_VERSION,
    startedAt,
    completedAt,
    totalDurationMs,
  };
}

/**
 * Stage 8 — Intelligence result assembly.
 *
 * Extension point: claim synthesis, subject entity resolution,
 * summary generation, and lifecycle state assignment.
 *
 * @param context - Fully populated pipeline context from prior stages
 * @returns Typed placeholder result wiring all stage outputs together
 */
export function stageIntelligenceResult(context: PipelineContext): IntelligenceResult {
  const { request, runId, evidence, confidence, trust, reasoningTrace } = context;
  const producedAt = reasoningTrace.completedAt ?? new Date().toISOString();

  const skeletonNotice =
    "Intelligence engine skeleton — pipeline executed; intelligence logic not yet implemented.";

  return {
    id: runId,
    requestId: request.id,
    type: request.type ?? "entity",
    claim: skeletonNotice,
    finalAnswer: skeletonNotice,
    subjectEntities: (request.subjectEntities ?? []).map((entity) => ({
      type: entity.type,
      id: entity.id,
      name: entity.name ?? entity.id,
    })),
    evidence,
    confidence,
    trust,
    reasoningTrace,
    graphContext: context.graphContext,
    memoryContext: context.memoryContext,
    summary: {
      headline: skeletonNotice,
      keyFindings: [],
      caveats: [
        "This result was produced by the BUILD-022 execution skeleton.",
        "No evidence was collected, scored, or synthesized.",
      ],
      recommendedActions: [],
    },
    producedAt,
    lifecycleState: "draft",
    overrideStatus: "none",
    isStale: false,
  };
}
