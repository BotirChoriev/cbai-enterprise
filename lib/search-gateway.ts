/**
 * CBAI Global Search Gateway — content, routing, and future-ready schema.
 * Platform layer only. Static honest copy. i18n-ready. Zero demo policy.
 */

import { industries } from "@/lib/companies";
import type { SearchResult } from "@/lib/global-search";
import { searchEntities } from "@/lib/global-search";
import { EVIDENCE_NOT_CONNECTED_LABEL } from "@/lib/platform-home";

export type SearchResultGroupId =
  | "countries"
  | "companies"
  | "universities"
  | "knowledge"
  | "evidence"
  | "future_modules";

export type EvidenceDisplayStatus =
  | "Registry available"
  | "Evidence connected"
  | "Evidence unavailable";

export type SearchTopicResultGroup = Extract<
  SearchResultGroupId,
  "knowledge" | "evidence" | "future_modules"
>;

export type SearchTopicDefinition = {
  id: string;
  label: string;
  keywords: readonly string[];
  platformArea: string;
  resultGroup: SearchTopicResultGroup;
  connected: boolean;
  href?: string;
  evidenceStatus: EvidenceDisplayStatus;
  availableInformation: string;
  route: string;
};

export type SearchTopicMatch = SearchTopicDefinition & {
  matchReason: string;
};

export type SearchResultGroup = {
  id: SearchResultGroupId;
  label: string;
  entities: SearchResult[];
  topics: SearchTopicMatch[];
};

export type GatewaySearchResponse = {
  query: string;
  groups: SearchResultGroup[];
  hasResults: boolean;
};

export type SearchableCategory = {
  id: string;
  label: string;
  connected: boolean;
  description: string;
};

export type ExploreCategory = {
  id: string;
  label: string;
  href?: string;
  connected: boolean;
  searchQuery?: string;
};

export type SearchPersonaEntry = {
  id: string;
  title: string;
  exampleQuery: string;
  href: string;
};

/** Declared capabilities — not implemented (future-ready architecture). */
export type SearchFutureCapability = {
  id: string;
  label: string;
  status: "planned";
  note: string;
};

export const SEARCH_GATEWAY = {
  eyebrow: "Global Search Gateway",
  headline: "Primary entry point into the CBAI Evidence Intelligence Platform",
  explanation:
    "Search routes you to verified local registries and declared platform areas. It never invents entities, guesses intent, or fabricates intelligence.",
  whatCanISearchTitle: "What can I search?",
  whatCanISearchDescription:
    "Countries, companies, and universities from local registries today. Topic areas map to connected modules or honestly labeled future evidence sources.",
  placeholder:
    "Search countries, companies, universities, procurement, governance…",
  emptyPrompt:
    "Enter a query to search verified local registries and declared topic routes.",
  noResultsMessage: "No matching evidence currently exists.",
  noResultsDetail:
    "This query did not match any entity in local catalogs or declared topic routes. CBAI does not fabricate results.",
  supportedSearchesLabel: "Supported searches",
} as const;

export const SEARCH_SUPPORTED_SUGGESTIONS = [
  "Japan",
  "NVIDIA",
  "Harvard",
  "Governance",
  "Automotive",
  "Public Procurement",
  "Human Rights",
  "Infrastructure",
] as const;

export const SEARCHABLE_CATEGORIES: SearchableCategory[] = [
  {
    id: "country",
    label: "Country",
    connected: true,
    description: "Local country registry profiles.",
  },
  {
    id: "company",
    label: "Company",
    connected: true,
    description: "Local company catalog records.",
  },
  {
    id: "university",
    label: "University",
    connected: true,
    description: "Local university registry profiles.",
  },
  {
    id: "public-institution",
    label: "Public Institution",
    connected: true,
    description: "Routes to country and university registries.",
  },
  {
    id: "industry",
    label: "Industry",
    connected: true,
    description: "Company catalog industry classifications.",
  },
  {
    id: "procurement",
    label: "Procurement",
    connected: false,
    description: "Future module — evidence source not connected.",
  },
  {
    id: "governance",
    label: "Governance",
    connected: true,
    description: "Routes to country registry governance fields.",
  },
  {
    id: "human-rights",
    label: "Human Rights",
    connected: false,
    description: "Future module — evidence source not connected.",
  },
  {
    id: "infrastructure",
    label: "Infrastructure",
    connected: false,
    description: "Future module — evidence source not connected.",
  },
  {
    id: "natural-resources",
    label: "Natural Resources",
    connected: false,
    description: "Future module — evidence source not connected.",
  },
  {
    id: "economic-sector",
    label: "Economic Sector",
    connected: false,
    description: "Future module — sector evidence not connected.",
  },
];

