import type { Entity } from "@/lib/entity/entity.types";
import type { GraphEdge, GraphNode } from "@/lib/graph/graph.types";
import { GRAPH_EVIDENCE_LABELS } from "@/lib/graph/graph-platform";

export type EntityGraphEvidenceSummary = {
  evidenceStatus: string;
  relationshipCount: number;
  availableSources: string[];
  availableInformation: string;
  futureEvidence: string;
};

export function resolveEntityEvidenceStatus(entity: Entity): string {
  if (entity.type === "country" || entity.type === "company") {
    return GRAPH_EVIDENCE_LABELS.registryAvailable;
  }

  if (entity.type === "university") {
    return entity.aiSummary === GRAPH_EVIDENCE_LABELS.insufficientEvidence
      ? GRAPH_EVIDENCE_LABELS.registryAvailable
      : GRAPH_EVIDENCE_LABELS.registryAvailable;
  }

  return GRAPH_EVIDENCE_LABELS.evidenceUnavailable;
}

export function resolveAvailableSources(entity: Entity): string[] {
  const sources = ["Local platform registry"];

  if (entity.type === "country") {
    sources.push("Country adapter");
  }
  if (entity.type === "company") {
    sources.push("Company adapter");
  }
  if (entity.type === "university") {
    sources.push("University adapter");
  }

  return sources;
}

export function buildEntityGraphEvidenceSummary(
  node: GraphNode,
  connectedEdges: GraphEdge[],
): EntityGraphEvidenceSummary {
  const entity = node.entity;
  const relationshipCount = connectedEdges.length;

  return {
    evidenceStatus: resolveEntityEvidenceStatus(entity),
    relationshipCount,
    availableSources: resolveAvailableSources(entity),
    availableInformation: entity.overview,
    futureEvidence:
      "Partnership verification, collaboration contracts, and extended neighbor types require connected evidence sources.",
  };
}

export function formatEdgeEvidenceStatus(
  status: GraphEdge["evidenceStatus"],
): string {
  return status === "evidence_available"
    ? "Evidence Available"
    : "Evidence Missing";
}
