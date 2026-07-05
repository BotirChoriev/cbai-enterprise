import type {
  GraphContext,
  GraphContextMetadata,
} from "@/lib/intelligence/context.types";
import type { EvidenceCollection } from "@/lib/intelligence/evidence.types";
import type { IntelligenceRequest } from "@/lib/intelligence/request.types";
import {
  buildDisabledGraphSignals,
  buildGraphSignalSkeleton,
  type GraphSignal,
} from "@/lib/intelligence/graph/signals";
import {
  resolveSeedNodeIdsFromRequest,
  traverseGraphSkeleton,
} from "@/lib/intelligence/graph/traversal";

/** Semantic version of the default graph context builder. */
export const GRAPH_CONTEXT_BUILDER_VERSION = "0.1.0-foundation";

/** Stable identifier for audit metadata. */
export const DEFAULT_GRAPH_CONTEXT_BUILDER_ID = "default-graph-context-builder";

/**
 * Extended graph context including skeleton signals for future layers.
 */
export interface GraphContextBuildResult extends GraphContext {
  /** Skeleton graph signals — scores null until graph adapter is connected. */
  signals: GraphSignal[];
}

/**
 * Contract for the CBAI Graph Context Layer.
 *
 * Assembles {@link GraphContext} from intelligence request scope and
 * evidence without mutating the Knowledge Graph or calling external services.
 */
export interface GraphContextBuilder {
  /**
   * Build graph context for an intelligence run.
   *
   * @param request - Intelligence request envelope
   * @param evidence - Evidence collection from the Evidence Layer
   * @returns Graph context with explicit production status
   */
  build(
    request: IntelligenceRequest,
    evidence: EvidenceCollection,
  ): Promise<GraphContextBuildResult>;
}

/**
 * Create base empty graph context fields shared by disabled and not-connected states.
 */
function createEmptyGraphFields(): Pick<
  GraphContext,
  | "seedNodeIds"
  | "traversedPaths"
  | "connectivityScore"
  | "stalemate"
  | "nodeCount"
  | "edgeCount"
> {
  return {
    seedNodeIds: [],
    traversedPaths: [],
    connectivityScore: 0,
    stalemate: false,
    nodeCount: 0,
    edgeCount: 0,
  };
}

/**
 * Default graph context builder for the CBAI Intelligence Engine (BUILD-026).
 *
 * Returns disabled context when `includeGraph` is false or missing.
 * Returns empty not-connected context when `includeGraph` is true.
 * No real traversal, scoring, or graph mutation occurs.
 */
export class DefaultGraphContextBuilder implements GraphContextBuilder {
  /**
   * Build graph context based on request flags and evidence scope.
   */
  async build(
    request: IntelligenceRequest,
    evidence: EvidenceCollection,
  ): Promise<GraphContextBuildResult> {
    const builtAt = new Date().toISOString();

    if (request.includeGraph !== true) {
      return this.buildDisabledContext(builtAt);
    }

    return this.buildNotConnectedContext(request, evidence, builtAt);
  }

  /**
   * Graph context when `includeGraph` is false or omitted.
   */
  private buildDisabledContext(builtAt: string): GraphContextBuildResult {
    const metadata: GraphContextMetadata = {
      builderId: DEFAULT_GRAPH_CONTEXT_BUILDER_ID,
      builderVersion: GRAPH_CONTEXT_BUILDER_VERSION,
      status: "disabled",
      message: "Graph context disabled — request.includeGraph is not true.",
      builtAt,
    };

    return {
      enabled: false,
      ...createEmptyGraphFields(),
      metadata,
      signals: buildDisabledGraphSignals(),
    };
  }

  /**
   * Graph context when graph is requested but adapter is not connected.
   */
  private buildNotConnectedContext(
    request: IntelligenceRequest,
    evidence: EvidenceCollection,
    builtAt: string,
  ): GraphContextBuildResult {
    void evidence;

    const seedNodeIds = resolveSeedNodeIdsFromRequest(request.subjectEntities);

    const traversal = traverseGraphSkeleton({
      seedNodeIds,
      maxDepth: 2,
    });

    const metadata: GraphContextMetadata = {
      builderId: DEFAULT_GRAPH_CONTEXT_BUILDER_ID,
      builderVersion: GRAPH_CONTEXT_BUILDER_VERSION,
      status: "graph-context-not-connected",
      message:
        "Graph context requested but Knowledge Graph adapter is not connected — traversal skeleton returned empty result.",
      builtAt,
    };

    return {
      enabled: true,
      seedNodeIds,
      traversedPaths: traversal.paths,
      connectivityScore: 0,
      stalemate: traversal.stalemate,
      nodeCount: traversal.visitedNodeIds.length,
      edgeCount: traversal.visitedEdgeIds.length,
      metadata,
      signals: buildGraphSignalSkeleton(),
    };
  }
}

/** Shared default builder singleton used by the intelligence engine pipeline. */
export const defaultGraphContextBuilder = new DefaultGraphContextBuilder();
