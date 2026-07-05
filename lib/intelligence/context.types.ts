import type { EntityType } from "@/lib/entity/entity.types";
import type { TrustTier } from "@/lib/intelligence/trust.types";

/**
 * Supported graph edge types at intelligence-engine scope.
 *
 * Mirrors the Domain Model edge catalog without importing graph builder
 * modules, keeping this layer portable.
 */
export type IntelligenceGraphEdgeType =
  | "located-in"
  | "partner"
  | "competitor"
  | "research-partner"
  | "industry"
  | "investment";

/**
 * A traversed graph path used as relational evidence or connectivity signal.
 */
export interface IntelligenceGraphPath {
  /** Ordered edge identifiers along the path. */
  edgeIds: string[];
  /** Edge types traversed in order. */
  edgeTypes: IntelligenceGraphEdgeType[];
  /** Human-readable edge labels traversed in order. */
  edgeLabels: string[];
  /** Graph node ID of the path origin (`{type}:{entityId}`). */
  fromNodeId: string;
  /** Graph node ID of the path terminus. */
  toNodeId: string;
  /** Domain entity ID at path origin. */
  fromEntityId: string;
  /** Domain entity ID at path terminus. */
  toEntityId: string;
}

/**
 * Graph snapshot context consumed during the Reason stage.
 *
 * Provides relational evidence and the graph connectivity signal
 * for confidence assessment per Intelligence Specification §10.
 *
 * @see docs/CBAI-Intelligence-Specification-v1.md §10
 */
export interface GraphContext {
  /** Whether graph context was requested and active for this run. */
  enabled: boolean;
  /** Graph node IDs used as traversal seeds (typically search matches). */
  seedNodeIds: string[];
  /** Validated paths discovered during bounded graph traversal. */
  traversedPaths: IntelligenceGraphPath[];
  /** Normalized connectivity score feeding the graph connectivity factor, 0–100. */
  connectivityScore: number;
  /** True when no paths exist between entities central to the query. */
  stalemate: boolean;
  /** Count of graph nodes in the active subgraph. */
  nodeCount: number;
  /** Count of graph edges in the active subgraph. */
  edgeCount: number;
  /** ISO-8601 timestamp of the graph snapshot used, if snapshotted. */
  snapshotAt?: string;
  /** Builder metadata describing graph context production status. */
  metadata?: GraphContextMetadata;
}

/**
 * Production status for graph context assembly (BUILD-026).
 */
export type GraphContextStatus =
  | "disabled"
  | "graph-context-not-connected"
  | "connected";

/**
 * Metadata describing how {@link GraphContext} was produced.
 */
export interface GraphContextMetadata {
  /** Stable builder identifier. */
  builderId: string;
  /** Builder semantic version. */
  builderVersion: string;
  /** Overall graph context status. */
  status: GraphContextStatus;
  /** Human-readable explanation of the graph context outcome. */
  message: string;
  /** ISO-8601 timestamp when context was built. */
  builtAt: string;
}

/**
 * Memory entry category per Intelligence Specification §9.2.
 */
export type MemoryEntryCategory =
  | "pinned-knowledge"
  | "conversation"
  | "saved-command"
  | "watchlist"
  | "saved-intelligence"
  | "reasoning-trace";

/**
 * Reference to a persistent organizational memory entry injected as context.
 *
 * Memory shapes future intelligence without replacing the evidence requirement.
 */
export interface MemoryEntryRef {
  /** Stable memory entry identifier. */
  id: string;
  /** Memory category determining read rules and priority. */
  category: MemoryEntryCategory;
  /** Linked entity IDs — required by Constitution §11.3 rule M8. */
  entityIds: string[];
  /** Linked document IDs when the entry references knowledge corpus items. */
  documentIds?: string[];
  /** Display title for trace and explainability surfaces. */
  title: string;
  /** Trust tier at time of save; re-use does not auto-upgrade trust. */
  trustTierAtSave?: TrustTier;
}

/**
 * Organizational memory context injected into inference pipelines.
 *
 * Read during CBAI Core Knowledge stage and Reasoning Engine
 * Question/Evidence stages per Intelligence Specification §9.3.
 *
 * @see docs/CBAI-Intelligence-Specification-v1.md §9
 */
export interface MemoryContext {
  /** Whether memory context was requested and active for this run. */
  enabled: boolean;
  /** Memory entries available for the active tenant and request scope. */
  entries: MemoryEntryRef[];
  /** Optional tenant scope identifier for production multi-tenancy. */
  tenantId?: string;
  /** Entity types explicitly in scope for this request. */
  subjectEntityTypes?: EntityType[];
  /** Builder metadata describing memory context production status. */
  metadata?: MemoryContextMetadata;
}

/**
 * Production status for memory context assembly (BUILD-027).
 */
export type MemoryContextStatus =
  | "disabled"
  | "memory-not-connected"
  | "connected";

/**
 * Metadata describing how {@link MemoryContext} was produced.
 */
export interface MemoryContextMetadata {
  /** Stable builder identifier. */
  builderId: string;
  /** Builder semantic version. */
  builderVersion: string;
  /** Overall memory context status. */
  status: MemoryContextStatus;
  /** Human-readable explanation of the memory context outcome. */
  message: string;
  /** ISO-8601 timestamp when context was built. */
  builtAt: string;
}
