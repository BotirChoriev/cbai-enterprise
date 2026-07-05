import { buildKnowledgeGraph, computeGraphSelection } from "@/lib/graph/graph.builder";
import type { GraphNode, KnowledgeGraph } from "@/lib/graph/graph.types";
import { graphNodeId, parseGraphNodeId } from "@/lib/graph/graph.types";
import {
  entityRefKey,
  isSupportedEntityType,
} from "@/lib/intelligence/evidence/adapters/entity/types";
import {
  GRAPH_EDGE_CATEGORY_MAP,
  type GraphContextResolution,
  type GraphEntityEndpoint,
  type GraphResolvedEdge,
  type GraphResolvedNeighbor,
} from "@/lib/intelligence/evidence/adapters/graph/types";
import type { EntityRef } from "@/lib/intelligence/request.types";

/**
 * Read-only resolver that extracts connected graph context for subject entities
 * using existing knowledge graph APIs only — no inference or graph mutation.
 */
export class GraphContextResolver {
  /**
   * Resolve connected nodes, edges, relationship types, and hop distances
   * for the given subject entity scope.
   */
  resolve(subjectEntities: EntityRef[] | undefined): GraphContextResolution {
    if (!subjectEntities || subjectEntities.length === 0) {
      return {
        seedNodeIds: [],
        connectedEdges: [],
        neighbors: [],
        warnings: [],
      };
    }

    const graph = buildKnowledgeGraph();
    const warnings: string[] = [];
    const seedNodeIds: string[] = [];
    const seenSeeds = new Set<string>();

    for (const ref of subjectEntities) {
      const key = entityRefKey(ref);

      if (!isSupportedEntityType(ref.type)) {
        warnings.push(`graph:entity-type-not-in-graph:${key}`);
        continue;
      }

      const nodeId = graphNodeId(ref.type, ref.id);
      const node = graph.nodes.find((n) => n.id === nodeId);

      if (!node) {
        warnings.push(`graph:node-not-found:${key}`);
        continue;
      }

      if (!seenSeeds.has(nodeId)) {
        seenSeeds.add(nodeId);
        seedNodeIds.push(nodeId);
      }
    }

    if (seedNodeIds.length === 0) {
      return { seedNodeIds, connectedEdges: [], neighbors: [], warnings };
    }

    const connectedEdges = this.collectConnectedEdges(graph, seedNodeIds);
    const neighbors = this.collectNeighbors(graph, seedNodeIds, connectedEdges);

    for (const seedNodeId of seedNodeIds) {
      const hasConnections = connectedEdges.some((edge) => edge.seedNodeId === seedNodeId);

      if (!hasConnections) {
        const { entityId, type } = parseGraphNodeId(seedNodeId);
        warnings.push(`graph:disconnected:${type}:${entityId}`);
      }
    }

    return {
      seedNodeIds,
      connectedEdges,
      neighbors,
      warnings,
    };
  }

  private collectConnectedEdges(
    graph: KnowledgeGraph,
    seedNodeIds: string[],
  ): GraphResolvedEdge[] {
    const seenEdgeIds = new Set<string>();
    const edges: GraphResolvedEdge[] = [];

    for (const seedNodeId of seedNodeIds) {
      const selection = computeGraphSelection(graph, seedNodeId);
      const seedNode = graph.nodes.find((n) => n.id === seedNodeId);

      if (!seedNode) {
        continue;
      }

      for (const edgeId of selection.connectedEdgeIds) {
        if (seenEdgeIds.has(edgeId)) {
          continue;
        }

        const edge = graph.edges.find((e) => e.id === edgeId);

        if (!edge) {
          continue;
        }

        seenEdgeIds.add(edgeId);

        const sourceNode = graph.nodes.find((n) => n.id === edge.source);
        const targetNode = graph.nodes.find((n) => n.id === edge.target);

        if (!sourceNode || !targetNode) {
          continue;
        }

        const otherNode = edge.source === seedNodeId ? targetNode : sourceNode;
        const distance = computeGraphDistance(graph, seedNodeId, otherNode.id);

        edges.push({
          edgeId: edge.id,
          edgeType: edge.type,
          edgeLabel: edge.label,
          category: GRAPH_EDGE_CATEGORY_MAP[edge.type],
          source: toEndpoint(sourceNode),
          target: toEndpoint(targetNode),
          seedNodeId,
          distance: distance ?? 1,
        });
      }
    }

    return edges.sort(compareResolvedEdges);
  }

