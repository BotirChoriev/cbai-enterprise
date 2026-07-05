/**
 * Future graph signal identifiers for intelligence reasoning.
 *
 * Signals will feed confidence and trust layers when graph context
 * is connected — not computed in BUILD-026.
 */
export type GraphSignalName =
  | "connectivity"
  | "centrality"
  | "relationship-strength"
  | "entity-proximity"
  | "contradiction-risk";

/**
 * A single graph-derived signal placeholder.
 */
export interface GraphSignal {
  /** Signal identifier. */
  name: GraphSignalName;
  /** Normalized signal score 0–100 when computed; null when deferred. */
  score: number | null;
  /** Human-readable status for explainability surfaces. */
  detail: string;
}

/** Canonical graph signal definitions for the intelligence engine. */
export const GRAPH_SIGNAL_DEFINITIONS: readonly {
  name: GraphSignalName;
  label: string;
  description: string;
}[] = [
  {
    name: "connectivity",
    label: "Connectivity",
    description: "Path count and edge diversity between query-central entities.",
  },
  {
    name: "centrality",
    label: "Centrality",
    description: "Position of matched entities within the active subgraph.",
  },
  {
    name: "relationship-strength",
    label: "Relationship Strength",
    description: "Weighted strength of traversed edge types supporting the claim.",
  },
  {
    name: "entity-proximity",
    label: "Entity Proximity",
    description: "Hop distance between subject entities in the knowledge graph.",
  },
  {
    name: "contradiction-risk",
    label: "Contradiction Risk",
    description: "Conflicting edge types or paths between the same entity pair.",
  },
];

const DEFERRED_DETAIL =
  "Not computed — graph signal evaluation deferred until Knowledge Graph adapter is connected.";

/**
 * Build skeleton graph signals with null scores.
 *
 * Extension point: populate scores from {@link GraphTraversalResult}
 * when graph context is connected in a future build.
 */
export function buildGraphSignalSkeleton(): GraphSignal[] {
  return GRAPH_SIGNAL_DEFINITIONS.map((definition) => ({
    name: definition.name,
    score: null,
    detail: DEFERRED_DETAIL,
  }));
}

/**
 * Build skeleton signals for a disabled graph context run.
 */
export function buildDisabledGraphSignals(): GraphSignal[] {
  return GRAPH_SIGNAL_DEFINITIONS.map((definition) => ({
    name: definition.name,
    score: null,
    detail: "Graph context disabled — signal not evaluated.",
  }));
}
