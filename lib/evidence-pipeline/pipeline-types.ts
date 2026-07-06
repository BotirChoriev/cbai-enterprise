/**
 * CBAI Evidence Pipeline Architecture — core type system.
 * Pipeline definitions only — no runtime, HTTP, fetch, database, or external APIs.
 */

import type { PipelineStatus } from "@/lib/evidence-pipeline/pipeline-status";

export const PIPELINE_RECORD_VERSION = "1.0.0" as const;

/** Branded permanent pipeline identifier — format `pipeline-{slug}`. */
export type PipelineId = string & { readonly __brand: "PipelineId" };

/** Canonical processing stage identifiers in execution order. */
export type PipelineStageId =
  | "connector"
  | "schema-validation"
  | "normalization"
  | "evidence-record"
  | "evidence-registry"
  | "indicator-resolution"
  | "entity-resolution"
  | "mission-availability"
  | "report-readiness"
  | "workspace-availability";

export type PipelineSupportedEntityType = "country" | "company" | "university";

export type PipelineValidationRule = {
  id: string;
  label: string;
  description: string;
  enforcedAtStages: readonly PipelineStageId[];
  severity: "error" | "warning";
};

export type EvidencePipelineDefinition = {
  pipelineId: PipelineId;
  pipelineName: string;
  /** Default entry stage — always connector. */
  currentStage: PipelineStageId;
  supportedConnectors: readonly string[];
  supportedEntities: readonly PipelineSupportedEntityType[];
  supportedIndicators: readonly string[];
  supportedReports: readonly string[];
  supportedWorkspaces: readonly string[];
  requiredNormalizers: readonly string[];
  validationRules: readonly PipelineValidationRule[];
  status: PipelineStatus;
  version: typeof PIPELINE_RECORD_VERSION;
};

export type EvidencePipelineRegistry = {
  version: string;
  pipelineRecordVersion: typeof PIPELINE_RECORD_VERSION;
  builtAt: string;
  pipelines: readonly EvidencePipelineDefinition[];
  pipelineCount: number;
  byStatus: Readonly<Partial<Record<PipelineStatus, number>>>;
};

export type EvidencePipelineRegistryIndex = {
  byId: ReadonlyMap<PipelineId, EvidencePipelineDefinition>;
  byStatus: ReadonlyMap<PipelineStatus, readonly EvidencePipelineDefinition[]>;
  byConnector: ReadonlyMap<string, readonly EvidencePipelineDefinition[]>;
};

export type PipelineValidationIssueCode =
  | "duplicate_pipeline_id"
  | "invalid_pipeline_id_format"
  | "unknown_stage"
  | "unknown_connector"
  | "unknown_indicator"
  | "unknown_report"
  | "unknown_workspace"
  | "missing_normalizer"
  | "invalid_status"
  | "broken_stage_order";

export type PipelineValidationIssue = {
  code: PipelineValidationIssueCode;
  severity: "error" | "warning";
  message: string;
  pipelineId?: PipelineId;
  reference?: string;
};

export type PipelineValidationReport = {
  valid: boolean;
  issueCount: number;
  errors: readonly PipelineValidationIssue[];
  warnings: readonly PipelineValidationIssue[];
};

/** Declarative flow position — describes evidence movement, not execution. */
export type PipelineFlowPosition = {
  pipelineId: PipelineId;
  stageId: PipelineStageId;
  stageOrder: number;
  stageLabel: string;
  pendingValidationRules: readonly string[];
  pendingNormalizers: readonly string[];
};

export type PipelineFlowTrace = {
  pipelineId: PipelineId;
  connectorId: string;
  stages: readonly PipelineFlowPosition[];
  totalStages: number;
  description: string;
};

/** Context snapshot for compatibility validation — no live data. */
export type PipelineCompatibilityContext = {
  connectorId: string;
  entityType: PipelineSupportedEntityType;
  indicatorId: string;
  evidenceSourceId: string;
  countryCode?: string;
  missionId?: string;
  workspaceId?: string;
  reportId?: string;
};

export type PipelineCompatibilityResult = {
  compatible: boolean;
  passedRules: readonly string[];
  failedRules: readonly string[];
  warnings: readonly string[];
};

export const PIPELINE_VALIDATION_RULES: readonly PipelineValidationRule[] = [
  {
    id: "connector_registered",
    label: "Connector Registered",
    description: "Connector must exist in Official Evidence Connector registry.",
    enforcedAtStages: ["connector"],
    severity: "error",
  },
  {
    id: "schema_valid",
    label: "Schema Valid",
    description: "Incoming record must conform to connector readiness schema contract.",
    enforcedAtStages: ["schema-validation"],
    severity: "error",
  },
  {
    id: "required_fields_present",
    label: "Required Fields Present",
    description: "All connector-required fields must be present before normalization.",
    enforcedAtStages: ["schema-validation"],
    severity: "error",
  },
  {
    id: "country_exists",
    label: "Country Exists",
    description: "Country code must resolve to Global Registry or local country catalog.",
    enforcedAtStages: ["entity-resolution"],
    severity: "error",
  },
  {
    id: "indicator_mapped",
    label: "Indicator Mapped",
    description: "Evidence must resolve to a Global Indicator Framework indicator ID.",
    enforcedAtStages: ["indicator-resolution"],
    severity: "error",
  },
  {
    id: "evidence_source_registered",
    label: "Evidence Source Registered",
    description: "Source must exist in Evidence Infrastructure source registry.",
    enforcedAtStages: ["evidence-record"],
    severity: "error",
  },
  {
    id: "mission_compatibility",
    label: "Mission Compatibility",
    description: "Resolved evidence must satisfy mission required indicators and sources.",
    enforcedAtStages: ["mission-availability"],
    severity: "warning",
  },
  {
    id: "workspace_compatibility",
    label: "Workspace Compatibility",
    description: "Resolved context must be available in target intelligence workspace.",
    enforcedAtStages: ["workspace-availability"],
    severity: "warning",
  },
] as const;

export const PIPELINE_SUPPORTED_ENTITY_TYPES: readonly PipelineSupportedEntityType[] = [
  "country",
  "company",
  "university",
] as const;

export const PIPELINE_STAGE_IDS: readonly PipelineStageId[] = [
  "connector",
  "schema-validation",
  "normalization",
  "evidence-record",
  "evidence-registry",
  "indicator-resolution",
  "entity-resolution",
  "mission-availability",
  "report-readiness",
  "workspace-availability",
] as const;
