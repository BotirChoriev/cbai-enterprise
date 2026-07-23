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
    id: "start-mission",
    phrase: "Start a mission",
    href: "/?create=1",
    keywords: [
      "start mission", "start a mission", "new mission", "create mission",
      "analyze this", "analyse this", "investigate this", "research this topic",
      "missiyani boshlash", "yangi missiya", "tahlil qil",
      "начать миссию", "новая миссия", "проанализируй",
      "görev başlat", "yeni görev", "analiz et",
    ],
  },
  {
    id: "open-reasoning",
    phrase: "Open reasoning",
    href: "/reasoning",
    keywords: [
      "open reasoning", "reasoning", "structured reasoning",
      "mulohazani och", "mulohaza",
      "открой рассуждение", "рассуждение",
      "akıl yürütmeyi aç", "akıl yürütme",
    ],
  },
  {
    id: "show-missing-evidence",
    phrase: "Show missing evidence",
    href: "/knowledge",
    keywords: [
      "show missing evidence", "missing evidence", "evidence gaps",
      "yetishmayotgan dalillar", "dalil bo'shliqlari",
      "покажи недостающие доказательства", "недостающие доказательства",
      "eksik kanıtları göster", "eksik kanıtlar",
    ],
  },
  {
    id: "search-japan",
    phrase: "Search Japan",
    href: "/countries?country=japan&q=Japan",
    keywords: ["search japan", "find japan", "open japan", "япония", "japonya"],
  },
  {
    id: "add-to-mission",
    phrase: "Add to my mission",
    href: "/my-work",
    keywords: [
      "add to mission", "add this to my mission", "add to my mission",
      "missiyaga qo'shish", "missiyamga qo'sh",
      "добавить в миссию", "добавь в миссию",
      "göreve ekle", "görevime ekle",
    ],
  },
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
      "open research", "open research module",
      "tadqiqotni och", "tadqiqot",
      "открой исследования", "исследования",
      "araştırmayı aç", "araştırma",
    ],
  },
  {
    id: "open-countries",
    phrase: "Open Countries",
    href: "/countries",
    keywords: [
      "open countries", "open country module",
      "davlatlarni och",
      "открой страны",
      "ülkeleri aç",
    ],
  },
  {
    id: "open-evidence-module",
    phrase: "Open Evidence",
    href: "/knowledge",
    keywords: [
      "open evidence module", "open the evidence",
    ],
  },
  {
    id: "continue-research",
    phrase: "Continue research",
    href: "/research/microbiology",
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
    href: "/my-work",
    keywords: ["mission status", "show mission", "my missions", "what is incomplete", "what should i do next"],
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
    href: "/research/microbiology",
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
    href: "/reports",
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
    id: "open-universities",
    phrase: "Open university",
    href: "/universities",
    keywords: [
      "open university", "open universities", "universities",
      "universitetlarni och", "universitetlar",
      "открой университеты", "университеты",
      "üniversiteleri aç", "üniversiteler",
    ],
  },
  {
    id: "open-search",
    phrase: "Search intelligence",
    href: "/search",
    keywords: [
      "search intelligence", "open search",
      "qidiruvni och", "qidiruv",
      "открой поиск", "поиск",
      "aramayı aç", "arama",
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
    href: "/reports",
    keywords: [
      "generate report", "generate a report", "create report",
      "hisobot yarat",
      "создай отчёт", "создать отчёт",
      "rapor oluştur",
    ],
  },
  {
    id: "open-home",
    phrase: "Open home",
    href: "/",
    keywords: [
      "open home", "go home", "home page",
      "bosh sahifani och", "bosh sahifa",
      "открой главную", "главная",
      "ana sayfayı aç", "ana sayfa",
    ],
  },
  {
    id: "open-research-canvas",
    phrase: "Open Research Canvas",
    href: "/research/canvas",
    keywords: [
      "open research canvas", "research canvas",
      "tadqiqot kanvasini och", "research canvasni och",
      "открой research canvas",
      "research canvas aç",
    ],
  },
  {
    id: "what-next",
    phrase: "What should I do next?",
    href: "/research/canvas",
    keywords: [
      "what should i do next", "what's next", "whats next",
      "keyingi qadam nima", "keyingi qadam",
      "что дальше", "следующий шаг",
      "sıradaki ne", "sonraki adım",
    ],
  },
  {
    id: "what-blocked",
    phrase: "What is blocked?",
    href: "/research/canvas",
    keywords: [
      "what is blocked", "what's blocked",
      "nima bloklangan", "bloklangan",
      "что заблокировано",
      "ne engellendi",
    ],
  },
  {
    id: "open-measurement-plan",
    phrase: "Open measurement plan",
    href: "/research/canvas",
    keywords: [
      "open measurement plan", "measurement plan",
      "o'lchash rejasini och", "olchash rejasini och",
      "открой план измерений",
      "ölçüm planını aç",
    ],
  },
  {
    id: "continue-mission",
    phrase: "Continue mission",
    href: "/my-work",
    keywords: [
      "continue mission", "continue my mission",
      "missiyani davom ettir", "missiyani davom et",
      "продолжить миссию",
      "göreve devam et",
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
  {
    id: "open-governance",
    phrase: "Open Governance",
    href: "/governance",
    keywords: [
      "open governance", "governance", "governance center",
      "boshqaruvni och", "boshqaruv",
      "открой управление", "управление",
      "yönetişimi aç", "yönetişim",
    ],
  },
  {
    id: "open-mission-engine",
    phrase: "Open Mission Engine",
    href: "/?create=1",
    keywords: [
      "open mission engine", "mission engine", "open the mission engine",
      "missiya dvigatelini och",
      "открой движок миссий",
      "görev motorunu aç",
    ],
  },
  {
    id: "show-official-sources",
    phrase: "Show official sources",
    href: "/trust",
    keywords: [
      "show official sources", "official sources", "connected sources",
      "rasmiy manbalar",
      "официальные источники",
      "resmi kaynaklar",
    ],
  },
  {
    id: "show-constitutional-evidence",
    phrase: "Show constitutional evidence",
    href: "/trust#constitution",
    keywords: [
      "show constitutional evidence", "constitutional evidence", "constitution evidence",
      "konstitutsiya dalillari",
      "конституционные доказательства",
      "anayasal kanıt",
    ],
  },
  {
    id: "find-corruption-indicators",
    phrase: "Find corruption indicators",
    href: "/knowledge?q=corruption",
    keywords: [
      "find corruption indicators", "corruption indicators", "show corruption indicators",
      "korrupsiya ko'rsatkichlari",
      "показатели коррупции",
      "yolsuzluk göstergeleri",
    ],
  },
  {
    id: "generate-investor-report",
    phrase: "Generate investor report",
    href: "/reports",
    keywords: [
      "generate investor report", "investor report", "investor summary", "investor brief",
      "investor hisoboti",
      "инвесторский отчёт",
      "yatırımcı raporu",
    ],
  },
  {
    id: "generate-executive-summary",
    phrase: "Generate executive summary",
    href: "/reports",
    keywords: [
      "generate executive summary", "executive summary", "executive report",
      "ijro xulosasi",
      "исполнительное резюме",
      "yönetici özeti",
    ],
  },
] as const;

const COMMAND_DISPLAY_BY_LANG: Record<string, Record<string, string>> = {
  uz: {
    "open-my-work": "Mening ishlarimni och",
    "continue-research": "Tadqiqotni davom ettir",
    "open-evidence": "Dalillarni och",
    "open-trust": "Ishonch markazini och",
    "open-research": "Tadqiqotni och",
    "open-reports": "Hisobotlarni och",
    "open-reasoning": "Mulohazani och",
  },
  ru: {
    "open-my-work": "Открой мою работу",
    "continue-research": "Продолжить исследование",
    "open-evidence": "Открой доказательства",
    "open-trust": "Центр доверия",
    "open-research": "Открой исследования",
    "open-reports": "Открой отчёты",
    "open-reasoning": "Открой рассуждение",
  },
  tr: {
    "open-my-work": "Çalışmalarımı aç",
    "continue-research": "Araştırmaya devam et",
    "open-evidence": "Kanıtları aç",
    "open-trust": "Güven merkezi",
    "open-research": "Araştırmayı aç",
    "open-reports": "Raporları aç",
    "open-reasoning": "Akıl yürütmeyi aç",
  },
};

export function displayCommandPhrase(command: AssistantCommand, lang: string): string {
  return COMMAND_DISPLAY_BY_LANG[lang]?.[command.id] ?? command.phrase;
}

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

// Real bare-name fallback (found via actual browser testing: typing a plain entity name like
// "Japan" — the single most natural first action for a "type a command" box — produced only an
// honest "not recognized" message, even though the country is real). Checked last, only after
// every real command phrase and verb-prefixed pattern has already failed to match, so it can never
// shadow an intentional command.
//
// Deliberately an EXACT (case/diacritic-insensitive) name match, not searchEntities()'s fuzzy
// token-relevance ranking — real browser-testing regressions showed that ranking returns a
// low-confidence top result for almost any multi-word input (e.g. "please forecast the stock
// market for me" ranked a real research topic above nothing at all), which would fabricate a
// destination for input that was never actually referring to that entity. An exact name match
// keeps this fallback honest: it only ever fires when the input truly *is* a real catalog name,
// never a guess. A partial/fuzzy name still correctly falls through to the honest "not recognized"
// message, which already offers a real /search link — the right place for fuzzy matching.
function resolveBareEntityNameCommand(trimmed: string): AssistantCommandMatch | null {
  if (trimmed.length < 2) return null;
  const normalized = stripDiacriticsLower(trimmed);

  for (const country of countries) {
    if (allNameFormsForCountry(country.id, country.name).some((form) => stripDiacriticsLower(form) === normalized)) {
      return { kind: "parameterized", label: `Open ${country.name}`, href: `/countries?country=${country.id}`, term: country.name };
    }
  }
  for (const company of companies) {
    if (stripDiacriticsLower(company.name) === normalized) {
      return { kind: "parameterized", label: `Open ${company.name}`, href: `/companies?company=${company.id}`, term: company.name };
    }
  }
  for (const university of universities) {
    if (stripDiacriticsLower(university.name) === normalized) {
      return { kind: "parameterized", label: `Open ${university.name}`, href: `/universities?university=${university.id}`, term: university.name };
    }
  }
  for (const topic of RESEARCH_TOPICS) {
    if (stripDiacriticsLower(topic.topicName) === normalized) {
      return { kind: "parameterized", label: `Open ${topic.topicName}`, href: getResearchTopicPath(topic.topicId), term: topic.topicName };
    }
  }
  return null;
}

/**
 * Deterministic resolver: prefix-style parameterized patterns are checked first (most specific),
 * then the fixed keyword table (exact, deliberately-crafted phrases — low false-positive risk),
 * then the object-first Uzbek/Turkish open-command heuristic, then finally a bare entity-name
 * match (lowest priority — only when literally nothing else understood the input). Returns null
 * when nothing matches at all — callers must show an honest "not recognized yet" state with
 * supported alternatives, never a fabricated response.
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

  const bareEntityName = resolveBareEntityNameCommand(trimmed);
  if (bareEntityName) return bareEntityName;

  return null;
}
