import type { Entity, EntityType } from "@/lib/entity/entity.types";

/** Graph node types — extensible for People, Governments, Investors */
export type GraphNodeType = Extract<
  EntityType,
  "country" | "company" | "university"
>;

/** All supported edge relationship types */
export type GraphEdgeType =
  | "located-in"
  | "partner"
  | "competitor"
  | "research-partner"
  | "industry"
  | "investment";

export type GraphNode = {
  id: string;
  entityId: string;
  type: GraphNodeType;
  label: string;
  entity: Entity;
  x: number;
  y: number;
};

export type GraphEdge = {
  id: string;
  source: string;
  target: string;
  type: GraphEdgeType;
  label: string;
};

export type KnowledgeGraph = {
  nodes: GraphNode[];
  edges: GraphEdge[];
};

export type GraphNodeFilter = GraphNodeType | "all";

export type GraphStats = {
  totalNodes: number;
  totalEdges: number;
  countryCount: number;
  companyCount: number;
  universityCount: number;
  edgeTypeCounts: Record<GraphEdgeType, number>;
};

export type GraphSelection = {
  nodeId: string | null;
  connectedNodeIds: Set<string>;
  connectedEdgeIds: Set<string>;
};

/** Build node id from entity type and domain id */
export function graphNodeId(type: GraphNodeType, entityId: string): string {
  return `${type}:${entityId}`;
}

/** Parse node id back to type and entity id */
export function parseGraphNodeId(id: string): {
  type: GraphNodeType;
  entityId: string;
} {
  const [type, entityId] = id.split(":");
  return { type: type as GraphNodeType, entityId };
}