export const SEARCH_EXPLORE_CATEGORIES: ExploreCategory[] = [
  { id: "countries", label: "Countries", href: "/countries", connected: true },
  { id: "companies", label: "Companies", href: "/companies", connected: true },
  {
    id: "universities",
    label: "Universities",
    href: "/universities",
    connected: true,
  },
  {
    id: "governance",
    label: "Governance",
    href: "/countries",
    connected: true,
    searchQuery: "Governance",
  },
  {
    id: "procurement",
    label: "Procurement",
    connected: false,
    searchQuery: "Public Procurement",
  },
  {
    id: "human-rights",
    label: "Human Rights",
    connected: false,
    searchQuery: "Human Rights",
  },
  {
    id: "infrastructure",
    label: "Infrastructure",
    connected: false,
    searchQuery: "Infrastructure",
  },
  {
    id: "economy",
    label: "Economy",
    connected: false,
    searchQuery: "Economic Sector",
  },
  {
    id: "education",
    label: "Education",
    href: "/universities",
    connected: true,
    searchQuery: "Education",
  },
];

export const SEARCH_PERSONAS: SearchPersonaEntry[] = [
  {
    id: "citizen",
    title: "Citizen",
    exampleQuery: "Japan",
    href: "/search?q=Japan",
  },
  {
    id: "investor",
    title: "Investor",
    exampleQuery: "Automotive",
    href: "/search?q=Automotive",
  },
  {
    id: "government",
    title: "Government",
    exampleQuery: "Governance",
    href: "/search?q=Governance",
  },
  {
    id: "student",
    title: "Student",
    exampleQuery: "Harvard",
    href: "/search?q=Harvard",
  },
  {
    id: "researcher",
    title: "Researcher",
    exampleQuery: "NVIDIA",
    href: "/search?q=NVIDIA",
  },
  {
    id: "academic",
    title: "Academic",
    exampleQuery: "Education",
    href: "/search?q=Education",
  },
];

export const SEARCH_FUTURE_CAPABILITIES: SearchFutureCapability[] = [
  {
    id: "multilingual",
    label: "Multilingual search",
    status: "planned",
    note: "Locale bundles prepared in SEARCH_GATEWAY_LOCALES.",
  },
  {
    id: "synonyms",
    label: "Synonyms",
    status: "planned",
    note: "Topic keyword expansion without inventing entities.",
  },
  {
    id: "filters",
    label: "Filters",
    status: "planned",
    note: "Entity-type and evidence-status filters.",
  },
  {
    id: "saved-searches",
    label: "Saved searches",
    status: "planned",
    note: "User-persisted queries — requires authenticated storage.",
  },
  {
    id: "search-history",
    label: "Search history",
    status: "planned",
    note: "Local session history — no fabricated activity feeds.",
  },
  {
    id: "api",
    label: "Search API",
    status: "planned",
    note: "Programmatic gateway access on platform roadmap.",
  },
  {
    id: "semantic",
    label: "Semantic search",
    status: "planned",
    note: "Requires connected evidence embeddings — not active.",
  },
];

export const SEARCH_PIPELINE_STAGES = [
  "Query",
  "Entity Resolution",
  "Evidence",
  "Reasoning",
  "Decision Intelligence",
] as const;

const industryKeywords = industries.map((industry) => industry.toLowerCase());

