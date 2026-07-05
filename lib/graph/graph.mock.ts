import type { GraphEdgeType } from "@/lib/graph/graph.types";

/** Edge type visual and semantic configuration */
export type EdgeTypeConfig = {
  type: GraphEdgeType;
  label: string;
  color: string;
  strokeDasharray?: string;
};

export const EDGE_TYPE_CONFIG: EdgeTypeConfig[] = [
  {
    type: "located-in",
    label: "Located In",
    color: "#22d3ee",
  },
  {
    type: "partner",
    label: "Partner",
    color: "#34d399",
  },
  {
    type: "competitor",
    label: "Competitor",
    color: "#f87171",
    strokeDasharray: "6 3",
  },
  {
    type: "research-partner",
    label: "Research Partner",
    color: "#a78bfa",
  },
  {
    type: "industry",
    label: "Industry",
    color: "#fbbf24",
    strokeDasharray: "4 4",
  },
  {
    type: "investment",
    label: "Investment",
    color: "#38bdf8",
    strokeDasharray: "8 4",
  },
];

export const EDGE_TYPE_MAP: Record<GraphEdgeType, EdgeTypeConfig> =
  Object.fromEntries(
    EDGE_TYPE_CONFIG.map((c) => [c.type, c]),
  ) as Record<GraphEdgeType, EdgeTypeConfig>;

/** Layout ring radii for node positioning */
export const GRAPH_LAYOUT = {
  centerX: 520,
  centerY: 380,
  countryRadius: 120,
  companyRadius: 260,
  universityRadius: 400,
  nodeSize: 56,
};

/** Node type accent colors for graph rendering */
export const NODE_TYPE_COLORS: Record<string, string> = {
  country: "#22d3ee",
  company: "#38bdf8",
  university: "#a78bfa",
};
