import { countries } from "@/lib/countries";
import { toCountryEntities } from "@/lib/countries.adapter";
import { companies } from "@/lib/companies";
import { toCompanyEntities } from "@/lib/companies.adapter";
import { universities } from "@/lib/universities";
import { toUniversityEntities } from "@/lib/universities.adapter";
import type { Entity, EntityType } from "@/lib/entity/entity.types";
import { getEntityTypeLabel } from "@/lib/entity/entity.helpers";

/** Searchable entity types in the global index */
export type SearchableEntityType = Extract<
  EntityType,
  "country" | "company" | "university"
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
];

/** Unified entity index — all modules normalized via adapters */
export function getAllEntities(): Entity[] {
  return [
    ...toCountryEntities(countries),
    ...toCompanyEntities(companies),
    ...toUniversityEntities(universities),
  ];
}

/** Module route for an entity detail page */
export function getEntityHref(entity: Entity): string {
  const routes: Record<SearchableEntityType, string> = {
    country: "/countries",
    company: "/companies",
    university: "/universities",
  };
  return routes[entity.type as SearchableEntityType] ?? "/search";
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
    entity.aiSummary,
    entity.icon ?? "",
    ...entity.tags.map((t) => t.label),
    ...Object.values(entity.metadata).map(String),
  ];
  return parts.join(" ").toLowerCase();
}

function scoreEntity(entity: Entity, tokens: string[]): SearchResult | null {
  if (tokens.length === 0) {
    return {
      entity,
      relevanceScore: entity.scores.aiScore,
      matchReasons: [{ field: "AI Score", snippet: `Ranked by AI score (${entity.scores.aiScore})` }],
    };
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

    if (entity.aiSummary.toLowerCase().includes(token)) {
      score += 15;
      reasons.push({ field: "AI Summary", snippet: truncate(entity.aiSummary, 80) });
    }

    if (text.includes(token) && score === 0) {
      score += 10;
      reasons.push({ field: "Metadata", snippet: `Matched "${token}" in profile` });
    }
  }

  if (score === 0) return null;

  // Boost high-performing entities slightly
  score += entity.scores.aiScore * 0.05;

  const uniqueReasons = reasons.filter(
    (r, i, arr) => arr.findIndex((x) => x.field === r.field && x.snippet === r.snippet) === i,
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
  if (entity.scores.aiScore < filters.minAiScore) return false;
  if (entity.scores.investmentScore < filters.minInvestmentScore) return false;
  if (entity.scores.riskScore > filters.maxRiskScore) return false;
  return true;
}

/** Core search function — mock frontend intelligence */
export function searchEntities(
  query: string,
  filters: SearchFilters = DEFAULT_SEARCH_FILTERS,
): SearchResult[] {
  const tokens = tokenize(query);
  const all = getAllEntities();

  const results = all
    .filter((entity) => passesFilters(entity, filters))
    .map((entity) => scoreEntity(entity, tokens))
    .filter((r): r is SearchResult => r !== null)
    .sort((a, b) => b.relevanceScore - a.relevanceScore);

  return results;
}

/** Generate AI insight panel content from search results */
export function generateSearchInsight(
  query: string,
  results: SearchResult[],
  filters: SearchFilters,
): SearchInsight {
  const tokens = tokenize(query);
  const hasQuery = tokens.length > 0;

  if (results.length === 0) {
    return {
      summary: hasQuery
        ? `No entities matched "${query}" with current filters.`
        : "Enter a query or adjust filters to explore the intelligence index.",
      topMatches: [],
      patterns: [],
      suggestedActions: [
        "Broaden your search terms",
        "Lower AI score threshold",
        "Increase max risk tolerance",
        "Switch entity type filter to All",
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

  const avgAi =
    results.reduce((s, r) => s + r.entity.scores.aiScore, 0) / results.length;
  const avgRisk =
    results.reduce((s, r) => s + r.entity.scores.riskScore, 0) / results.length;

  const patterns: string[] = [];
  const dominantType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0];
  if (dominantType) {
    patterns.push(
      `${dominantType[1]} of ${results.length} results are ${getEntityTypeLabel(dominantType[0] as EntityType)} entities`,
    );
  }
  if (avgAi >= 85) {
    patterns.push(`High AI readiness cluster — average score ${avgAi.toFixed(0)}/100`);
  }
  if (avgRisk <= 25) {
    patterns.push(`Low risk profile across results — average risk ${avgRisk.toFixed(0)}/100`);
  }
  if (filters.entityType !== "all") {
    patterns.push(`Filtered to ${getEntityTypeLabel(filters.entityType)} entities only`);
  }

  const suggestedActions: string[] = [];
  if (topThree[0]?.entity.type === "country") {
    suggestedActions.push(`Analyze ${topThree[0].entity.name} in Countries module`);
  }
  if (topThree.some((r) => r.entity.type === "company")) {
    suggestedActions.push("Compare top company AI readiness scores");
  }
  if (topThree.some((r) => r.entity.type === "university")) {
    suggestedActions.push("Review university research partnerships");
  }
  suggestedActions.push("Run analysis in CBAI Core");
  suggestedActions.push("Export results for briefing");

  return {
    summary: hasQuery
      ? `Found ${results.length} entities matching "${query}" across the CBAI intelligence index.`
      : `Showing ${results.length} entities ranked by AI score across all modules.`,
    topMatches: topThree.map(
      (r) => `${r.entity.name} (${getEntityTypeLabel(r.entity.type)}, score ${r.relevanceScore})`,
    ),
    patterns,
    suggestedActions: suggestedActions.slice(0, 4),
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
  };
}