export const SEARCH_TOPICS: SearchTopicDefinition[] = [
  {
    id: "governance",
    label: "Governance",
    keywords: ["governance", "government", "policy", "regulation"],
    platformArea: "Countries module",
    resultGroup: "knowledge",
    connected: true,
    href: "/countries",
    evidenceStatus: "Evidence connected",
    availableInformation: "Government form labels and country reference profiles.",
    route: "/countries",
  },
  {
    id: "education",
    label: "Education",
    keywords: ["education", "school", "academic", "learning"],
    platformArea: "Universities module",
    resultGroup: "knowledge",
    connected: true,
    href: "/universities",
    evidenceStatus: "Evidence connected",
    availableInformation: "University catalog profiles from local registry.",
    route: "/universities",
  },
  {
    id: "public-institution",
    label: "Public Institution",
    keywords: [
      "public institution",
      "public sector",
      "institution",
      "agency",
      "ministry",
    ],
    platformArea: "Countries module",
    resultGroup: "knowledge",
    connected: true,
    href: "/countries",
    evidenceStatus: "Registry available",
    availableInformation:
      "Country registry government forms; university public institution records where listed.",
    route: "/countries",
  },
  {
    id: "industry",
    label: "Industry",
    keywords: ["industry", "sector", ...industryKeywords],
    platformArea: "Companies module",
    resultGroup: "knowledge",
    connected: true,
    href: "/companies",
    evidenceStatus: "Registry available",
    availableInformation: "Company catalog industry classifications only.",
    route: "/companies",
  },
  {
    id: "evidence-layer",
    label: "Evidence",
    keywords: ["evidence", "provenance", "source attribution", "sources"],
    platformArea: "Knowledge module",
    resultGroup: "evidence",
    connected: true,
    href: "/knowledge",
    evidenceStatus: "Evidence connected",
    availableInformation: "Evidence policy and source attribution documentation.",
    route: "/knowledge",
  },
  {
    id: "public-procurement",
    label: "Public Procurement",
    keywords: ["procurement", "tender", "contract", "public procurement"],
    platformArea: "Procurement Intelligence (planned)",
    resultGroup: "future_modules",
    connected: false,
    evidenceStatus: "Evidence unavailable",
    availableInformation: "None — module not connected.",
    route: EVIDENCE_NOT_CONNECTED_LABEL,
  },
  {
    id: "human-rights",
    label: "Human Rights",
    keywords: ["human rights", "rights", "civil liberties"],
    platformArea: "Human Rights Intelligence (planned)",
    resultGroup: "future_modules",
    connected: false,
    evidenceStatus: "Evidence unavailable",
    availableInformation: "None — dedicated evidence source not connected.",
    route: EVIDENCE_NOT_CONNECTED_LABEL,
  },
  {
    id: "infrastructure",
    label: "Infrastructure",
    keywords: [
      "infrastructure",
      "transport",
      "roads",
      "bridges",
      "utilities",
      "construction",
    ],
    platformArea: "Infrastructure Intelligence (planned)",
    resultGroup: "future_modules",
    connected: false,
    evidenceStatus: "Evidence unavailable",
    availableInformation: "None — infrastructure evidence source not connected.",
    route: EVIDENCE_NOT_CONNECTED_LABEL,
  },
  {
    id: "natural-resources",
    label: "Natural Resources",
    keywords: [
      "natural resources",
      "minerals",
      "mining",
      "oil",
      "gas",
      "water",
      "forestry",
    ],
    platformArea: "Natural Resources Intelligence (planned)",
    resultGroup: "future_modules",
    connected: false,
    evidenceStatus: "Evidence unavailable",
    availableInformation: "None — natural resource datasets not connected.",
    route: EVIDENCE_NOT_CONNECTED_LABEL,
  },
  {
    id: "economic-sector",
    label: "Economic Sector",
    keywords: [
      "economic sector",
      "economy",
      "gdp",
      "fiscal",
      "macroeconomic",
      "economic",
    ],
    platformArea: "Economic Intelligence (planned)",
    resultGroup: "future_modules",
    connected: false,
    evidenceStatus: "Evidence unavailable",
    availableInformation: "None — sector-level economic evidence not connected.",
    route: EVIDENCE_NOT_CONNECTED_LABEL,
  },
];

