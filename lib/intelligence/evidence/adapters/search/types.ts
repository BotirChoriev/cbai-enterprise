import type { SearchMatchReason, SearchResult } from "@/lib/global-search";

/** Stable adapter identifier — matches evidence source registry entry. */
export const SEARCH_EVIDENCE_ADAPTER_ID = "search";

/** Semantic version of the search evidence adapter. */
export const SEARCH_EVIDENCE_ADAPTER_VERSION = "0.1.0-search-evidence";

/** Evidence source class for search-derived items. */
export const SEARCH_EVIDENCE_SOURCE_CLASS = "search" as const;

/** Maximum question-search matches converted to evidence (deterministic cap). */
export const MAX_SEARCH_QUERY_MATCHES = 10;

/**
 * How a search match was discovered.
 */
export type SearchMatchSource = "question" | "subject-entity";

/**
 * A resolved local search match ready for evidence mapping.
 */
export interface SearchResolvedMatch {
  entity: import("@/lib/entity/entity.types").Entity;
  relevanceScore: number;
  matchReasons: SearchMatchReason[];
  matchSource: SearchMatchSource;
  /** Query string used when match came from question search. */
  query?: string;
}

/**
 * Output of {@link SearchResolver.resolve}.
 */
export interface SearchResolution {
  /** Normalized question used for search, if any. */
  query: string;
  /** Deterministic ordered matches from local search utilities. */
  matches: SearchResolvedMatch[];
  /** Non-fatal resolution warnings. */
  warnings: string[];
}

/** Options for {@link SearchEvidenceMapper}. */
export interface SearchEvidenceMapperOptions {
  retrievedAt: string;
  query: string;
}

/**
 * Draft search evidence before binding to {@link import("@/lib/intelligence/evidence.types").Evidence}.
 */
export interface SearchEvidenceDraft {
  id: string;
  entityId: string;
  entityType: import("@/lib/entity/entity.types").EntityType;
  entityName: string;
  relevance: number;
  excerpt: string;
  sourceRef: string;
  matchSource: SearchMatchSource;
}

/** Convert a {@link SearchResult} into a resolved match. */
export function toSearchResolvedMatch(
  result: SearchResult,
  matchSource: SearchMatchSource,
  query?: string,
): SearchResolvedMatch {
  return {
    entity: result.entity,
    relevanceScore: result.relevanceScore,
    matchReasons: result.matchReasons,
    matchSource,
    query,
  };
}
