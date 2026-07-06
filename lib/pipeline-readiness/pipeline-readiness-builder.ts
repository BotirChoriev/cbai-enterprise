import { getAllConnectors } from "@/lib/connectors";
import { OFFICIAL_EVIDENCE_SOURCES } from "@/lib/evidence-infrastructure/sources/catalog";
import { NORMALIZER_CATALOG } from "@/lib/evidence-infrastructure/normalizers/catalog";
import {
  getOfficialEvidencePipeline,
  getOrderedPipelineStages,
  NORMALIZATION_CONTRACTS,
  PIPELINE_VALIDATION_RULES,
} from "@/lib/evidence-pipeline";
import { OFFICIAL_EVIDENCE_PIPELINE_ID } from "@/lib/evidence-pipeline/pipeline-builder";
import type {
  PipelineConnectorReadiness,
  PipelineNormalizerReadiness,
  PipelineReadinessModel,
  PipelineReadinessState,
  PipelineStageReadiness,
  PipelineValidationReadiness,
} from "@/lib/pipeline-readiness/pipeline-readiness.types";
import { PIPELINE_READINESS_VERSION } from "@/lib/pipeline-readiness/pipeline-readiness.types";

const KNOWN_NORMALIZER_IDS = new Set(NORMALIZER_CATALOG.map((entry) => entry.id));

function connectorConnectionLabel(
  status: string,
): PipelineConnectorReadiness["connectionLabel"] {
  if (status === "connected") return "Connected";
  if (status === "planned" || status === "ready") return "Evidence source planned";
  return "Evidence source not connected";
}

function resolveStageState(stageId: string): PipelineReadinessState {
  switch (stageId) {
    case "connector":
    case "schema-validation":
      return "ready";
    case "normalization":
      return "partial";
    case "indicator-resolution":
    case "entity-resolution":
      return "partial";
    default:
      return "planned";
  }
}

function buildStageReadiness(): PipelineStageReadiness[] {
  return getOrderedPipelineStages().map((stage) => ({
    stageId: stage.id,
    label: stage.label,
    order: stage.order,
    state: resolveStageState(stage.id),
    description: stage.description,
  }));
}

function buildNormalizerReadiness(): PipelineNormalizerReadiness[] {
  return NORMALIZATION_CONTRACTS.map((contract) => ({
    normalizerId: contract.normalizerId,
    label: contract.label,
    standardReference: contract.standardReference,
    state: KNOWN_NORMALIZER_IDS.has(contract.normalizerId) ? "ready" : "planned",
  }));
}

function buildValidationReadiness(): PipelineValidationReadiness[] {
  return PIPELINE_VALIDATION_RULES.map((rule) => ({
    ruleId: rule.id,
    label: rule.label,
    description: rule.description,
    state: "ready" as PipelineReadinessState,
  }));
}

function buildConnectorReadiness(): PipelineConnectorReadiness[] {
  return getAllConnectors().map((connector) => ({
    connectorId: connector.connectorId,
    connectorName: connector.connectorName,
    connectionLabel: connectorConnectionLabel(connector.status),
    pipelineCompatible: true,
  }));
}

function resolveOverallStatus(
  stages: readonly PipelineStageReadiness[],
): PipelineReadinessState {
  if (stages.some((stage) => stage.state === "blocked")) return "blocked";
  const readyCount = stages.filter((stage) => stage.state === "ready").length;
  const partialCount = stages.filter((stage) => stage.state === "partial").length;
  if (readyCount === stages.length) return "ready";
  if (readyCount > 0 || partialCount > 0) return "partial";
  return "planned";
}

/** Build platform-wide pipeline readiness for Evidence Explorer. */
export function buildPlatformPipelineReadiness(): PipelineReadinessModel {
  const pipeline = getOfficialEvidencePipeline();
  const stages = buildStageReadiness();
  const connectors = buildConnectorReadiness();
  const connectedSources = OFFICIAL_EVIDENCE_SOURCES.filter(
    (source) => source.connectionStatus === "connected",
  ).length;

  const limitations = [
    "Evidence flow architecture is defined — live processing is not active.",
    "Only CBAI Local Registry is connected; official connectors remain planned.",
    "No progress percentages or fabricated readiness scores are shown.",
    `${connectedSources} of ${OFFICIAL_EVIDENCE_SOURCES.length} evidence sources connected.`,
  ] as const;

  const nextSteps = [
    "Complete connector readiness layers for World Bank and UN / human-rights sources.",
    "Bind runtime stage executors when authorized — outside current static export.",
    "Attach verified evidence records after source connection and validation.",
    "Surface report and workspace availability only when evidence criteria are met.",
  ] as const;

  return {
    version: PIPELINE_READINESS_VERSION,
    pipelineId: pipeline.pipelineId,
    pipelineName: pipeline.pipelineName,
    currentStatus: resolveOverallStatus(stages),
    stageCount: stages.length,
    readyStages: stages.filter((stage) => stage.state === "ready"),
    blockedStages: stages.filter((stage) => stage.state === "blocked"),
    plannedStages: stages.filter(
      (stage) => stage.state === "planned" || stage.state === "partial",
    ),
    supportedConnectors: pipeline.supportedConnectors,
    connectedConnectors: connectors.filter(
      (connector) => connector.connectionLabel === "Connected",
    ),
    plannedConnectors: connectors.filter(
      (connector) => connector.connectionLabel !== "Connected",
    ),
    supportedEntities: pipeline.supportedEntities,
    supportedIndicators: pipeline.supportedIndicators.length,
    supportedReports: pipeline.supportedReports.length,
    supportedWorkspaces: pipeline.supportedWorkspaces.length,
    normalizers: buildNormalizerReadiness(),
    validationRules: buildValidationReadiness(),
    limitations: [...limitations],
    nextSteps: [...nextSteps],
  };
}

export { OFFICIAL_EVIDENCE_PIPELINE_ID };