const GROUP_LABELS: Record<SearchResultGroupId, string> = {
  countries: "Countries",
  companies: "Companies",
  universities: "Universities",
  knowledge: "Knowledge",
  evidence: "Evidence",
  future_modules: "Future Modules",
};

function tokenize(query: string): string[] {
  return query
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .filter((token) => token.length > 0);
}

function topicMatchesQuery(topic: SearchTopicDefinition, query: string): string | null {
  const normalizedQuery = query.toLowerCase().trim();
  const tokens = tokenize(query);

  if (normalizedQuery.includes(topic.label.toLowerCase())) {
    return `Matched topic: ${topic.label}`;
  }

  for (const keyword of topic.keywords) {
    if (normalizedQuery.includes(keyword.toLowerCase())) {
      return `Matched keyword: ${keyword}`;
    }
  }

  for (const token of tokens) {
    if (topic.label.toLowerCase().includes(token)) {
      return `Matched topic label fragment: ${token}`;
    }
    const keywordHit = topic.keywords.find((keyword) =>
      keyword.toLowerCase().includes(token),
    );
    if (keywordHit) {
      return `Matched keyword fragment: ${keywordHit}`;
    }
  }

  return null;
}

export function matchSearchTopics(query: string): SearchTopicMatch[] {
  const trimmed = query.trim();
  if (!trimmed) {
    return [];
  }

  return SEARCH_TOPICS.flatMap((topic) => {
    const matchReason = topicMatchesQuery(topic, trimmed);
    return matchReason ? [{ ...topic, matchReason }] : [];
  });
}

export function executeGatewaySearch(query: string): GatewaySearchResponse {
  const trimmed = query.trim();
  if (!trimmed) {
    return { query: "", groups: [], hasResults: false };
  }

  const entityResults = searchEntities(trimmed);
  const topicMatches = matchSearchTopics(trimmed);

  const knowledgeTopics = topicMatches.filter(
    (topic) => topic.resultGroup === "knowledge",
  );
  const evidenceTopics = topicMatches.filter(
    (topic) => topic.resultGroup === "evidence",
  );
  const futureTopics = topicMatches.filter(
    (topic) => topic.resultGroup === "future_modules",
  );

  const groups = [
    {
      id: "countries" as const,
      label: GROUP_LABELS.countries,
      entities: entityResults.filter((result) => result.entity.type === "country"),
      topics: [],
    },
    {
      id: "companies" as const,
      label: GROUP_LABELS.companies,
      entities: entityResults.filter((result) => result.entity.type === "company"),
      topics: [],
    },
    {
      id: "universities" as const,
      label: GROUP_LABELS.universities,
      entities: entityResults.filter(
        (result) => result.entity.type === "university",
      ),
      topics: [],
    },
    {
      id: "knowledge" as const,
      label: GROUP_LABELS.knowledge,
      entities: [],
      topics: knowledgeTopics,
    },
    {
      id: "evidence" as const,
      label: GROUP_LABELS.evidence,
      entities: [],
      topics: evidenceTopics,
    },
    {
      id: "future_modules" as const,
      label: GROUP_LABELS.future_modules,
      entities: [],
      topics: futureTopics,
    },
  ].filter(
    (group) => group.entities.length > 0 || group.topics.length > 0,
  ) satisfies SearchResultGroup[];

  return {
    query: trimmed,
    groups,
    hasResults: groups.length > 0,
  };
}

/** i18n-ready locale registry — multilingual search not yet active. */
export type SearchGatewayLocale = {
  code: string;
  available: boolean;
};

export const SEARCH_GATEWAY_LOCALES: SearchGatewayLocale[] = [
  { code: "en", available: true },
  { code: "uz", available: false },
  { code: "es", available: false },
  { code: "fr", available: false },
  { code: "ar", available: false },
  { code: "zh", available: false },
  { code: "ja", available: false },
  { code: "ko", available: false },
  { code: "ru", available: false },
];

/** Backward-compatible exports for prior gateway components. */
export const SEARCH_QUICK_ACCESS = SEARCH_EXPLORE_CATEGORIES;
export const SEARCH_EXAMPLE_QUERIES = SEARCH_SUPPORTED_SUGGESTIONS;
