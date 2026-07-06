import type { PipelineStatus } from "@/lib/evidence-pipeline/pipeline-status";
import type {
  EvidencePipelineDefinition,
  EvidencePipelineRegistry,
  EvidencePipelineRegistryIndex,
  PipelineId,
} from "@/lib/evidence-pipeline/pipeline-types";
import { buildEvidencePipelineRegistry } from "@/lib/evidence-pipeline/pipeline-builder";

function groupByStatus(
  pipelines: readonly EvidencePipelineDefinition[],
): ReadonlyMap<PipelineStatus, readonly EvidencePipelineDefinition[]> {
  const map = new Map<PipelineStatus, EvidencePipelineDefinition[]>();

  for (const pipeline of pipelines) {
    const list = map.get(pipeline.status) ?? [];
    list.push(pipeline);
    map.set(pipeline.status, list);
  }

  return map;
}

function groupByConnector(
  pipelines: readonly EvidencePipelineDefinition[],
): ReadonlyMap<string, readonly EvidencePipelineDefinition[]> {
  const map = new Map<string, EvidencePipelineDefinition[]>();

  for (const pipeline of pipelines) {
    for (const connectorId of pipeline.supportedConnectors) {
      const list = map.get(connectorId) ?? [];
      list.push(pipeline);
      map.set(connectorId, list);
    }
  }

  return map;
}

function buildEvidencePipelineRegistryIndex(
  registry: EvidencePipelineRegistry,
): EvidencePipelineRegistryIndex {
  const byId = new Map<PipelineId, EvidencePipelineDefinition>();

  for (const pipeline of registry.pipelines) {
    byId.set(pipeline.pipelineId, pipeline);
  }

  return {
    byId,
    byStatus: groupByStatus(registry.pipelines),
    byConnector: groupByConnector(registry.pipelines),
  };
}

let cachedRegistry: EvidencePipelineRegistry | null = null;
let cachedIndex: EvidencePipelineRegistryIndex | null = null;

/** Unified CBAI evidence pipeline registry — definitions only. */
export function getEvidencePipelineRegistry(): EvidencePipelineRegistry {
  if (!cachedRegistry) {
    cachedRegistry = buildEvidencePipelineRegistry();
  }
  return cachedRegistry;
}

/** Indexed pipeline registry views for fast lookup. */
export function getEvidencePipelineRegistryIndex(): EvidencePipelineRegistryIndex {
  if (!cachedIndex) {
    cachedIndex = buildEvidencePipelineRegistryIndex(getEvidencePipelineRegistry());
  }
  return cachedIndex;
}

/** Force rebuild — for tests and future migration hooks. */
export function rebuildEvidencePipelineRegistry(): EvidencePipelineRegistry {
  cachedRegistry = buildEvidencePipelineRegistry();
  cachedIndex = buildEvidencePipelineRegistryIndex(cachedRegistry);
  return cachedRegistry;
}

export function getAllPipelines(): readonly EvidencePipelineDefinition[] {
  return getEvidencePipelineRegistry().pipelines;
}

export function getPipelineCount(): number {
  return getEvidencePipelineRegistry().pipelineCount;
}

export type { EvidencePipelineRegistryIndex };
