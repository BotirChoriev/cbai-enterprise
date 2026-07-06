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
  ConfidenceQualityIntegrationContext,
  ConfidenceQualityIntegrationSummary,
} from "@/lib/intelligence/confidence/quality-integration";

export type {
  GraphContext,
  GraphContextMetadata,
  GraphContextStatus,
  IntelligenceGraphEdgeType,
  IntelligenceGraphPath,
  MemoryContext,
  MemoryContextMetadata,
  MemoryContextStatus,
  MemoryEntryCategory,
  MemoryEntryRef,
} from "@/lib/intelligence/context.types";

export type {
  IntelligenceEngine,
  IntelligenceRun,
  IntelligenceRunStatus,
} from "@/lib/intelligence/engine.types";

export type {
  ContradictionDetectionMetadata,
  ContradictionDetectionResult,
  ContradictionSeverity,
  ContradictionSummary,
  EvidenceContradiction,
} from "@/lib/intelligence/contradictions/types";

export type {
  EvidenceConflictMetadata,
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
  EvidenceCollectionQualitySummary,
  EvidenceQualityAssessment,
  EvidenceQualityBand,
  EvidenceQualityDimensionId,
  EvidenceQualityDimensionScore,
  EvidenceQualityDimensionStatus,
} from "@/lib/intelligence/evidence/quality/quality.types";

export type {
  EntityRef,
  IntelligenceRequest,
  IntelligenceType,
  QueryIntent,
} from "@/lib/intelligence/request.types";

export type {
  DiagnosticIssue,
  DiagnosticIssueSeverity,
  DiagnosticsLayerSnapshot,
  DiagnosticsMetadata,
  IntelligenceRunDiagnostics,
  RunHealth,
  StageHealth,
  StageHealthStatus,
} from "@/lib/intelligence/diagnostics/types";

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
  TraceVerificationSummary,
} from "@/lib/intelligence/trace.types";

export type {
  TrustGovernanceGate,
} from "@/lib/intelligence/trust/governance-rules";

export type {
  TrustQualityGate,
  TrustQualityIntegrationContext,
} from "@/lib/intelligence/trust/quality-integration";

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
  defaultEvidenceQualityAssessor,
  DefaultEvidenceQualityAssessor,
  DEFAULT_EVIDENCE_QUALITY_ASSESSOR_ID,
  EVIDENCE_QUALITY_ASSESSOR_VERSION,
  defaultEvidenceSourceRegistry,
  defaultEntityEvidenceMapper,
  defaultEntityResolver,
  deduplicateEvidenceItems,
  EVIDENCE_COLLECTOR_VERSION,
  EVIDENCE_RELEVANCE_MAX,
  EVIDENCE_RELEVANCE_MIN,
  ENTITY_PROFILE_ADAPTER_ID,
  ENTITY_PROFILE_ADAPTER_VERSION,
  EntityEvidenceMapper,
  EntityProfileEvidenceAdapter,
  EntityResolver,
  evaluateEvidenceSufficiency,
  EvidenceSourceRegistry,
  EvidenceValidationError,
  createDefaultEvidenceSourceRegistry,
  createEntityProfileEvidenceAdapter,
  createGraphEvidenceAdapter,
  createSearchEvidenceAdapter,
  createDocumentEvidenceAdapter,
  defaultDocumentEvidenceMapper,
  defaultDocumentResolver,
  DocumentEvidenceAdapter,
  DocumentEvidenceMapper,
  DocumentResolver,
  DOCUMENT_EVIDENCE_ADAPTER_ID,
  DOCUMENT_EVIDENCE_ADAPTER_VERSION,
  DOCUMENT_INGESTION_NOT_CONNECTED_MESSAGE,
  defaultGraphContextResolver,
  defaultGraphEvidenceMapper,
  defaultSearchEvidenceMapper,
  defaultSearchResolver,
  GraphContextResolver,
  GraphEvidenceAdapter,
  GraphEvidenceMapper,
  GRAPH_EVIDENCE_ADAPTER_ID,
  GRAPH_EVIDENCE_ADAPTER_VERSION,
  MAX_SEARCH_QUERY_MATCHES,
  SearchEvidenceAdapter,
  SearchEvidenceMapper,
  SearchResolver,
  SEARCH_EVIDENCE_ADAPTER_ID,
  SEARCH_EVIDENCE_ADAPTER_VERSION,
  isEvidenceShape,
  isEvidenceSourceClass,
  isSupportedEntityType,
  isValidRelevanceScore,
  MAX_EVIDENCE_ITEMS_PER_ENTITY,
  sortEvidenceByRelevance,
  summarizeEvidenceItems,
  SUPPORTED_ENTITY_TYPES,
  validateEvidenceCollectionShape,
  validateEvidenceShape,
  type EvidenceCollector,
  type EvidenceSourceAdapter,
  type EvidenceSourceAdapterCollectResult,
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
  applyQualityIntegrationAdjustments,
  buildEvidenceQualityFactor,
  computeMeanProvenanceScore,
  defaultConfidenceAssessor,
  extractQualityIntegrationContext,
  MAX_QUALITY_WARNING_PENALTY,
  QUALITY_UNKNOWN_FACTOR_SCORE,
  clampConfidenceScore,
  computeCompositeConfidenceScore,
  isEvidenceConfidenceInsufficient,
  isInsufficientConfidenceBand,
  resolveConfidenceBand,
  weightQualityForConfidence,
  type ConfidenceAssessor,
} from "@/lib/intelligence/confidence";

