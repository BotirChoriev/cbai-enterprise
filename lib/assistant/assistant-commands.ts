/**
 * Assistant command routing — a deterministic phrase-to-route table and a small set of
 * deterministic parameterized patterns ("find country X"), never a reasoning engine. Voice and
 * typed input both resolve through this same matcher and land on real, already-existing routes
 * and real catalog lookups; there is no model call, fuzzy AI matching, or fabricated confidence
 * anywhere in this file.
 *
 * Multilingual Command Understanding (Global Language Foundation + Multilingual Voice Commands
 * mission, Phase 9) — English, Uzbek, Russian, and Turkish phrases resolve to the same real
 * routes. English and Russian are both verb-first ("open Uzbekistan" / "открой Узбекистан"), so a
 * real prefix match works for parameterized commands. Uzbek and Turkish are agglutinative and
 * typically object-first with a case suffix on the object ("Oʻzbekistonni och" — Uzbekistan-ACC
 * open; "Özbekistan'ı aç" — Uzbekistan-ACC open) — a fixed-prefix match cannot reliably strip
 * those suffixes for arbitrary entity names, so parameterized "open <entity name>" commands for
 * Uzbek/Turkish use a real (not fabricated) simpler check instead: the input must contain a real
 * "open" verb keyword AND a real catalog entity name found anywhere in the string. This is
 * honestly less precise than true grammatical parsing — documented in
 * docs/voice-command-architecture.md — but it is a real, working match, not a guess.
 */

