/**
 * BUILD-031 — Living Intelligence Graph projection from canonical relationships.
 */

import { loadLivingRelationships } from "@/lib/living-object-network/living-relationship-store";
import { resolveLivingObject } from "@/lib/living-object-network/living-object-resolver";
import type { LivingObjectReference, LivingRelationship } from "@/lib/living-object-network/living-object.types";
import type { KnowledgeTrustState } from "@/lib/knowledge-connectors/types";

export type LivingGraphNode = {
  readonly id: string;
  readonly reference: LivingObjectReference;
  readonly label: string;
  readonly objectType: LivingObjectReference["objectType"];
  readonly lifecycleState: string;
  readonly trustState: KnowledgeTrustState;
  readonly reviewState?: string | null;
  readonly provenanceAvailable: boolean;
  readonly contradictionCount: number;
  readonly limitationCount: number;
  readonly missionRelevance?: string | null;
  readonly accessState: "full" | "limited";
};

export type LivingGraphEdge = {
  readonly id: string;
  readonly relationshipId: string;
  readonly sourceNodeId: string;
  readonly targetNodeId: string;
  readonly relationshipType: LivingRelationship["relationshipType"];
  readonly status: LivingRelationship["status"];
  readonly evidenceCount: number;
  readonly contradictionCount: number;
  readonly provenanceAvailable: boolean;
};

export type LivingGraphProjection = {
  readonly nodes: readonly LivingGraphNode[];
  readonly edges: readonly LivingGraphEdge[];
  readonly emptyReason: string | null;
  readonly projectionMs: number;
  readonly filteredUnauthorizedCount: number;
};

function nodeId(ref: LivingObjectReference): string {
  return `${ref.objectType}:${ref.objectId}`;
}

const DEFAULT_MAX_NODES = 250;
const DEFAULT_MAX_EDGES = 500;

export function buildLivingGraphProjection(input: {
  readonly focusObject?: LivingObjectReference | null;
  readonly missionId?: string | null;
  readonly organizationId?: string | null;
  readonly collaborationId?: string | null;
  readonly depth?: number;
  readonly actorId: string | null;
  readonly includeArchived?: boolean;
  readonly maxNodes?: number;
  readonly maxEdges?: number;
}): LivingGraphProjection {
  const start = performance.now();
  const depth = Math.min(input.depth ?? 2, 4);
  const maxNodes = input.maxNodes ?? DEFAULT_MAX_NODES;
  const maxEdges = input.maxEdges ?? DEFAULT_MAX_EDGES;

  let relationships = loadLivingRelationships({
    missionId: input.missionId ?? undefined,
    organizationId: input.organizationId ?? undefined,
    includeArchived: input.includeArchived,
  });

  if (input.collaborationId) {
    relationships = relationships.filter((r) => r.collaborationId === input.collaborationId);
  }

  const nodeMap = new Map<string, LivingGraphNode>();
  const edges: LivingGraphEdge[] = [];
  let filteredUnauthorizedCount = 0;

  function addNode(ref: LivingObjectReference): boolean {
    if (nodeMap.size >= maxNodes) return false;
    const id = nodeId(ref);
    if (nodeMap.has(id)) return true;
    const resolved = resolveLivingObject(ref, input.actorId);
    if (!resolved.ok) {
      filteredUnauthorizedCount += 1;
      return false;
    }
    if (resolved.object.accessDenied) {
      filteredUnauthorizedCount += 1;
      return false;
    }
    nodeMap.set(id, {
      id,
      reference: ref,
      label: resolved.object.label,
      objectType: ref.objectType,
      lifecycleState: resolved.object.lifecycleState,
      trustState: resolved.object.trustState,
      provenanceAvailable: resolved.object.provenanceAvailable,
      contradictionCount: resolved.relationships.filter((r) => r.status === "contradicted").length,
      limitationCount: resolved.object.limitations.length,
      missionRelevance: resolved.object.missionRelevance,
      accessState: "full",
    });
    return true;
  }

  for (const rel of relationships) {
    if (edges.length >= maxEdges) break;
    const sourceOk = addNode(rel.source);
    const targetOk = addNode(rel.target);
    if (!sourceOk || !targetOk) {
      filteredUnauthorizedCount += 1;
      continue;
    }
    edges.push({
      id: rel.id,
      relationshipId: rel.id,
      sourceNodeId: nodeId(rel.source),
      targetNodeId: nodeId(rel.target),
      relationshipType: rel.relationshipType,
      status: rel.status,
      evidenceCount: rel.supportingEvidenceIds.length,
      contradictionCount: rel.contradictingEvidenceIds.length,
      provenanceAvailable: rel.provenance.length > 0 || rel.provenanceKind === "system_derived",
    });
  }

  if (input.focusObject && depth >= 1) {
    addNode(input.focusObject);
  }

  const nodes = [...nodeMap.values()];
  let emptyReason: string | null = null;
  if (nodes.length === 0) {
    emptyReason = input.missionId
      ? "Mission has no canonical relationships yet."
      : "No mission selected — link sources and evidence to build the graph.";
  }

  return {
    nodes,
    edges,
    emptyReason,
    projectionMs: performance.now() - start,
    filteredUnauthorizedCount,
  };
}
