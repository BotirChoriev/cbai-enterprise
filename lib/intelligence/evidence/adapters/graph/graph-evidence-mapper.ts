import type { Evidence } from "@/lib/intelligence/evidence.types";
import {
  GRAPH_EVIDENCE_CATEGORY_LABELS,
  GRAPH_EVIDENCE_SOURCE_CLASS,
  type GraphContextResolution,
  type GraphEvidenceCategory,
  type GraphEvidenceDraft,
  type GraphEvidenceMapperOptions,
  type GraphResolvedEdge,
  type GraphResolvedNeighbor,
} from "@/lib/intelligence/evidence/adapters/graph/types";

const SOURCE_LABEL = "CBAI Knowledge Graph";

/** Relevance scores by category — deterministic, conservative. */
const CATEGORY_RELEVANCE: Record<GraphEvidenceCategory, number> = {
  relationship: 72,
  location: 68,
  research: 70,
  industry: 65,
  investment: 70,
  neighbor: 60,
};

/**
 * Deterministic mapper from resolved graph context to {@link Evidence} items.
 *
 * Never invents graph links — only maps edges and neighbors observed in resolution.
 */
export class GraphEvidenceMapper {
  /**
   * Map resolved graph context to evidence items.
   */
  mapContext(
    context: GraphContextResolution,
    options: GraphEvidenceMapperOptions,
  ): Evidence[] {
    const edgeDrafts = context.connectedEdges.map((edge) =>
      this.mapEdge(edge, context.seedNodeIds),
    );
    const neighborDrafts = this.mapNeighbors(context.neighbors, context.connectedEdges);

    const drafts = [...edgeDrafts, ...neighborDrafts].sort(compareDrafts);

    return drafts.map((draft) => this.toEvidence(draft, options.retrievedAt));
  }

  private mapEdge(
    edge: GraphResolvedEdge,
    seedNodeIds: string[],
  ): GraphEvidenceDraft {
    const primary =
      seedNodeIds.includes(edge.source.nodeId) ? edge.source : edge.target;
    const secondary = primary.nodeId === edge.source.nodeId ? edge.target : edge.source;

    return {
      id: `graph:edge:${edge.edgeId}:${edge.seedNodeId}`,
      category: edge.category,
      primary,
      secondary,
      edgeType: edge.edgeType,
      edgeLabel: edge.edgeLabel,
      edgeId: edge.edgeId,
      distance: edge.distance,
      relevance: CATEGORY_RELEVANCE[edge.category],
      excerpt: formatRelationshipExcerpt({
        category: edge.category,
        primary,
        secondary,
        edgeLabel: edge.edgeLabel,
        edgeType: edge.edgeType,
        distance: edge.distance,
      }),
    };
  }

  /**
   * Neighbor evidence for adjacent nodes — references seed and neighbor entities.
   */
  private mapNeighbors(
    neighbors: GraphResolvedNeighbor[],
    edges: GraphResolvedEdge[],
  ): GraphEvidenceDraft[] {
    const edgeEvidenceKeys = new Set(
      edges.map((edge) => `${edge.seedNodeId}|${endpointKey(edge, edge.seedNodeId)}`),
    );

    const drafts: GraphEvidenceDraft[] = [];

    for (const neighbor of neighbors) {
      const neighborKey = `${neighbor.seedNodeId}|${neighbor.nodeId}`;

      if (edgeEvidenceKeys.has(neighborKey)) {
        continue;
      }

      const seedEndpoint = resolveSeedEndpoint(neighbor.seedNodeId, edges);

      if (!seedEndpoint) {
        continue;
      }

      drafts.push({
        id: `graph:neighbor:${neighbor.seedNodeId}:${neighbor.nodeId}`,
        category: "neighbor",
        primary: seedEndpoint,
        secondary: {
          nodeId: neighbor.nodeId,
          entityId: neighbor.entityId,
          entityType: neighbor.entityType,
          entityName: neighbor.entityName,
        },
        edgeType: "partner",
        edgeLabel: "Neighbor",
        edgeId: neighbor.connectingEdgeIds[0] ?? neighbor.nodeId,
        distance: neighbor.distance,
        relevance: CATEGORY_RELEVANCE.neighbor,
        excerpt: formatNeighborExcerpt(seedEndpoint, neighbor),
      });
    }

    return drafts;
  }

  private toEvidence(draft: GraphEvidenceDraft, retrievedAt: string): Evidence {
    return {
      id: draft.id,
      entityId: draft.primary.entityId,
      entityType: draft.primary.entityType,
      entityName: draft.primary.entityName,
      source: {
        class: GRAPH_EVIDENCE_SOURCE_CLASS,
        ref: draft.edgeId,
        label: SOURCE_LABEL,
        provenanceStrength: "inferred",
        retrievedAt,
      },
      relevance: draft.relevance,
      excerpt: draft.excerpt,
      relationshipLabel: draft.edgeLabel,
      staleness: "fresh",
    };
  }
}

function endpointKey(edge: GraphResolvedEdge, seedNodeId: string): string {
  const other =
    edge.source.nodeId === seedNodeId ? edge.target.nodeId : edge.source.nodeId;
  return other;
}

function resolveSeedEndpoint(
  seedNodeId: string,
  edges: GraphResolvedEdge[],
): GraphEvidenceDraft["primary"] | null {
  const edge = edges.find((item) => item.seedNodeId === seedNodeId);

  if (!edge) {
    return null;
  }

  return edge.source.nodeId === seedNodeId ? edge.source : edge.target;
}

function formatRelationshipExcerpt(input: {
  category: GraphEvidenceCategory;
  primary: GraphEvidenceDraft["primary"];
  secondary: GraphEvidenceDraft["secondary"];
  edgeLabel: string;
  edgeType: GraphEvidenceDraft["edgeType"];
  distance: number;
}): string {
  const categoryLabel = GRAPH_EVIDENCE_CATEGORY_LABELS[input.category];

  return [
    `${categoryLabel} evidence (knowledge graph, inferred).`,
    `Entity A: ${input.primary.entityName} (${input.primary.entityType}:${input.primary.entityId}).`,
    `Entity B: ${input.secondary.entityName} (${input.secondary.entityType}:${input.secondary.entityId}).`,
    `Relationship: ${input.edgeLabel} (${input.edgeType}).`,
    `Graph distance from seed: ${input.distance} hop(s).`,
  ].join(" ");
}

function formatNeighborExcerpt(
  seed: GraphEvidenceDraft["primary"],
  neighbor: GraphResolvedNeighbor,
): string {
  return [
    "Neighbor evidence (knowledge graph, inferred).",
    `Entity A: ${seed.entityName} (${seed.entityType}:${seed.entityId}).`,
    `Entity B: ${neighbor.entityName} (${neighbor.entityType}:${neighbor.entityId}).`,
    `Graph distance: ${neighbor.distance} hop(s).`,
    `Connecting edges: ${neighbor.connectingEdgeIds.length}.`,
  ].join(" ");
}

function compareDrafts(a: GraphEvidenceDraft, b: GraphEvidenceDraft): number {
  if (b.relevance !== a.relevance) {
    return b.relevance - a.relevance;
  }

  return a.id.localeCompare(b.id);
}

/** Shared default mapper singleton. */
export const defaultGraphEvidenceMapper = new GraphEvidenceMapper();
