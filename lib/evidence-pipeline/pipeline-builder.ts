import { getAllConnectors } from "@/lib/connectors";
import { getIndicatorById } from "@/lib/indicator-framework";
import { GLOBAL_INDICATOR_REGISTRY } from "@/lib/indicator-framework/registry";
import {
  getRequiredNormalizerIds,
  PIPELINE_STAGES,
} from "@/lib/evidence-pipeline/pipeline-stage";
import type {
  EvidencePipelineDefinition,
  EvidencePipelineRegistry,
  PipelineId,
} from "@/lib/evidence-pipeline/pipeline-types";
import {
  PIPELINE_RECORD_VERSION,
  PIPELINE_VALIDATION_RULES,
} from "@/lib/evidence-pipeline/pipeline-types";
import { EVIDENCE_PIPELINE_VERSION } from "@/lib/evidence-pipeline/pipeline-version";
import { REPORT_TYPE_IDS, WORKSPACE_IDS } from "@/lib/registry";

export const PIPELINE_ID_PATTERN = /^pipeline-([a-z0-9-]+)$/;

export const OFFICIAL_EVIDENCE_PIPELINE_ID = "pipeline-official-evidence-v1" as PipelineId;

/** Build a permanent pipeline ID from stable slug — never random. */
export function buildPipelineId(slug: string): PipelineId {
  return `pipeline-${slug}` as PipelineId;
}

export function parsePipelineId(pipelineId: string): { slug: string } | null {
  const match = PIPELINE_ID_PATTERN.exec(pipelineId);
  if (!match) return null;
  return { slug: match[1] };
}

export function isValidPipelineIdFormat(pipelineId: string): boolean {
  return PIPELINE_ID_PATTERN.test(pipelineId);
}

function resolveSupportedConnectors(): string[] {
  return getAllConnectors().map((connector) => connector.connectorId);
}

function resolveSupportedIndicators(): string[] {
  return GLOBAL_INDICATOR_REGISTRY.indicators.map((indicator) => indicator.id);
}

function resolveSupportedReports(): string[] {
  return Object.values(REPORT_TYPE_IDS);
}

function resolveSupportedWorkspaces(): string[] {
  return Object.values(WORKSPACE_IDS);
}

/** Build the unified official evidence pipeline definition. */
export function buildOfficialEvidencePipeline(): EvidencePipelineDefinition {
  return {
    pipelineId: OFFICIAL_EVIDENCE_PIPELINE_ID,
    pipelineName: "CBAI Official Evidence Pipeline",
    currentStage: "connector",
    supportedConnectors: resolveSupportedConnectors(),
    supportedEntities: ["country", "company", "university"],
    supportedIndicators: resolveSupportedIndicators(),
    supportedReports: resolveSupportedReports(),
    supportedWorkspaces: resolveSupportedWorkspaces(),
    requiredNormalizers: getRequiredNormalizerIds(),
    validationRules: PIPELINE_VALIDATION_RULES,
    status: "ready",
    version: PIPELINE_RECORD_VERSION,
  };
}

/** Build the full evidence pipeline registry. */
export function buildEvidencePipelineRegistry(): EvidencePipelineRegistry {
  const pipelines = [buildOfficialEvidencePipeline()];

  const byStatus: Partial<Record<EvidencePipelineDefinition["status"], number>> = {};
  for (const pipeline of pipelines) {
    byStatus[pipeline.status] = (byStatus[pipeline.status] ?? 0) + 1;
  }

  return {
    version: EVIDENCE_PIPELINE_VERSION,
    pipelineRecordVersion: PIPELINE_RECORD_VERSION,
    builtAt: new Date().toISOString(),
    pipelines,
    pipelineCount: pipelines.length,
    byStatus,
  };
}

/** Verify an indicator ID is known to the Global Indicator Framework. */
export function isKnownPipelineIndicator(indicatorId: string): boolean {
  return getIndicatorById(indicatorId) !== undefined;
}

/** Stage count for flow documentation. */
export function getPipelineStageCount(): number {
  return PIPELINE_STAGES.length;
}
