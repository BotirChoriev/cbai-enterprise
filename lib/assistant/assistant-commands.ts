/**
 * Assistant command routing — a deterministic phrase-to-route table and a small set of
 * deterministic parameterized patterns ("find country X"), never a reasoning engine. Voice and
 * typed input both resolve through this same matcher and land on real, already-existing routes
 * and real catalog lookups; there is no model call, fuzzy AI matching, or fabricated confidence
 * anywhere in this file.
 */

import { getEntityDetailHref, searchEntities } from "@/lib/global-search";
import { filterResearchTopics, getResearchTopicPath, RESEARCH_TOPICS } from "@/lib/research/research-topics";

export type AssistantCommand = {
  id: string;
  phrase: string;
  href: string;
  keywords: readonly string[];
};

export const ASSISTANT_COMMANDS: readonly AssistantCommand[] = [
  {
    id: "open-my-work",
    phrase: "Open my work",
    href: "/my-work",
    keywords: ["my work", "open my work"],
  },
  {
    id: "open-research",
    phrase: "Open Research",
    href: "/research",
    keywords: ["open research"],
  },
  {
    id: "continue-research",
    phrase: "Continue research",
    href: "/research/workspace",
    keywords: ["continue research", "research workspace", "continue my research"],
  },
  {
    id: "todays-changes",
    phrase: "Show today's changes",
    href: "/dashboard",
    keywords: ["today's changes", "todays changes", "what's new", "whats new", "changes"],
  },
  {
    id: "open-country-dashboard",
    phrase: "Open country dashboard",
    href: "/countries",
    keywords: ["country dashboard", "open country", "countries"],
  },
  {
    id: "mission-status",
    phrase: "Show mission status",
    href: "/research",
    keywords: ["mission status", "show mission", "my missions"],
  },
  {
    id: "compare-countries",
    phrase: "Compare countries",
    href: "/countries",
    keywords: ["compare countries", "compare country"],
  },
  {
    id: "open-evidence",
    phrase: "Open evidence",
    href: "/knowledge",
    keywords: ["open evidence", "evidence", "sources"],
  },
  {
    id: "search-publications",
    phrase: "Search publications",
    href: "/research",
    keywords: ["search publications", "publications", "papers"],
  },
  {
    id: "start-analysis",
    phrase: "Start analysis",
    href: "/research/workspace",
    keywords: ["start analysis", "begin analysis", "analyze"],
  },
  {
    id: "open-trust",
    phrase: "Open Trust",
    href: "/trust",
    keywords: ["open trust", "trust center", "constitution", "methodology"],
  },
  {
    id: "open-settings",
    phrase: "Open Settings",
    href: "/settings",
    keywords: ["open settings", "settings", "configure assistant"],
  },
  {
    id: "open-reports",
    phrase: "Open Reports",
    href: "/analytics",
    keywords: ["open reports", "reports"],
  },
] as const;

export type AssistantCommandMatch =
  | { kind: "fixed"; label: string; href: string; matchedKeyword: string }
  | { kind: "parameterized"; label: string; href: string; term: string };

type ParameterizedPattern = {
  prefixes: readonly string[];
  resolve: (term: string) => { label: string; href: string };
};

function findEntityHref(term: string, entityType: "country" | "company" | "university"): string | null {
  const matches = searchEntities(term, {
    entityType,
    minAiScore: 0,
    minInvestmentScore: 0,
    maxRiskScore: 100,
  });
  const top = matches[0];
  return top ? getEntityDetailHref(top.entity) : null;
}

const PARAMETERIZED_PATTERNS: readonly ParameterizedPattern[] = [
  {
    prefixes: ["search evidence for "],
    resolve: (term) => ({
      label: `Search evidence for "${term}"`,
      href: `/search?q=${encodeURIComponent(term)}`,
    }),
  },
  {
    prefixes: ["find country ", "show country "],
    resolve: (term) => {
      const href = findEntityHref(term, "country");
      return href
        ? { label: `Open country "${term}"`, href }
        : { label: `Search for country "${term}"`, href: `/search?q=${encodeURIComponent(term)}` };
    },
  },
  {
    prefixes: ["find university ", "show university "],
    resolve: (term) => {
      const href = findEntityHref(term, "university");
      return href
        ? { label: `Open university "${term}"`, href }
        : { label: `Search for university "${term}"`, href: `/search?q=${encodeURIComponent(term)}` };
    },
  },
  {
    prefixes: ["find company ", "show company "],
    resolve: (term) => {
      const href = findEntityHref(term, "company");
      return href
        ? { label: `Open company "${term}"`, href }
        : { label: `Search for company "${term}"`, href: `/search?q=${encodeURIComponent(term)}` };
    },
  },
  {
    prefixes: ["show research topic ", "open research topic "],
    resolve: (term) => {
      const exact = RESEARCH_TOPICS.find((topic) => topic.topicId === term.toLowerCase().replace(/\s+/g, "-"));
      const fuzzy = exact ? [exact] : filterResearchTopics(RESEARCH_TOPICS, { query: term });
      const match = fuzzy[0];
      return match
        ? { label: `Open research topic "${match.topicName}"`, href: getResearchTopicPath(match.topicId) }
        : { label: `Search research topics for "${term}"`, href: `/search?q=${encodeURIComponent(term)}` };
    },
  },
];

function resolveParameterizedCommand(normalized: string, original: string): AssistantCommandMatch | null {
  for (const pattern of PARAMETERIZED_PATTERNS) {
    for (const prefix of pattern.prefixes) {
      if (normalized.startsWith(prefix)) {
        const term = original.slice(prefix.length).trim();
        if (!term) return null;
        const { label, href } = pattern.resolve(term);
        return { kind: "parameterized", label, href, term };
      }
    }
  }
  return null;
}

/**
 * Deterministic resolver: parameterized patterns are checked first (more specific), then the
 * fixed keyword table. Returns null when nothing matches — callers must show an honest
 * "not recognized yet" state with supported alternatives, never a fabricated response.
 */
export function resolveAssistantCommand(input: string): AssistantCommandMatch | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  const normalized = trimmed.toLowerCase();

  const parameterized = resolveParameterizedCommand(normalized, trimmed);
  if (parameterized) return parameterized;

  for (const command of ASSISTANT_COMMANDS) {
    for (const keyword of command.keywords) {
      if (normalized.includes(keyword)) {
        return { kind: "fixed", label: command.phrase, href: command.href, matchedKeyword: keyword };
      }
    }
  }
  return null;
}
