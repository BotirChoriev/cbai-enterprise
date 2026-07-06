/**
 * CBAI Pipeline Readiness — UI-facing type system.
 * Derived from existing pipeline, connector, and coverage layers — no fabricated metrics.
 */

import type { PipelineSupportedEntityType } from "@/lib/evidence-pipeline";

export const PIPELINE_READINESS_VERSION = "1.0.0" as const;

export type PipelineReadinessState = "ready" | "partial" | "planned" | "blocked";

export type PipelineStageReadiness = {
  stageId: string;
  label: string;
  order: number;
  state: PipelineReadinessState;
  description: string;
};

export type PipelineNormalizerReadiness = {
  normalizerId: string;
  label: string;
  standardReference: string;
  state: PipelineReadinessState;
};

export type PipelineValidationReadiness = {
  ruleId: string;
  label: string;
  description: string;
  state: PipelineReadinessState;
};

export type PipelineConnectorReadiness = {
  connectorId: string;
  connectorName: string;
  connectionLabel: "Connected" | "Evidence source planned" | "Evidence source not connected";
  pipelineCompatible: boolean;
};

export type PipelineReadinessModel = {
  version: typeof PIPELINE_READINESS_VERSION;
  pipelineId: string;
  pipelineName: string;
  currentStatus: PipelineReadinessState;
  stageCount: number;
  readyStages: readonly PipelineStageReadiness[];
  blockedStages: readonly PipelineStageReadiness[];
  plannedStages: readonly PipelineStageReadiness[];
  supportedConnectors: readonly string[];
  connectedConnectors: readonly PipelineConnectorReadiness[];
  plannedConnectors: readonly PipelineConnectorReadiness[];
  supportedEntities: readonly PipelineSupportedEntityType[];
  supportedIndicators: number;
  supportedReports: number;
  supportedWorkspaces: number;
  normalizers: readonly PipelineNormalizerReadiness[];
  validationRules: readonly PipelineValidationReadiness[];
  limitations: readonly string[];
  nextSteps: readonly string[];
};

export type ReportPipelineReadinessItem = {
  reportId: string;
  title: string;
  pipelineState: PipelineReadinessState;
  evidenceLabel: string;
  connectorDependency: string;
  exportLabel: string;
};

export type ReportPipelineReadinessModel = {
  version: typeof PIPELINE_READINESS_VERSION;
  pipelineId: string;
  pipelineName: string;
  currentStatus: PipelineReadinessState;
  reports: readonly ReportPipelineReadinessItem[];
  exportStatus: "Planned";
  limitations: readonly string[];
  nextSteps: readonly string[];
};

export type EntityPipelineReadinessModel = {
  version: typeof PIPELINE_READINESS_VERSION;
  entityType: PipelineSupportedEntityType;
  entityLabel: string;
  pipelineId: string;
  evidenceFlowStatus: PipelineReadinessState;
  connectedSourceCount: number;
  totalSourceCount: number;
  plannedConnectorCount: number;
  connectedConnectorCount: number;
  indicatorsConnected: number;
  indicatorsTotal: number;
  indicatorReadinessLabel: string;
  sourceReadinessLabel: string;
  limitations: readonly string[];
};