  private collectNeighbors(
    graph: KnowledgeGraph,
    seedNodeIds: string[],
    connectedEdges: GraphResolvedEdge[],
  ): GraphResolvedNeighbor[] {
    const neighborMap = new Map<string, GraphResolvedNeighbor>();

    for (const seedNodeId of seedNodeIds) {
      const selection = computeGraphSelection(graph, seedNodeId);

      for (const nodeId of selection.connectedNodeIds) {
        if (nodeId === seedNodeId) {
          continue;
        }

        const node = graph.nodes.find((n) => n.id === nodeId);

        if (!node) {
          continue;
        }

        const connectingEdgeIds = connectedEdges
          .filter(
            (edge) =>
              edge.seedNodeId === seedNodeId &&
              (edge.source.nodeId === nodeId || edge.target.nodeId === nodeId),
          )
          .map((edge) => edge.edgeId);

        const distance = computeGraphDistance(graph, seedNodeId, nodeId) ?? 1;
        const mapKey = `${seedNodeId}|${nodeId}`;
        const existing = neighborMap.get(mapKey);

        if (existing) {
          existing.connectingEdgeIds = [
            ...new Set([...existing.connectingEdgeIds, ...connectingEdgeIds]),
          ];
          continue;
        }

        neighborMap.set(mapKey, {
          nodeId: node.id,
          entityId: node.entityId,
          entityType: node.type,
          entityName: node.label,
          seedNodeId,
          distance,
          connectingEdgeIds,
        });
      }
    }

    return Array.from(neighborMap.values()).sort((a, b) =>
      a.nodeId.localeCompare(b.nodeId),
    );
  }
}

function toEndpoint(node: GraphNode): GraphEntityEndpoint {
  return {
    nodeId: node.id,
    entityId: node.entityId,
    entityType: node.type,
    entityName: node.label,
  };
}

/**
 * BFS hop distance between two nodes — intelligence-side only, no graph builder changes.
 */
export function computeGraphDistance(
  graph: KnowledgeGraph,
  fromNodeId: string,
  toNodeId: string,
): number | null {
  if (fromNodeId === toNodeId) {
    return 0;
  }

  const visited = new Set<string>([fromNodeId]);
  const queue: Array<{ nodeId: string; distance: number }> = [
    { nodeId: fromNodeId, distance: 0 },
  ];

  while (queue.length > 0) {
    const current = queue.shift();

    if (!current) {
      break;
    }

    for (const edge of graph.edges) {
      let next: string | null = null;

      if (edge.source === current.nodeId) {
        next = edge.target;
      } else if (edge.target === current.nodeId) {
        next = edge.source;
      }

      if (!next || visited.has(next)) {
        continue;
      }

      const nextDistance = current.distance + 1;

      if (next === toNodeId) {
        return nextDistance;
      }

      visited.add(next);
      queue.push({ nodeId: next, distance: nextDistance });
    }
  }

  return null;
}

function compareResolvedEdges(a: GraphResolvedEdge, b: GraphResolvedEdge): number {
  const byEdge = a.edgeId.localeCompare(b.edgeId);

  if (byEdge !== 0) {
    return byEdge;
  }

  return a.seedNodeId.localeCompare(b.seedNodeId);
}

/** Shared default resolver singleton. */
export const defaultGraphContextResolver = new GraphContextResolver();
