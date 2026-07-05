import type { GraphEdgeType } from "@/lib/graph/graph.types";

/** Stable adapter identifier — registered in evidence source registry (BUILD-031). */
export const GRAPH_EVIDENCE_ADAPTER_ID = "graph";

/** Semantic version of the graph evidence adapter. */
export const GRAPH_EVIDENCE_ADAPTER_VERSION = "0.1.0-graph-evidence";

/** Evidence source class for graph-derived items. */
export const GRAPH_EVIDENCE_SOURCE_CLASS = "knowledge-graph" as const;

/**
 * Graph evidence categories mapped from knowledge graph edge semantics.
 */
export type GraphEvidenceCategory =
  | "relationship"
  | "neighbor"
  | "industry"
  | "research"
  | "investment"
  | "location";

/** Maps graph edge types to evidence categories — no inference beyond graph builder data. */
export const GRAPH_EDGE_CATEGORY_MAP: Record<GraphEdgeType, GraphEvidenceCategory> = {
  partner: "relationship",
  competitor: "relationship",
  "located-in": "location",
  "research-partner": "research",
  industry: "industry",
  investment: "investment",
};

/** Human-readable labels for evidence categories. */
export const GRAPH_EVIDENCE_CATEGORY_LABELS: Record<GraphEvidenceCategory, string> = {
  relationship: "Relationship",
  neighbor: "Neighbor",
  industry: "Industry",
  research: "Research",
  investment: "Investment",
  location: "Location",
};

/**
 * Entity endpoint reference attached to graph evidence.
 */
export interface GraphEntityEndpoint {
  nodeId: string;
  entityId: string;
  entityType: import("@/lib/entity/entity.types").EntityType;
  entityName: string;
}

/**
 * A resolved graph edge in subject scope with hop distance from a seed node.
 */
export interface GraphResolvedEdge {
  edgeId: string;
  edgeType: GraphEdgeType;
  edgeLabel: string;
  category: GraphEvidenceCategory;
  source: GraphEntityEndpoint;
  target: GraphEntityEndpoint;
  /** Seed graph node id that discovered this edge. */
  seedNodeId: string;
  /** Graph hop distance from seed to the non-seed endpoint (1 = direct). */
  distance: number;
}

/**
 * A neighboring node connected to a subject seed within the knowledge graph.
 */
export interface GraphResolvedNeighbor {
  nodeId: string;
  entityId: string;
  entityType: import("@/lib/entity/entity.types").EntityType;
  entityName: string;
  seedNodeId: string;
  distance: number;
  connectingEdgeIds: string[];
}

/**
 * Output of {@link GraphContextResolver.resolve}.
 */
export interface GraphContextResolution {
  /** Subject seed node ids present in the knowledge graph. */
  seedNodeIds: string[];
  /** Edges connected to subject seeds — only existing graph edges. */
  connectedEdges: GraphResolvedEdge[];
  /** Neighbor nodes within graph distance of seeds. */
  neighbors: GraphResolvedNeighbor[];
  /** Non-fatal resolution warnings. */
  warnings: string[];
}

/** Options for {@link GraphEvidenceMapper}. */
export interface GraphEvidenceMapperOptions {
  retrievedAt: string;
}

/**
 * Draft graph evidence before binding to primary entity fields.
 */
export interface GraphEvidenceDraft {
  id: string;
  category: GraphEvidenceCategory;
  primary: GraphEntityEndpoint;
  secondary: GraphEntityEndpoint;
  edgeType: GraphEdgeType;
  edgeLabel: string;
  edgeId: string;
  distance: number;
  excerpt: string;
  relevance: number;
}
