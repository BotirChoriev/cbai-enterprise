/**
 * Knowledge graph ownership contracts (Stage 1).
 */

export const GRAPH_OWNERSHIP = {
  canonicalRoute: "/graph",
  canonicalModules: [
    "lib/graph",
    "lib/living-graph",
    "lib/living-object-network",
    "components/graph",
  ] as const,
  quarantineDuplicate: "lib/intelligence/graph",
  forbidNewAppImportsOfQuarantine: true,
  dataKey: "cbai-living-relationships",
} as const;

export type CanonicalGraphNodeRef = {
  readonly nodeId: string;
  readonly label?: string;
};
