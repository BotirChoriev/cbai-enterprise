import { searchEntities } from "@/lib/global-search";
import type { Entity } from "@/lib/entity/entity.types";
import {
  buildSearchIntelligenceCatalog,
  buildSearchIntelligenceRecord,
  buildSearchIntelligenceRecordFromEntity,
} from "@/lib/search-intelligence/search-intelligence.builder";
import type {
  SearchIntelligenceCatalog,
  SearchIntelligenceMatch,
  SearchIntelligenceRecord,
  SearchIntelligenceResponse,
} from "@/lib/search-intelligence/search-intelligence.types";

let cachedCatalog: SearchIntelligenceCatalog | null = null;

export function getSearchIntelligenceCatalog(): SearchIntelligenceCatalog {
  if (!cachedCatalog) {
    cachedCatalog = buildSearchIntelligenceCatalog();
  }
  return cachedCatalog;
}

export function rebuildSearchIntelligenceCatalog(): SearchIntelligenceCatalog {
  cachedCatalog = buildSearchIntelligenceCatalog();
  return cachedCatalog;
}

export function getSearchIntelligenceRecord(
  entityId: string,
): SearchIntelligenceRecord | null {
  return buildSearchIntelligenceRecord(entityId);
}

export function getSearchIntelligenceRecordByLegacyId(
  entityType: "country" | "company" | "university",
  legacyId: string,
): SearchIntelligenceRecord | null {
  const catalog = getSearchIntelligenceCatalog();
  return (
    catalog.records.find(
      (record) => record.entityType === entityType && record.entityId.endsWith(legacyId),
    ) ?? null
  );
}

function tokenize(query: string): string[] {
  return query
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .filter((token) => token.length > 0);
}

function matchedTokensForEntity(entity: Entity, tokens: readonly string[]): string[] {
  const haystack = [
    entity.name,
    entity.category,
    entity.subtitle ?? "",
    entity.overview,
    ...entity.tags.map((tag) => tag.label),
  ]
    .join(" ")
    .toLowerCase();

  return tokens.filter((token) => haystack.includes(token));
}

/** Execute registry token search — alphabetical order, no relevance ranking displayed. */
export function executeSearchIntelligence(query: string): SearchIntelligenceResponse {
  const trimmed = query.trim();
  if (!trimmed) {
    return { query: "", matches: [], hasResults: false };
  }

  const tokens = tokenize(trimmed);
  const entityResults = searchEntities(trimmed);

  const matches = entityResults
    .map((result) => {
      const record = buildSearchIntelligenceRecordFromEntity(result.entity);
      if (!record) return null;
      return {
        record,
        matchedTokens: matchedTokensForEntity(result.entity, tokens) as readonly string[],
      };
    })
    .filter((match): match is SearchIntelligenceMatch => match !== null)
    .sort((a, b) => a.record.displayName.localeCompare(b.record.displayName));

  return {
    query: trimmed,
    matches,
    hasResults: matches.length > 0,
  };
}

export function listSearchIntelligenceByType(
  entityType: "country" | "company" | "university",
): readonly SearchIntelligenceRecord[] {
  return getSearchIntelligenceCatalog().byEntityType[entityType];
}

export function entityTypeLabel(entityType: SearchIntelligenceRecord["entityType"]): string {
  switch (entityType) {
    case "country":
      return "Country";
    case "company":
      return "Company";
    case "university":
      return "University";
  }
}
