import {
  getAllEntities,
  searchEntities,
  type SearchResult,
} from "@/lib/global-search";
import {
  MAX_SEARCH_QUERY_MATCHES,
  toSearchResolvedMatch,
  type SearchResolution,
  type SearchResolvedMatch,
} from "@/lib/intelligence/evidence/adapters/search/types";
import type { IntelligenceRequest } from "@/lib/intelligence/request.types";

/** Relevance assigned to direct subject-entity index matches. */
const SUBJECT_ENTITY_MATCH_RELEVANCE = 90;

/**
 * Resolves local search matches from {@link IntelligenceRequest} using
 * existing global search utilities only — no external or AI search.
 */
export class SearchResolver {
  /**
   * Resolve search matches from request question and/or subject entities.
   */
  resolve(request: IntelligenceRequest): SearchResolution {
    const query = request.question.trim();
    const subjectEntities = request.subjectEntities ?? [];

    if (!query && subjectEntities.length === 0) {
      return {
        query: "",
        matches: [],
        warnings: ["search:no-query-or-subject-entities"],
      };
    }

    const warnings: string[] = [];
    const matchMap = new Map<string, SearchResolvedMatch>();

    if (query) {
      const results = searchEntities(query);

      if (results.length === 0) {
        warnings.push(`search:no-matches-for-query:${query}`);
      }

      for (const result of results.slice(0, MAX_SEARCH_QUERY_MATCHES)) {
        addMatch(matchMap, toSearchResolvedMatch(result, "question", query));
      }
    }

    if (subjectEntities.length > 0) {
      const index = getAllEntities();

      for (const ref of subjectEntities) {
        const entity = index.find(
          (candidate) => candidate.type === ref.type && candidate.id === ref.id,
        );

        if (!entity) {
          warnings.push(`search:subject-not-in-index:${ref.type}:${ref.id}`);
          continue;
        }

        const key = entityKey(entity.type, entity.id);
        const existing = matchMap.get(key);

        if (existing) {
          if (existing.matchSource === "question") {
            existing.matchReasons = mergeMatchReasons(existing.matchReasons, [
              {
                field: "Subject Entity",
                snippet: `Also in request scope: ${entity.name}`,
              },
            ]);
          }
          continue;
        }

        addMatch(matchMap, {
          entity,
          relevanceScore: SUBJECT_ENTITY_MATCH_RELEVANCE,
          matchReasons: [
            {
              field: "Subject Entity",
              snippet: `Scoped subject entity: ${entity.name} (${ref.type}:${ref.id})`,
            },
          ],
          matchSource: "subject-entity",
        });
      }
    }

    const matches = Array.from(matchMap.values()).sort(compareMatches);

    return { query, matches, warnings };
  }
}

function addMatch(
  matchMap: Map<string, SearchResolvedMatch>,
  match: SearchResolvedMatch,
): void {
  matchMap.set(entityKey(match.entity.type, match.entity.id), match);
}

function entityKey(
  type: SearchResolvedMatch["entity"]["type"],
  id: string,
): string {
  return `${type}:${id}`;
}

function mergeMatchReasons(
  existing: SearchResult["matchReasons"],
  additional: SearchResult["matchReasons"],
): SearchResult["matchReasons"] {
  const merged = [...existing, ...additional];
  const seen = new Set<string>();

  return merged.filter((reason) => {
    const key = `${reason.field}|${reason.snippet}`;

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function compareMatches(a: SearchResolvedMatch, b: SearchResolvedMatch): number {
  if (b.relevanceScore !== a.relevanceScore) {
    return b.relevanceScore - a.relevanceScore;
  }

  return entityKey(a.entity.type, a.entity.id).localeCompare(
    entityKey(b.entity.type, b.entity.id),
  );
}

/** Shared default resolver singleton. */
export const defaultSearchResolver = new SearchResolver();
