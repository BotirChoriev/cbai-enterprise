import type { IntelligenceGraphEdgeType } from "@/lib/intelligence/context.types";
import type { IntelligenceGraphPath } from "@/lib/intelligence/context.types";

/** Default maximum hop depth per Domain Model graph traversal rules. */
export const DEFAULT_TRAVERSAL_MAX_DEPTH = 2;

/**
 * Options controlling bounded graph traversal from seed nodes.
 *
 * Extension point: intent-specific edge filtering and depth limits.
 */
export interface GraphTraversalOptions {
  /** Graph node IDs to begin traversal (`{type}:{entityId}`). */
  seedNodeIds: string[];
  /** Maximum hop depth — default 2 per Intelligence Specification §10.2 G2. */
  maxDepth?: number;
  /** Optional edge type filter; all types when omitted. */
  edgeTypes?: IntelligenceGraphEdgeType[];
}

/**
 * Status of a graph traversal run.
 */
export type GraphTraversalStatus =
  | "disabled"
  | "not-connected"
  | "empty-seeds"
  | "complete";

/**
 * Result of a graph traversal operation.
 *
 * BUILD-026 returns empty results only — skeleton for future
 * {@link lib/graph/graph.builder.ts} integration.
 */
export interface GraphTraversalResult {
  /** Discovered paths between seed and related nodes. */
  paths: IntelligenceGraphPath[];
  /** Node IDs visited during traversal. */
  visitedNodeIds: string[];
  /** Edge IDs traversed during traversal. */
  visitedEdgeIds: string[];
  /** True when query-central entities have no connecting paths. */
  stalemate: boolean;
  /** Traversal run status. */
  status: GraphTraversalStatus;
  /** Human-readable detail for audit traces. */
  detail: string;
}

/**
 * Execute skeleton graph traversal — returns empty result only.
 *
 * No real graph reads, mutation, or scoring occur in BUILD-026.
 * Future builds replace this body with Knowledge Graph adapter calls.
 *
 * @param options - Traversal scope and constraints
 * @returns Empty traversal result with explicit not-connected status
 */
export function traverseGraphSkeleton(
  options: GraphTraversalOptions,
): GraphTraversalResult {
  if (options.seedNodeIds.length === 0) {
    return {
      paths: [],
      visitedNodeIds: [],
      visitedEdgeIds: [],
      stalemate: false,
      status: "empty-seeds",
      detail: "No seed node IDs provided — traversal skipped.",
    };
  }

  return {
    paths: [],
    visitedNodeIds: [],
    visitedEdgeIds: [],
    stalemate: false,
    status: "not-connected",
    detail:
      "Graph traversal skeleton — Knowledge Graph adapter not connected in BUILD-026.",
  };
}

/**
 * Resolve seed node IDs from request subject entities.
 *
 * Structural mapping only — does not verify nodes exist in the graph.
 */
export function resolveSeedNodeIdsFromRequest(
  subjectEntities: Array<{ type: string; id: string }> | undefined,
): string[] {
  if (!subjectEntities?.length) {
    return [];
  }

  return subjectEntities.map((entity) => `${entity.type}:${entity.id}`);
}
