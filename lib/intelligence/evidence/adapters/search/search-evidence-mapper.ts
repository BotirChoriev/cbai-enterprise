import type { Evidence } from "@/lib/intelligence/evidence.types";
import { EVIDENCE_RELEVANCE_MAX } from "@/lib/intelligence/evidence/validation";
import {
  SEARCH_EVIDENCE_SOURCE_CLASS,
  type SearchEvidenceDraft,
  type SearchEvidenceMapperOptions,
  type SearchResolution,
  type SearchResolvedMatch,
} from "@/lib/intelligence/evidence/adapters/search/types";

const SOURCE_LABEL = "CBAI Global Search";

/**
 * Deterministic mapper from local search matches to {@link Evidence} items.
 *
 * Never invents matches — only maps resolver output.
 */
export class SearchEvidenceMapper {
  /**
   * Map resolved search matches to evidence items with deduplication by stable id.
   */
  mapMatches(
    resolution: SearchResolution,
    options: SearchEvidenceMapperOptions,
  ): Evidence[] {
    const seenIds = new Set<string>();
    const evidence: Evidence[] = [];

    for (const match of resolution.matches) {
      const draft = this.mapMatch(match, options);

      if (seenIds.has(draft.id)) {
        continue;
      }

      seenIds.add(draft.id);
      evidence.push(this.toEvidence(draft, options.retrievedAt));
    }

    return evidence.sort((a, b) => {
      if (b.relevance !== a.relevance) {
        return b.relevance - a.relevance;
      }

      return a.id.localeCompare(b.id);
    });
  }

  private mapMatch(
    match: SearchResolvedMatch,
    options: SearchEvidenceMapperOptions,
  ): SearchEvidenceDraft {
    const { entity } = match;
    const relevance = clampRelevance(match.relevanceScore);

    return {
      id: `search:${entity.type}:${entity.id}:match`,
      entityId: entity.id,
      entityType: entity.type,
      entityName: entity.name,
      relevance,
      excerpt: formatSearchExcerpt(match, options.query),
      sourceRef: buildSourceRef(match, options.query),
      matchSource: match.matchSource,
    };
  }

  private toEvidence(draft: SearchEvidenceDraft, retrievedAt: string): Evidence {
    return {
      id: draft.id,
      entityId: draft.entityId,
      entityType: draft.entityType,
      entityName: draft.entityName,
      source: {
        class: SEARCH_EVIDENCE_SOURCE_CLASS,
        ref: draft.sourceRef,
        label: SOURCE_LABEL,
        provenanceStrength: "inferred",
        retrievedAt,
      },
      relevance: draft.relevance,
      excerpt: draft.excerpt,
      staleness: "fresh",
    };
  }
}

function clampRelevance(score: number): number {
  return Math.max(0, Math.min(EVIDENCE_RELEVANCE_MAX, Math.round(score)));
}

function buildSourceRef(match: SearchResolvedMatch, query: string): string {
  if (match.matchSource === "question" && match.query) {
    return `search:query:${match.query}`;
  }

  if (query) {
    return `search:query:${query}`;
  }

  return `search:subject:${match.entity.type}:${match.entity.id}`;
}

function formatSearchExcerpt(match: SearchResolvedMatch, query: string): string {
  const reasonText =
    match.matchReasons.length > 0
      ? match.matchReasons
          .map((reason) => `${reason.field}: ${reason.snippet}`)
          .join(" | ")
      : "Local index match.";

  const queryText = query ? `Query: "${query}".` : "No question query — subject entity scope.";

  return [
    "Search match evidence (local index, inferred).",
    queryText,
    `Matched entity: ${match.entity.name} (${match.entity.type}:${match.entity.id}).`,
    `Match source: ${match.matchSource}.`,
    `Match detail: ${reasonText}.`,
    `Search relevance score: ${clampRelevance(match.relevanceScore)}/100.`,
  ].join(" ");
}

/** Shared default mapper singleton. */
export const defaultSearchEvidenceMapper = new SearchEvidenceMapper();
