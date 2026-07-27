import { countries } from "@/lib/countries";
import { toCountryEntities } from "@/lib/countries.adapter";
import { companies } from "@/lib/companies";
import { toCompanyEntities } from "@/lib/companies.adapter";
import { universities } from "@/lib/universities";
import { toUniversityEntities } from "@/lib/universities.adapter";
import { RESEARCH_TOPICS, getResearchTopicPath } from "@/lib/research/research-topics";
import { toResearchTopicEntities } from "@/lib/research-topic.adapter";
import { loadProjects } from "@/lib/project/project-store";
import { toProjectEntities } from "@/lib/project/project.adapter";
import type { Entity, EntityType } from "@/lib/entity/entity.types";
import { getEntityTypeLabel } from "@/lib/entity/entity.helpers";

/** Searchable entity types in the global index */
export type SearchableEntityType = Extract<
  EntityType,
  "country" | "company" | "university" | "research_topic" | "project"
>;

export type EntityTypeFilter = SearchableEntityType | "all";

export type SearchFilters = {
  entityType: EntityTypeFilter;
  minAiScore: number;
  minInvestmentScore: number;
  maxRiskScore: number;
};

export type SearchMatchReason = {
  field: string;
  snippet: string;
};

export type SearchConfidence = "exact" | "alias" | "prefix" | "fuzzy" | "weak";

export type SearchResult = {
  entity: Entity;
  relevanceScore: number;
  matchReasons: SearchMatchReason[];
  /** How strongly the query matches a verified registry record. */
  confidence: SearchConfidence;
  /** Fraction of query tokens that contributed a name/tag hit (0–1). */
  tokenCoverage: number;
};

export type SearchInsight = {
  topMatches: string[];
  patterns: string[];
  suggestedActions: string[];
  summary: string;
};

export const DEFAULT_SEARCH_FILTERS: SearchFilters = {
  entityType: "all",
  minAiScore: 0,
  minInvestmentScore: 0,
  maxRiskScore: 100,
};

export const SEARCHABLE_ENTITY_TYPES: SearchableEntityType[] = [
  "country",
  "company",
  "university",
  "research_topic",
  "project",
];

const INSUFFICIENT_EVIDENCE = "insufficient evidence";

/**
 * Unified entity index — all modules normalized via adapters. Projects come from real local
 * storage (empty during static generation/SSR, real once client-side — same as every other
 * localStorage-backed store in this platform), so this function is safe to call anywhere.
 */
export function getAllEntities(): Entity[] {
  return [
    ...toCountryEntities(countries),
    ...toCompanyEntities(companies),
    ...toUniversityEntities(universities),
    ...toResearchTopicEntities(RESEARCH_TOPICS),
    ...toProjectEntities(loadProjects()),
  ];
}

/** Module route for an entity detail page */
export function getEntityHref(entity: Entity): string {
  const routes: Record<SearchableEntityType, string> = {
    country: "/countries",
    company: "/companies",
    university: "/universities",
    research_topic: "/research",
    project: "/my-work",
  };
  return routes[entity.type as SearchableEntityType] ?? "/search";
}

/** Deep link to entity within module using Platform Context params. */
export function getEntityDetailHref(entity: Entity, searchQuery?: string): string {
  return buildPlatformEntityHref(entity, { searchQuery });
}

/**
 * Platform Context–compatible entity href. Research topics are routed by path segment
 * (`/research/[topicId]`), not a query param like country/company/university, so they resolve
 * directly to their real profile path — the search query is not appended there since the topic
 * page itself has no `?q=` param to consume.
 */
export function buildPlatformEntityHref(
  entity: Entity,
  options?: { searchQuery?: string },
): string {
  if (entity.type === "research_topic") {
    return getResearchTopicPath(entity.id);
  }
  if (entity.type === "project") {
    return `/my-work?project=${entity.id}`;
  }

  const params = new URLSearchParams();

  switch (entity.type) {
    case "country":
      params.set("country", entity.id);
      break;
    case "company":
      params.set("company", entity.id);
      break;
    case "university":
      params.set("university", entity.id);
      break;
  }

  if (options?.searchQuery?.trim()) {
    params.set("q", options.searchQuery.trim());
  }

  const query = params.toString();
  return query ? `${getEntityHref(entity)}?${query}` : getEntityHref(entity);
}

