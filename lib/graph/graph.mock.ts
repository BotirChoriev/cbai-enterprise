import type { GraphEdgeType } from "@/lib/graph/graph.types";

/** Edge type visual configuration — active relationship types only in legend. */
export type EdgeTypeConfig = {
  type: GraphEdgeType;
  label: string;
  color: string;
  strokeDasharray?: string;
  active: boolean;
};

export const EDGE_TYPE_CONFIG: EdgeTypeConfig[] = [
  {
    type: "located-in",
    label: "Located In",
    color: "#22d3ee",
    active: true,
  },
  {
    type: "industry",
    label: "Registered In",
    color: "#38bdf8",
    strokeDasharray: "4 4",
    active: true,
  },
  {
    type: "research-partner",
    label: "Belongs To",
    color: "#a78bfa",
    active: true,
  },
  {
    type: "partner",
    label: "Collaborates With",
    color: "#34d399",
    active: false,
  },
  {
    type: "competitor",
    label: "Competitor",
    color: "#f87171",
    strokeDasharray: "6 3",
    active: false,
  },
  {
    type: "investment",
    label: "Investment",
    color: "#38bdf8",
    strokeDasharray: "8 4",
    active: false,
  },
];

export const ACTIVE_EDGE_TYPE_CONFIG = EDGE_TYPE_CONFIG.filter(
  (config) => config.active,
);

export const EDGE_TYPE_MAP: Record<GraphEdgeType, EdgeTypeConfig> =
  Object.fromEntries(
    EDGE_TYPE_CONFIG.map((config) => [config.type, config]),
  ) as Record<GraphEdgeType, EdgeTypeConfig>;

export const GRAPH_LAYOUT = {
  centerX: 520,
  centerY: 380,
  countryRadius: 120,
  companyRadius: 260,
  universityRadius: 400,
  nodeSize: 56,
};

export const NODE_TYPE_COLORS: Record<string, string> = {
  country: "#22d3ee",
  company: "#38bdf8",
  university: "#a78bfa",
};

export const GRAPH_ZOOM = {
  min: 0.5,
  max: 1.75,
  step: 0.15,
  default: 1,
} as const;
