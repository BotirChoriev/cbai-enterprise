import {
  OFFICIAL_EVIDENCE_PIPELINE_ID,
} from "@/lib/evidence-pipeline/pipeline-builder";
import type { PipelineStatus } from "@/lib/evidence-pipeline/pipeline-status";
import type {
  EvidencePipelineDefinition,
  PipelineId,
} from "@/lib/evidence-pipeline/pipeline-types";
import {
  getEvidencePipelineRegistry,
  getEvidencePipelineRegistryIndex,
} from "@/lib/evidence-pipeline/pipeline-registry";
import { parsePipelineId } from "@/lib/evidence-pipeline/pipeline-builder";

/** Find a pipeline by permanent ID. */
export function findPipelineById(pipelineId: PipelineId): EvidencePipelineDefinition | undefined {
  return getEvidencePipelineRegistryIndex().byId.get(pipelineId);
}

/** Find a pipeline by ID string with format validation. */
export function findPipelineByIdString(
  pipelineId: string,
): EvidencePipelineDefinition | undefined {
  if (!parsePipelineId(pipelineId)) return undefined;
  return findPipelineById(pipelineId as PipelineId);
}

/** Get the unified official evidence pipeline — all connectors must use this. */
export function getOfficialEvidencePipeline(): EvidencePipelineDefinition {
  const pipeline = findPipelineById(OFFICIAL_EVIDENCE_PIPELINE_ID);
  if (!pipeline) {
    throw new Error("Official evidence pipeline not found in registry.");
  }
  return pipeline;
}

/** Find pipelines by lifecycle status. */
export function findPipelinesByStatus(
  status: PipelineStatus,
): readonly EvidencePipelineDefinition[] {
  return getEvidencePipelineRegistryIndex().byStatus.get(status) ?? [];
}

/** Find pipelines that support a given connector ID. */
export function findPipelinesByConnector(
  connectorId: string,
): readonly EvidencePipelineDefinition[] {
  return getEvidencePipelineRegistryIndex().byConnector.get(connectorId) ?? [];
}

/** Check whether a connector is registered on the official evidence pipeline. */
export function isConnectorOnOfficialPipeline(connectorId: string): boolean {
  return getOfficialEvidencePipeline().supportedConnectors.includes(connectorId);
}

/** List pipeline statuses present in the registry. */
export function listActivePipelineStatuses(): readonly PipelineStatus[] {
  const statuses = new Set<PipelineStatus>();
  for (const pipeline of getEvidencePipelineRegistry().pipelines) {
    statuses.add(pipeline.status);
  }
  return [...statuses];
}
