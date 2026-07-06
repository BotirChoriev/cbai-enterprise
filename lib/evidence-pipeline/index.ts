/**
 * CBAI Evidence Pipeline Architecture — public API.
 * Definitions only — no runtime, HTTP, fetch, database, or external APIs.
 */

export {
  EVIDENCE_PIPELINE_VERSION,
  EVIDENCE_PIPELINE_VERSION_INFO,
  PIPELINE_MIGRATION_MANIFEST,
  PIPELINE_LIFECYCLE_STAGES,
  type EvidencePipelineVersionInfo,
  type PipelineMigrationEntry,
  type PipelineLifecycleStage,
} from "@/lib/evidence-pipeline/pipeline-version";

export {
  PIPELINE_STATUSES,
  PIPELINE_STATUS_DEFINITIONS,
  isPipelineStatus,
  isProcessablePipelineStatus,
  type PipelineStatus,
  type PipelineStatusDefinition,
} from "@/lib/evidence-pipeline/pipeline-status";

export {
  PIPELINE_RECORD_VERSION,
  PIPELINE_VALIDATION_RULES,
  PIPELINE_SUPPORTED_ENTITY_TYPES,
  PIPELINE_STAGE_IDS,
  type PipelineId,
  type PipelineStageId,
  type PipelineSupportedEntityType,
  type PipelineValidationRule,
  type EvidencePipelineDefinition,
  type EvidencePipelineRegistry,
  type EvidencePipelineRegistryIndex,
  type PipelineValidationIssueCode,
  type PipelineValidationIssue,
  type PipelineValidationReport,
  type PipelineFlowPosition,
  type PipelineFlowTrace,
  type PipelineCompatibilityContext,
  type PipelineCompatibilityResult,
} from "@/lib/evidence-pipeline/pipeline-types";

export {
  PIPELINE_STAGES,
  NORMALIZATION_CONTRACTS,
  getPipelineStageById,
  getOrderedPipelineStages,
  getNormalizationContractByKind,
  getRequiredNormalizerIds,
  type PipelineStageDefinition,
  type NormalizationContractKind,
  type NormalizationContract,
} from "@/lib/evidence-pipeline/pipeline-stage";

export {
  PIPELINE_ID_PATTERN,
  OFFICIAL_EVIDENCE_PIPELINE_ID,
  buildPipelineId,
  parsePipelineId,
  isValidPipelineIdFormat,
  buildOfficialEvidencePipeline,
  buildEvidencePipelineRegistry,
  isKnownPipelineIndicator,
  getPipelineStageCount,
} from "@/lib/evidence-pipeline/pipeline-builder";

export {
  getNextPipelineStage,
  getPreviousPipelineStage,
  describePipelineFlowPosition,
  tracePipelineFlow,
  listPipelineStageTransitions,
  summarizePipelineFlow,
} from "@/lib/evidence-pipeline/pipeline-flow";

export {
  getEvidencePipelineRegistry,
  getEvidencePipelineRegistryIndex,
  rebuildEvidencePipelineRegistry,
  getAllPipelines,
  getPipelineCount,
} from "@/lib/evidence-pipeline/pipeline-registry";

export {
  findPipelineById,
  findPipelineByIdString,
  getOfficialEvidencePipeline,
  findPipelinesByStatus,
  findPipelinesByConnector,
  isConnectorOnOfficialPipeline,
  listActivePipelineStatuses,
} from "@/lib/evidence-pipeline/pipeline-query";

export {
  validateEvidencePipelineRegistry,
  assertEvidencePipelineRegistryValid,
  evaluatePipelineCompatibility,
  summarizePipelineValidationReport,
} from "@/lib/evidence-pipeline/pipeline-validation";