export {
  CONTRADICTION_DETECTOR_VERSION,
  DEFAULT_CONTRADICTION_DETECTOR_ID,
  DefaultContradictionDetector,
  applyContradictionDetectionToEvidence,
  defaultContradictionDetector,
  resolveContradictionState,
  runContradictionRules,
  type ContradictionDetector,
} from "@/lib/intelligence/contradictions";

export {
  CONTRADICTION_DETECTION_STAGE_ID,
  type ContradictionDetectionStageId,
} from "@/lib/intelligence/trace.types";

export {
  DEFAULT_TRUST_ASSESSOR_ID,
  DefaultTrustAssessor,
  TRUST_ASSESSOR_VERSION,
  applyGovernanceGates,
  applyQualityTrustAdjustments,
  buildGovernanceTrustReason,
  buildTrustQualityGate,
  extractTrustQualityContext,
  GOVERNANCE_MIN_EXECUTION_LEVEL,
  GOVERNANCE_MIN_RECOMMENDATION_LEVEL,
  TRUST_CAP_CONFIDENCE_DEGRADED,
  TRUST_CAP_LOW_QUALITY,
  TRUST_CAP_MISSING_FRESHNESS,
  TRUST_CAP_NO_EVIDENCE,
  TRUST_CAP_NO_SOURCES_CONNECTED,
  TRUST_CAP_QUALITY_UNKNOWN,
  TRUST_CAP_WEAK_PROVENANCE,
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

export {
  DEFAULT_MEMORY_CONTEXT_BUILDER_ID,
  DefaultMemoryContextBuilder,
  MEMORY_CATEGORY_DEFINITIONS,
  MEMORY_CONTEXT_BUILDER_VERSION,
  defaultMemoryContextBuilder,
  getMemoryCategoryIds,
  type MemoryCategory,
  type MemoryContextBuildResult,
  type MemoryContextBuilder,
  type MemoryQuery,
  type MemoryRecord,
  type MemoryStore,
  type MemoryStoreProvider,
  type MemoryStoreWriter,
} from "@/lib/intelligence/memory";

export {
  createTimelineEntry,
  DEFAULT_REASONING_TRACE_BUILDER_ID,
  DefaultReasoningTraceBuilder,
  defaultReasoningTraceBuilder,
  REASONING_TRACE_BUILDER_VERSION,
  sortTimelineEntries,
  TRACE_TIMELINE_STAGE_ORDER,
  verifyPipelineTrace,
  type PipelineTraceInput,
  type PipelineTraceVerificationInput,
  type ReasoningTraceBuilder,
  type StageTimelineEntry,
} from "@/lib/intelligence/trace";

export {
  DEFAULT_DIAGNOSTICS_BUILDER_ID,
  DIAGNOSTICS_BUILDER_VERSION,
  DefaultDiagnosticsBuilder,
  attachDiagnosticsToResult,
  defaultDiagnosticsBuilder,
  resolveRunHealth,
  type DiagnosticsBuilder,
  type DiagnosticsBuilderInput,
} from "@/lib/intelligence/diagnostics";

export {
  DEFAULT_RESULT_ASSEMBLER_ID,
  DefaultResultAssembler,
  defaultResultAssembler,
  defaultResultFormatter,
  defaultSummaryBuilder,
  EMPTY_EVIDENCE_EXECUTIVE_SUMMARY,
  RESULT_ASSEMBLER_VERSION,
  ResultFormatter,
  SummaryBuilder,
  buildFactualCaveats,
  buildFactualKeyFindings,
  buildIntelligenceSummary,
  isResultEvidenceInsufficient,
  resolveLifecycleState,
  resolveRelatedEntities,
} from "@/lib/intelligence/result";

export type {
  IntelligenceTestOutcome,
  IntelligenceTestReport,
  IntelligenceTestScenario,
  IntelligenceTestScenarioReport,
  IntelligenceTestValidationContext,
  IntelligenceTestValidationResult,
  IntelligenceTestValidator,
} from "@/lib/intelligence/testing/types";

export {
  DefaultIntelligenceTestHarness,
  INTELLIGENCE_TEST_HARNESS_VERSION,
  defaultIntelligenceTestHarness,
  runIntelligenceTestSuite,
  runIntelligenceTestSuiteSummary,
  type IntelligenceTestHarness,
} from "@/lib/intelligence/testing";

export type {
  OrchestrationSummary,
  OrchestratorRunOutcome,
  OrchestratorRunResult,
  OrchestratorStageId,
  OrchestratorStageStatus,
  ExecutionPlan,
  ExecutionPlanStage,
} from "@/lib/intelligence/orchestrator/types";

export {
  DEFAULT_INTELLIGENCE_ORCHESTRATOR_ID,
  DefaultIntelligenceOrchestrator,
  INTELLIGENCE_ORCHESTRATOR_VERSION,
  defaultIntelligenceOrchestrator,
  executeOrchestratedRun,
  buildExecutionPlan,
  DEFAULT_ORCHESTRATOR_POLICIES,
  type IntelligenceOrchestrator,
} from "@/lib/intelligence/orchestrator";

export {
  DEFAULT_INTELLIGENCE_RUNTIME_ID,
  DefaultIntelligenceRuntime,
  INTELLIGENCE_RUNTIME_VERSION,
  RuntimeSession,
  defaultIntelligenceRuntime,
  DEFAULT_RUNTIME_QUEUE_ID,
  DefaultRuntimeQueue,
  RUNTIME_QUEUE_VERSION,
  defaultRuntimeQueue,
  DEFAULT_RUNTIME_QUEUE_POLICY,
  DEFAULT_RUNTIME_SCHEDULER_ID,
  DefaultRuntimeScheduler,
  RUNTIME_SCHEDULER_VERSION,
  defaultRuntimeScheduler,
  DEFAULT_RUNTIME_SCHEDULER_POLICY,
  listReadyAt,
  type IntelligenceRuntime,
  type RuntimeQueue,
  type RuntimeScheduler,
} from "@/lib/intelligence/runtime";

export type {
  QueueDispatchMode,
  QueueEnqueueInput,
  QueueEnqueueResult,
  QueueItem,
  QueueItemStatus,
  RuntimeQueuePolicy,
  RuntimeQueueSnapshot,
} from "@/lib/intelligence/runtime/queue";

export type {
  RuntimeSchedulerPolicy,
  RuntimeSchedulerSnapshot,
  ScheduleInput,
  ScheduleItem,
  ScheduleItemStatus,
  ScheduleResult,
} from "@/lib/intelligence/runtime/scheduler";

export {
  DEFAULT_RUNTIME_POLICY_ENGINE_ID,
  DefaultPolicyEngine,
  RUNTIME_POLICY_ENGINE_VERSION,
  defaultPolicyEngine,
  evaluateRuntimePolicy,
  type PolicyEngine,
} from "@/lib/intelligence/runtime/policy";

export type {
  PolicyDecision,
  PolicyDecisionType,
  PolicyExecutionContext,
  PolicySeverity,
  RuntimePolicyEvaluationInput,
} from "@/lib/intelligence/runtime/policy";

export {
  DEFAULT_SESSION_REGISTRY_ID,
  DefaultSessionRegistry,
  RUNTIME_SESSION_REGISTRY_VERSION,
  defaultSessionRegistry,
  queryActiveSessions,
  queryByLifecycleStatus,
  queryByRequestId,
  queryBySessionId,
  queryCompletedSessions,
  queryFailedSessions,
  type SessionRegistry,
} from "@/lib/intelligence/runtime/registry";

export type {
  SessionRegisterResult,
  SessionRegistryEntry,
  SessionRegistrySnapshot,
  SessionUpdateResult,
} from "@/lib/intelligence/runtime/registry";

export type {
  RuntimeFailure,
  RuntimeLifecycleStatus,
  RuntimeState,
} from "@/lib/intelligence/runtime/runtime.types";

export type {
  FormattedIntelligenceResultSections,
  ResultAssembler,
  ResultAssemblerInput,
} from "@/lib/intelligence/result";

export {
  AGENT_REGISTRY_VERSION,
  AGENT_RUNTIME_CONTRACT_VERSION,
  AGENT_TASK_MODEL_VERSION,
  AGENT_TASK_STORE_VERSION,
  AGENT_DISPATCH_INTEGRATION_VERSION,
  AGENT_DISPATCH_VERSION,
  AGENT_EXECUTION_FOUNDATION_VERSION,
  AGENT_QUEUE_INTEGRATION_VERSION,
  LOCAL_RUNTIME_ADAPTER_VERSION,
  LOCAL_RUNTIME_EXECUTION_SUMMARY,
  DEFAULT_AGENT_REGISTRY_ID,
  DEFAULT_AGENT_DISPATCH_INTEGRATION_ID,
  DEFAULT_AGENT_DISPATCHER_ID,
  DEFAULT_AGENT_EXECUTION_COORDINATOR_ID,
  DEFAULT_AGENT_QUEUE_INTEGRATION_ID,
  DEFAULT_AGENT_TASK_STORE_ID,
  DefaultAgentRegistry,
  DefaultAgentDispatcher,
  DefaultAgentTaskStore,
  DefaultAgentDispatchIntegration,
  DefaultAgentExecutionCoordinator,
  DefaultAgentQueueIntegration,
  defaultAgentRegistry,
  defaultAgentDispatcher,
  defaultAgentTaskStore,
  defaultAgentDispatchIntegration,
  defaultAgentExecutionCoordinator,
  defaultAgentQueueIntegration,
  enqueueAgentTask,
  dequeueAgentTask,
  prepareAgentDispatch,
  buildAgentDispatchDiagnostics,
  isAgentDispatchReady,
  runAgentExecutionFoundation,
  runAgentExecutionPipeline,
  localRuntimeAdapter,
  isLocalRuntimeExecutionEnabled,
  formatAgentExecutionSummary,
  isTaskExecutionEligible,
  buildAgentTaskStoreSnapshot,
  queryByCapability,
  queryByCategory,
  queryByStatus,
  queryActiveAgentTasks,
  queryTasksByAgentId,
  queryTasksByPriority,
  queryTasksByRequestId,
  queryTasksByRuntimeSessionId,
  queryTasksByStatus,
  queryByTaskId,
  queryTerminalTasks,
  ALL_AGENT_CAPABILITIES,
  ALL_PROVIDER_KINDS,
  ALL_TASK_PRIORITIES,
  DEFAULT_DISPATCH_POLICY,
  STUB_AGENT_RUNTIME_CONTRACTS,
  StubAnthropicAgentBackend,
  StubGeminiAgentBackend,
  StubLocalAgentBackend,
  StubOpenAIAgentBackend,
  createAgentRequest,
  createAgentTask,
  createTaskRequest,
  listAgentRuntimeContracts,
  resolveAgentRuntimeContract,
  type AgentRegistry,
  type AgentRuntimeContract,
  type AgentDispatcher,
  type AgentDispatchIntegration,
  type AgentExecutionCoordinator,
  type AgentQueueIntegration,
  type AgentTaskStore,
} from "@/lib/intelligence/agents";

export type {
  AgentCapability,
  AgentContext,
  AgentDefinition,
  AgentRegisterInput,
  AgentRegisterResult,
  AgentRegistrySnapshot,
  AgentRequest,
  AgentResponse,
  AgentTask,
  AgentTaskDispatchMetadata,
  AgentTaskStoreSnapshot,
  AgentStatus,
  AgentUpdateInput,
  AgentUpdateResult,
  AgentDispatchDiagnostics,
  AgentDispatchPreparationResult,
  AgentDispatchValidationResult,
  AgentExecutionResult,
  AgentQueueDiagnostics,
  AgentQueueDequeueResult,
  AgentQueueEnqueueResult,
  DispatchPolicy,
  DispatchResult,
  ProviderKind,
  TaskPriority,
  TaskRequest,
  TaskResult,
  TaskStatus,
  TaskStoreAddResult,
  TaskStoreUpdateResult,
  ExecutionState,
  LocalExecutionType,
  LocalRuntimeExecutionDiagnostics,
  LocalRuntimeExecutionResult,
} from "@/lib/intelligence/agents";

