import type { ConfidenceAssessment } from "@/lib/intelligence/confidence.types";
import type { GraphContext, MemoryContext } from "@/lib/intelligence/context.types";
import type { EvidenceCollection } from "@/lib/intelligence/evidence.types";
import type { IntelligenceRequest } from "@/lib/intelligence/request.types";
import type { IntelligenceResult } from "@/lib/intelligence/result.types";
import type { ReasoningTrace } from "@/lib/intelligence/trace.types";
import type { TrustAssessment } from "@/lib/intelligence/trust.types";
import { IntelligenceValidationError } from "@/lib/intelligence/engine/errors";
import { defaultEvidenceCollector } from "@/lib/intelligence/evidence";
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
 * Stage 3 — Confidence assessment.
 *
 * Extension point: weighted factor computation per Intelligence Specification §4.2.
 *
 * @param _request - Validated intelligence request
 * @param _evidence - Collected evidence from stage 2
 * @param _graphContext - Optional graph context when graph stage ran
 * @returns Typed placeholder — zero score, insufficient band, skeleton degradation note
 */
export function stageConfidenceAssessment(
  request: IntelligenceRequest,
  evidence: EvidenceCollection,
  graphContext?: GraphContext,
): ConfidenceAssessment {
  void request;
  void evidence;
  void graphContext;

  const skeletonDetail = "Skeleton placeholder — not computed";

  return {
    score: 0,
    band: "insufficient",
    factors: [
      {
        id: "evidence-volume",
        label: "Evidence Volume",
        weight: 0.25,
        score: 0,
        detail: skeletonDetail,
      },
      {
        id: "source-relevance",
        label: "Source Relevance",
        weight: 0.25,
        score: 0,
        detail: skeletonDetail,
      },
      {
        id: "graph-connectivity",
        label: "Graph Connectivity",
        weight: 0.25,
        score: 0,
        detail: skeletonDetail,
      },
      {
        id: "entity-signal-quality",
        label: "Entity Signal Quality",
        weight: 0.25,
        score: 0,
        detail: skeletonDetail,
      },
    ],
    degraded: true,
    degradationReason:
      "Intelligence engine skeleton — confidence assessment not yet implemented",
  };
}

/**
 * Stage 4 — Trust assessment.
 *
 * Extension point: producer trust matrix, source trust inheritance,
 * and contradiction caps per Intelligence Specification §5.
 *
 * @param _request - Validated intelligence request
 * @param _evidence - Collected evidence
 * @param _confidence - Confidence assessment from stage 3
 * @returns Typed placeholder — unverified tier with skeleton cap applied
 */
export function stageTrustAssessment(
  request: IntelligenceRequest,
  evidence: EvidenceCollection,
  confidence: ConfidenceAssessment,
): TrustAssessment {
  void request;
  void evidence;
  void confidence;

  return {
    tier: "unverified",
    producer: {
      type: "reasoning-engine",
      id: "default-intelligence-engine",
      name: "Default Intelligence Engine",
      version: ENGINE_SKELETON_VERSION,
    },
    capsApplied: ["skeleton-mode"],
    humanVerified: false,
  };
}

/**
 * Stage 5 — Graph context assembly.
 *
 * Extension point: seed from search matches, bounded traversal,
 * connectivity score for confidence factor per Specification §10.
 *
 * @param _request - Validated intelligence request
 * @returns Typed placeholder — empty subgraph, zero connectivity, no stalemate
 */
export function stageGraphContext(request: IntelligenceRequest): GraphContext {
  void request;

  return {
    seedNodeIds: [],
    traversedPaths: [],
    connectivityScore: 0,
    stalemate: false,
    nodeCount: 0,
    edgeCount: 0,
  };
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