import { getEntityDetailHref, searchEntities } from "@/lib/global-search";
import { filterResearchTopics, getResearchTopicPath, RESEARCH_TOPICS } from "@/lib/research/research-topics";
import { countries } from "@/lib/countries";
import { companies } from "@/lib/companies";
import { universities } from "@/lib/universities";
import { allNameFormsForCountry, COUNTRY_LOCALIZED_NAMES } from "@/lib/i18n/country-names";

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
    keywords: [
      "my work", "open my work",
      "mening ishlarim", "ishlarimni och",
      "моя работа", "открой мою работу", "мои проекты",
      "çalışmalarım", "çalışmalarımı aç",
    ],
  },
  {
    id: "open-research",
    phrase: "Open Research",
    href: "/research",
    keywords: [
      "open research",
      "tadqiqotni och", "tadqiqot",
      "открой исследования", "исследования",
      "araştırmayı aç", "araştırma",
    ],
  },
  {
    id: "continue-research",
    phrase: "Continue research",
    href: "/research/workspace",
    keywords: [
      "continue research", "research workspace", "continue my research",
      "tadqiqotni davom ettir",
      "продолжить исследование",
      "araştırmaya devam et",
    ],
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
    keywords: [
      "country dashboard", "open country", "countries",
      "davlatlarni och", "davlatlar",
      "открой страны", "страны",
      "ülkeleri aç", "ülkeler",
    ],
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
    keywords: [
      "open evidence", "evidence", "sources",
      "dalillarni och", "dalillar", "dalillarni qidir",
      "открой доказательства", "доказательства", "найди доказательства",
      "kanıtları aç", "kanıtlar", "kanıtları bul",
    ],
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
    keywords: [
      "open trust", "trust center", "constitution", "methodology",
      "ishonch markazi", "konstitutsiya",
      "центр доверия", "конституция",
      "güven merkezi", "anayasa",
    ],
  },
  {
    id: "open-settings",
    phrase: "Open Settings",
    href: "/settings",
    keywords: ["open settings", "settings", "configure assistant", "sozlamalar", "настройки", "ayarlar"],
  },
  {
    id: "open-reports",
    phrase: "Open Reports",
    href: "/analytics",
    keywords: [
      "open reports", "reports",
      "hisobotlarni och", "hisobotlar",
      "открой отчёты", "отчёты",
      "raporları aç", "raporlar",
    ],
  },
  {
    id: "open-companies",
    phrase: "Open company",
    href: "/companies",
    keywords: [
      "open company", "open companies", "companies",
      "kompaniyalarni och", "kompaniyalar",
      "открой компании", "компании",
      "şirketleri aç", "şirketler",
    ],
  },
  {
    id: "compare-companies",
    phrase: "Compare companies",
    href: "/companies",
    keywords: ["compare companies", "compare company"],
  },
  {
    id: "generate-report",
    phrase: "Generate report",
    href: "/analytics",
    keywords: [
      "generate report", "generate a report", "create report",
      "hisobot yarat",
      "создай отчёт", "создать отчёт",
      "rapor oluştur",
    ],
  },
  {
    id: "create-project",
    phrase: "Create Project",
    href: "/my-work",
    keywords: [
      "create project", "new project", "start a project",
      "yangi loyiha yarat", "loyiha yarat",
      "создай новый проект", "новый проект", "создать проект",
      "yeni proje oluştur", "proje oluştur",
    ],
  },
  {
    id: "open-project",
    phrase: "Open Project",
    href: "/my-work",
    keywords: [
      "open project", "open projects", "my projects",
      "loyihalarimni och", "mening loyihalarim",
      "открой мои проекты", "мои проекты",
      "projelerimi aç", "projelerim",
    ],
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

/** Real localized-name fallback for countries — `searchEntities` only indexes the English
 * catalog name, so "открой страну Узбекистан" would otherwise fall through to a generic search
 * even though the country is real and connected. Checked before that generic fallback. */
function findCountryHrefByLocalizedName(term: string): { href: string; name: string } | null {
  const normalizedTerm = term.trim().toLowerCase();
  for (const country of countries) {
    const localized = COUNTRY_LOCALIZED_NAMES[country.id];
    if (!localized) continue;
    if ([localized.uz, localized.ru, localized.tr].some((form) => form.toLowerCase() === normalizedTerm)) {
      return { href: `/countries?country=${country.id}`, name: country.name };
    }
  }
  return null;
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
    prefixes: ["find country ", "show country ", "найди страну ", "покажи страну ", "открой страну "],
    resolve: (term) => {
      const href = findEntityHref(term, "country");
      if (href) return { label: `Open country "${term}"`, href };
      const localized = findCountryHrefByLocalizedName(term);
      if (localized) return { label: `Open country "${localized.name}"`, href: localized.href };
      return { label: `Search for country "${term}"`, href: `/search?q=${encodeURIComponent(term)}` };
    },
  },
  {
    prefixes: ["find university ", "show university ", "найди университет ", "покажи университет "],
    resolve: (term) => {
      const href = findEntityHref(term, "university");
      return href
        ? { label: `Open university "${term}"`, href }
        : { label: `Search for university "${term}"`, href: `/search?q=${encodeURIComponent(term)}` };
    },
  },
  {
    prefixes: ["find company ", "show company ", "найди компанию ", "покажи компанию "],
    resolve: (term) => {
      const href = findEntityHref(term, "company");
      return href
        ? { label: `Open company "${term}"`, href }
        : { label: `Search for company "${term}"`, href: `/search?q=${encodeURIComponent(term)}` };
    },
  },
  {
    prefixes: ["show research topic ", "open research topic ", "найди тему исследования "],
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

// Uzbek/Turkish "open <entity>" — object-first with a case suffix ("Oʻzbekistonni och",
// "Özbekistan'ı aç") that a fixed prefix cannot reliably strip for arbitrary names. Real, honest
// fallback: require a real "open" verb keyword AND a real catalog entity name found anywhere in
// the input — both conditions are checked against real data, never guessed.
const OBJECT_FIRST_OPEN_VERBS = ["och", "ochish", "aç"];

function stripDiacriticsLower(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/['’ʻʼ]/g, "");
}

function resolveObjectFirstOpenCommand(normalized: string): AssistantCommandMatch | null {
  const hasOpenVerb = OBJECT_FIRST_OPEN_VERBS.some((verb) => normalized.includes(verb));
  if (!hasOpenVerb) return null;

  const haystack = stripDiacriticsLower(normalized);

  // Countries are checked against every real localized name form (see
  // lib/i18n/country-names.ts), not just the English catalog name — "Oʻzbekiston" and
  // "Özbekistan" are real, different words, not transliterations of "Uzbekistan".
  for (const country of countries) {
    const nameForms = allNameFormsForCountry(country.id, country.name);
    if (nameForms.some((form) => haystack.includes(stripDiacriticsLower(form)))) {
      return { kind: "parameterized", label: `Open country "${country.name}"`, href: `/countries?country=${country.id}`, term: country.name };
    }
  }
  for (const company of companies) {
    if (haystack.includes(stripDiacriticsLower(company.name))) {
      return { kind: "parameterized", label: `Open company "${company.name}"`, href: `/companies?company=${company.id}`, term: company.name };
    }
  }
  for (const university of universities) {
    if (haystack.includes(stripDiacriticsLower(university.name))) {
      return { kind: "parameterized", label: `Open university "${university.name}"`, href: `/universities?university=${university.id}`, term: university.name };
    }
  }
  return null;
}

/**
 * Deterministic resolver: prefix-style parameterized patterns are checked first (most specific),
 * then the fixed keyword table (exact, deliberately-crafted phrases — low false-positive risk),
 * then the object-first Uzbek/Turkish open-command heuristic last, since its 2-3 letter verb
 * tokens ("och", "aç") are more likely to appear incidentally inside unrelated text. Returns null
 * when nothing matches — callers must show an honest "not recognized yet" state with supported
 * alternatives, never a fabricated response.
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

  const objectFirstOpen = resolveObjectFirstOpenCommand(normalized);
  if (objectFirstOpen) return objectFirstOpen;

  return null;
}
