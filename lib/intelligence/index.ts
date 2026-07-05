/**
 * CBAI Intelligence Engine — type foundation (BUILD-021).
 *
 * Framework-agnostic interfaces defining the epistemic layer of CBAI:
 * evidence, confidence, trust, context, traces, requests, results, and
 * the engine contract.
 *
 * No implementation, mock data, or UI bindings — types only.
 *
 * @see docs/CBAI-Intelligence-Specification-v1.md
 * @see docs/CBAI-Domain-Model-v1.md
 * @see docs/build-021-report.md
 */

export type {
  ConfidenceAssessment,
  ConfidenceBand,
  ConfidenceFactor,
  ConfidenceFactorId,
} from "@/lib/intelligence/confidence.types";

export type {
  GraphContext,
  GraphContextMetadata,
  GraphContextStatus,
  IntelligenceGraphEdgeType,
  IntelligenceGraphPath,
  MemoryContext,
  MemoryEntryCategory,
  MemoryEntryRef,
} from "@/lib/intelligence/context.types";

export type {
  IntelligenceEngine,
  IntelligenceRun,
  IntelligenceRunStatus,
} from "@/lib/intelligence/engine.types";

export type {
  ContradictionState,
  Evidence,
  EvidenceClaimType,
  EvidenceCollection,
  EvidenceCollectionMetadata,
  EvidenceCollectionStatus,
  EvidenceSource,
  EvidenceSourceClass,
  EvidenceStaleness,
  EvidenceSufficiencyStatus,
  ProvenanceStrength,
} from "@/lib/intelligence/evidence.types";

export type {
  EntityRef,
  IntelligenceRequest,
  IntelligenceType,
  QueryIntent,
} from "@/lib/intelligence/request.types";

export type {
  IntelligenceLifecycleState,
  IntelligenceResult,
  IntelligenceSubjectEntity,
  IntelligenceSummary,
  OverrideStatus,
} from "@/lib/intelligence/result.types";

export type {
  AgentDecision,
  CorePipelineStageId,
  PipelineStageId,
  ReasoningStageId,
  ReasoningStageStatus,
  ReasoningStageTrace,
  ReasoningTrace,
  StageVerificationResult,
  TraceVerificationResult,
} from "@/lib/intelligence/trace.types";

export type {
  IntelligenceProducer,
  IntelligenceProducerType,
  SourceTrustLevel,
  TrustAssessment,
  TrustLevel,
  TrustTier,
} from "@/lib/intelligence/trust.types";

export {
  DefaultIntelligenceEngine,
  defaultIntelligenceEngine,
  ENGINE_SKELETON_VERSION,
  executePipeline,
  IntelligenceEngineError,
  IntelligencePipelineError,
  IntelligenceValidationError,
  PIPELINE_STAGE_LABELS,
  PIPELINE_STAGE_ORDER,
  stageConfidenceAssessment,
  stageEvidenceCollection,
  stageGraphContext,
  stageIntelligenceResult,
  stageMemoryContext,
  stageReasoningTrace,
  stageRequest,
  stageTrustAssessment,
  type IntelligencePipelineStageId,
  type PipelineContext,
} from "@/lib/intelligence/engine";

export {
  DEFAULT_EVIDENCE_COLLECTOR_ID,
  DefaultEvidenceCollector,
  defaultEvidenceCollector,
  defaultEvidenceSourceRegistry,
  EVIDENCE_COLLECTOR_VERSION,
  EVIDENCE_RELEVANCE_MAX,
  EVIDENCE_RELEVANCE_MIN,
  EvidenceSourceRegistry,
  EvidenceValidationError,
  createDefaultEvidenceSourceRegistry,
  isEvidenceShape,
  isEvidenceSourceClass,
  isValidRelevanceScore,
  summarizeEvidenceItems,
  validateEvidenceCollectionShape,
  validateEvidenceShape,
  type EvidenceCollector,
  type EvidenceSourceAdapter,
} from "@/lib/intelligence/evidence";

export {
  CONFIDENCE_ASSESSOR_VERSION,
  CONFIDENCE_BAND_HIGH_MIN,
  CONFIDENCE_BAND_LABELS,
  CONFIDENCE_BAND_LOW_MIN,
  CONFIDENCE_BAND_MEDIUM_MIN,
  CONFIDENCE_BAND_VERIFIED_MIN,
  CONFIDENCE_BAND_VERY_LOW_MIN,
  CONFIDENCE_BANDS_DESCENDING,
  CONFIDENCE_FACTOR_WEIGHTS,
  DEFAULT_CONFIDENCE_ASSESSOR_ID,
  DefaultConfidenceAssessor,
  defaultConfidenceAssessor,
  clampConfidenceScore,
  computeCompositeConfidenceScore,
  isEvidenceConfidenceInsufficient,
  isInsufficientConfidenceBand,
  resolveConfidenceBand,
  type ConfidenceAssessor,
} from "@/lib/intelligence/confidence";

export {
  DEFAULT_TRUST_ASSESSOR_ID,
  DefaultTrustAssessor,
  TRUST_ASSESSOR_VERSION,
  TRUST_CAP_CONFIDENCE_DEGRADED,
  TRUST_CAP_NO_EVIDENCE,
  TRUST_CAP_NO_SOURCES_CONNECTED,
  TRUST_LEVEL_LABELS,
  TRUST_LEVEL_PERMISSIONS,
  defaultTrustAssessor,
  resolveTrustLevel,
  resolveTrustPermissions,
  type TrustAssessor,
} from "@/lib/intelligence/trust";

export {
  DEFAULT_GRAPH_CONTEXT_BUILDER_ID,
  DefaultGraphContextBuilder,
  GRAPH_CONTEXT_BUILDER_VERSION,
  GRAPH_SIGNAL_DEFINITIONS,
  defaultGraphContextBuilder,
  traverseGraphSkeleton,
  type GraphContextBuildResult,
  type GraphContextBuilder,
  type GraphSignal,
  type GraphSignalName,
  type GraphTraversalOptions,
  type GraphTraversalResult,
} from "@/lib/intelligence/graph";
