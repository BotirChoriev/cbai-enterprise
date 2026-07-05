/**
 * CBAI Intelligence Engine — Graph Context Layer (BUILD-026).
 *
 * Framework-only graph context assembly. No traversal, scoring,
 * graph mutation, external services, or UI bindings.
 *
 * @see docs/build-026-report.md
 */

export {
  DEFAULT_GRAPH_CONTEXT_BUILDER_ID,
  DefaultGraphContextBuilder,
  defaultGraphContextBuilder,
  GRAPH_CONTEXT_BUILDER_VERSION,
  type GraphContextBuildResult,
  type GraphContextBuilder,
} from "@/lib/intelligence/graph/context-builder";

export {
  buildDisabledGraphSignals,
  buildGraphSignalSkeleton,
  GRAPH_SIGNAL_DEFINITIONS,
  type GraphSignal,
  type GraphSignalName,
} from "@/lib/intelligence/graph/signals";

export {
  DEFAULT_TRAVERSAL_MAX_DEPTH,
  resolveSeedNodeIdsFromRequest,
  traverseGraphSkeleton,
  type GraphTraversalOptions,
  type GraphTraversalResult,
  type GraphTraversalStatus,
} from "@/lib/intelligence/graph/traversal";