function normalizeSearchText(value: string): string {
  return value
    .normalize("NFKC")
    .toLocaleLowerCase("en-US")
    .replace(/[’‘ʻʼ`´]/g, "'")
    .replace(/['']/g, "")
    .replace(/[^\p{L}\p{N}\s]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(query: string): string[] {
  return normalizeSearchText(query)
    .split(/\s+/)
    .filter((t) => t.length > 0);
}

/** Bounded Levenshtein for typo tolerance (short tokens only). */
function editDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  if (Math.abs(a.length - b.length) > 2) return 99;
  const prev = new Array(b.length + 1);
  const cur = new Array(b.length + 1);
  for (let j = 0; j <= b.length; j++) prev[j] = j;
  for (let i = 1; i <= a.length; i++) {
    cur[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      cur[j] = Math.min(cur[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
    }
    for (let j = 0; j <= b.length; j++) prev[j] = cur[j];
  }
  return prev[b.length];
}

function fuzzyTokenScore(token: string, candidate: string): number {
  if (!token || !candidate) return 0;
  if (candidate === token) return 100;
  if (candidate.startsWith(token)) return 80;
  if (candidate.includes(token)) return 60;
  if (token.length >= 5 && candidate.length >= 5) {
    const dist = editDistance(token, candidate);
    if (dist === 1) return 55;
    if (dist === 2 && token.length >= 7) return 40;
  }
  return 0;
}

function searchableText(entity: Entity): string {
  const parts = [
    entity.name,
    entity.category,
    entity.subtitle ?? "",
    entity.overview,
    entity.icon ?? "",
    ...entity.tags.map((t) => t.label),
    ...Object.values(entity.metadata).map(String),
  ];
  return normalizeSearchText(parts.join(" "));
}

function scoreEntity(entity: Entity, tokens: string[]): SearchResult | null {
  if (tokens.length === 0) {
    return null;
  }

  const nameLower = normalizeSearchText(entity.name);
  const nameTokens = nameLower.split(/\s+/).filter(Boolean);
  const text = searchableText(entity);
  let score = 0;
  let coveredTokens = 0;
  let bestTier: SearchConfidence = "weak";
  const reasons: SearchMatchReason[] = [];

  const promote = (tier: SearchConfidence) => {
    const order: SearchConfidence[] = ["weak", "fuzzy", "prefix", "alias", "exact"];
    if (order.indexOf(tier) > order.indexOf(bestTier)) bestTier = tier;
  };

  for (const token of tokens) {
    let tokenHit = false;

    if (nameLower === token) {
      score += 100;
      tokenHit = true;
      promote("exact");
      reasons.push({ field: "Name", snippet: `Exact match: ${entity.name}` });
    } else if (nameLower.startsWith(token) && token.length >= 3) {
      score += 80;
      tokenHit = true;
      promote("prefix");
      reasons.push({ field: "Name", snippet: `Starts with "${token}"` });
    } else if (nameLower.includes(token) && token.length >= 3) {
      score += 60;
      tokenHit = true;
      promote(token.length >= 6 ? "alias" : "prefix");
      reasons.push({ field: "Name", snippet: `Contains "${token}"` });
    } else {
      let bestFuzzy = 0;
      let fuzzyHit = "";
      for (const nameToken of nameTokens) {
        const fuzzy = fuzzyTokenScore(token, nameToken);
        if (fuzzy > bestFuzzy) {
          bestFuzzy = fuzzy;
          fuzzyHit = nameToken;
        }
      }
      if (bestFuzzy >= 40) {
        score += bestFuzzy;
        tokenHit = true;
        promote(bestFuzzy >= 55 ? "fuzzy" : "weak");
        reasons.push({
          field: "Name",
          snippet: bestFuzzy >= 55 ? `Close match: ${fuzzyHit}` : `Similar token: ${fuzzyHit}`,
        });
      }
    }

    const matchingTag = entity.tags.find((t) =>
      normalizeSearchText(t.label).includes(token),
    );
    if (matchingTag) {
      score += 40;
      tokenHit = true;
      promote("alias");
      reasons.push({ field: "Tag", snippet: matchingTag.label });
    }

    if (normalizeSearchText(entity.category).includes(token)) {
      score += 25;
      tokenHit = true;
      reasons.push({ field: "Category", snippet: entity.category });
    }

    if (normalizeSearchText(entity.overview).includes(token)) {
      score += 20;
      reasons.push({ field: "Overview", snippet: truncate(entity.overview, 80) });
    }

    const summarySearchable =
      entity.aiSummary &&
      !entity.aiSummary.toLowerCase().includes(INSUFFICIENT_EVIDENCE);

    if (summarySearchable && normalizeSearchText(entity.aiSummary).includes(token)) {
      score += 15;
      reasons.push({
        field: "Summary",
        snippet: truncate(entity.aiSummary, 80),
      });
    }

    if (text.includes(token) && !tokenHit) {
      score += 10;
      reasons.push({ field: "Registry", snippet: `Matched "${token}" in profile` });
    }

    if (tokenHit) coveredTokens += 1;
  }

  if (score === 0) return null;

  const tokenCoverage = coveredTokens / tokens.length;
  // Multi-token queries need majority coverage — otherwise "toshkent … unversetiti"
  // must not promote an unrelated Tashkent university as a verified hit.
  if (tokens.length >= 3 && tokenCoverage < 0.5) {
    bestTier = "weak";
  } else if (tokens.length >= 2 && tokenCoverage < 0.4) {
    bestTier = "weak";
  }

  const uniqueReasons = reasons.filter(
    (r, i, arr) =>
      arr.findIndex((x) => x.field === r.field && x.snippet === r.snippet) === i,
  );

  return {
    entity,
    relevanceScore: Math.round(score),
    matchReasons: uniqueReasons.slice(0, 3),
    confidence: bestTier,
    tokenCoverage,
  };
}

/** Strong enough to present as a verified registry match (never invent records). */
export function isConfidentSearchResult(result: SearchResult): boolean {
  return result.confidence !== "weak" && result.tokenCoverage >= 0.5;
}

function truncate(text: string, max: number): string {
  return text.length <= max ? text : `${text.slice(0, max)}…`;
}

function passesFilters(entity: Entity, filters: SearchFilters): boolean {
  if (filters.entityType !== "all" && entity.type !== filters.entityType) {
    return false;
  }
  return true;
}

/** Score every local registry entity (includes weak closest matches). */
export function rankEntities(
  query: string,
  filters: SearchFilters = DEFAULT_SEARCH_FILTERS,
): SearchResult[] {
  const tokens = tokenize(query);
  if (tokens.length === 0) {
    return [];
  }

  const all = getAllEntities();

  return all
    .filter((entity) => passesFilters(entity, filters))
    .map((entity) => scoreEntity(entity, tokens))
    .filter((r): r is SearchResult => r !== null)
    .sort((a, b) => b.relevanceScore - a.relevanceScore);
}

/**
 * Core search — local registries only.
 * Returns confident matches. Use `closestRegistryMatches` when empty for honest UX.
 */
export function searchEntities(
  query: string,
  filters: SearchFilters = DEFAULT_SEARCH_FILTERS,
): SearchResult[] {
  return rankEntities(query, filters).filter(isConfidentSearchResult);
}

/** Closest registry rows when the query is not in the current catalog (never fabricated). */
export function closestRegistryMatches(
  query: string,
  filters: SearchFilters = DEFAULT_SEARCH_FILTERS,
  limit = 3,
): SearchResult[] {
  return rankEntities(query, filters)
    .filter((r) => !isConfidentSearchResult(r))
    .slice(0, limit);
}

/** Honest insight summary for downstream modules (no fabricated patterns). */
export function generateSearchInsight(
  query: string,
  results: SearchResult[],
  filters: SearchFilters,
): SearchInsight {
  const tokens = tokenize(query);
  const hasQuery = tokens.length > 0;

  if (!hasQuery) {
    return {
      summary: "Enter a query to search verified local entity registries.",
      topMatches: [],
      patterns: [],
      suggestedActions: [],
    };
  }

  if (results.length === 0) {
    const closest = closestRegistryMatches(query, filters, 3);
    return {
      summary: `Not in the current registry for "${query}".`,
      topMatches: closest.map(
        (r) => `${r.entity.name} (${getEntityTypeLabel(r.entity.type)}) — closest, not a verified hit`,
      ),
      patterns: closest.length
        ? ["Closest local registry rows shown for orientation only — not invented records"]
        : [],
      suggestedActions: [
        "Create a research request or connect an official source",
        "Try a country, company, or university name from local catalogs",
      ],
    };
  }

  const topThree = results.slice(0, 3);
  const typeCounts = results.reduce(
    (acc, r) => {
      acc[r.entity.type] = (acc[r.entity.type] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const patterns: string[] = [];
  const dominantType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0];
  if (dominantType) {
    patterns.push(
      `${dominantType[1]} of ${results.length} matches are ${getEntityTypeLabel(dominantType[0] as EntityType)} records from local registries`,
    );
  }
  if (filters.entityType !== "all") {
    patterns.push(`Filtered to ${getEntityTypeLabel(filters.entityType)} entities only`);
  }

  return {
    summary: `${results.length} verified local ${results.length === 1 ? "entity" : "entities"} matched "${query}".`,
    topMatches: topThree.map(
      (r) =>
        `${r.entity.name} (${getEntityTypeLabel(r.entity.type)})`,
    ),
    patterns,
    suggestedActions: topThree.map(
      (r) => `Open ${r.entity.name} in ${getEntityTypeLabel(r.entity.type)} module`,
    ),
  };
}

/** Entity counts per type for filter badges */
export function getEntityCounts(): Record<EntityTypeFilter, number> {
  const all = getAllEntities();
  return {
    all: all.length,
    country: all.filter((e) => e.type === "country").length,
    company: all.filter((e) => e.type === "company").length,
    university: all.filter((e) => e.type === "university").length,
    research_topic: all.filter((e) => e.type === "research_topic").length,
    project: all.filter((e) => e.type === "project").length,
  };
}
