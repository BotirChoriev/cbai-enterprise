/**
 * CBAI Pipeline Readiness — public API for UI integration.
 */

export {
  PIPELINE_READINESS_VERSION,
  type PipelineReadinessState,
  type PipelineStageReadiness,
  type PipelineNormalizerReadiness,
  type PipelineValidationReadiness,
  type PipelineConnectorReadiness,
  type PipelineReadinessModel,
  type ReportPipelineReadinessItem,
  type ReportPipelineReadinessModel,
  type EntityPipelineReadinessModel,
} from "@/lib/pipeline-readiness/pipeline-readiness.types";

export {
  buildPlatformPipelineReadiness,
  OFFICIAL_EVIDENCE_PIPELINE_ID,
} from "@/lib/pipeline-readiness/pipeline-readiness-builder";

export {
  buildReportPipelineReadiness,
  buildCountryPipelineReadiness,
  buildCompanyPipelineReadiness,
  buildUniversityPipelineReadiness,
} from "@/lib/pipeline-readiness/pipeline-readiness-summary";

export {
  pipelineReadinessStateLabel,
  pipelineReadinessStatusClass,
  getPlatformPipelineReadiness,
  getReportPipelineReadiness,
  getCountryPipelineReadiness,
  getCompanyPipelineReadiness,
  getUniversityPipelineReadiness,
} from "@/lib/pipeline-readiness/pipeline-readiness-query";
