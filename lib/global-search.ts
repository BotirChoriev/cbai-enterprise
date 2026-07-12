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

export type SearchResult = {
  entity: Entity;
  relevanceScore: number;
  matchReasons: SearchMatchReason[];
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

function tokenize(query: string): string[] {
  return query
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .filter((t) => t.length > 0);
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
  return parts.join(" ").toLowerCase();
}

function scoreEntity(entity: Entity, tokens: string[]): SearchResult | null {
  if (tokens.length === 0) {
    return null;
  }

  const nameLower = entity.name.toLowerCase();
  const text = searchableText(entity);
  let score = 0;
  const reasons: SearchMatchReason[] = [];

  for (const token of tokens) {
    if (nameLower === token) {
      score += 100;
      reasons.push({ field: "Name", snippet: `Exact match: ${entity.name}` });
    } else if (nameLower.startsWith(token)) {
      score += 80;
      reasons.push({ field: "Name", snippet: `Starts with "${token}"` });
    } else if (nameLower.includes(token)) {
      score += 60;
      reasons.push({ field: "Name", snippet: `Contains "${token}"` });
    }

    const matchingTag = entity.tags.find((t) =>
      t.label.toLowerCase().includes(token),
    );
    if (matchingTag) {
      score += 40;
      reasons.push({ field: "Tag", snippet: matchingTag.label });
    }

    if (entity.category.toLowerCase().includes(token)) {
      score += 25;
      reasons.push({ field: "Category", snippet: entity.category });
    }

    if (entity.overview.toLowerCase().includes(token)) {
      score += 20;
      reasons.push({ field: "Overview", snippet: truncate(entity.overview, 80) });
    }

    const summarySearchable =
      entity.aiSummary &&
      !entity.aiSummary.toLowerCase().includes(INSUFFICIENT_EVIDENCE);

    if (summarySearchable && entity.aiSummary.toLowerCase().includes(token)) {
      score += 15;
      reasons.push({
        field: "Summary",
        snippet: truncate(entity.aiSummary, 80),
      });
    }

    if (text.includes(token) && score === 0) {
      score += 10;
      reasons.push({ field: "Registry", snippet: `Matched "${token}" in profile` });
    }
  }

  if (score === 0) return null;

  const uniqueReasons = reasons.filter(
    (r, i, arr) =>
      arr.findIndex((x) => x.field === r.field && x.snippet === r.snippet) === i,
  );

  return {
    entity,
    relevanceScore: Math.round(score),
    matchReasons: uniqueReasons.slice(0, 3),
  };
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

/** Core search — local registries only, no score boosting or empty-query browsing. */
export function searchEntities(
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
    return {
      summary: `No verified local entity matched "${query}".`,
      topMatches: [],
      patterns: [],
      suggestedActions: [
        "Try a country, company, or university name from local catalogs",
        "Check topic areas for planned evidence modules",
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
