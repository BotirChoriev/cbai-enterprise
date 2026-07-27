/** Deterministic platform intent matching — shared by typed, voice, and Realtime. */

import { resolveAssistantCommand } from "@/lib/assistant/assistant-commands";
import { countries } from "@/lib/countries";
import { companies } from "@/lib/companies";
import { universities } from "@/lib/universities";
import { allNameFormsForCountry } from "@/lib/i18n/country-names";
import { resolvePlatformDomain, localizedDomainTitle } from "@/lib/platform-actions/domain-resolver";
import { matchEngineIntent } from "@/lib/platform-actions/engine-intent-matcher";
import { containsNormalizedPhrase, exactNormalizedMatch, normalizePlatformText } from "@/lib/platform-actions/normalize-text";
import { PLATFORM_ACTION_REGISTRY } from "@/lib/platform-actions/registry";
import type { PlatformActionId, PlatformActionIntent, PlatformActionParams } from "@/lib/platform-actions/types";
import {
  matchDestinationsFromCommand,
  type DestinationId,
} from "@/lib/navigation/canonical-destinations";

const CREATE_MARKERS = /(yaratmoq|yarat|create|generate|draft|tuz|reja|hisobot|report|plan|start|boshla)/i;
const REPORT_MARKERS = /(hisobot|report|rapor|отчёт)/i;
const EVIDENCE_REQUEST_MARKERS = /(dalil so'ra|evidence request|request evidence|manba so'ra)/i;
const PROBLEM_MARKERS = /(problem|muammo|проблем|sorun)/i;
const PROBLEM_CREATE_MARKERS =
  /(open a problem|create problem|start a problem|new problem|muammo och|muammo yarat|muammoni boshl|yangi muammo|создай проблему|открой новую проблему|problem oluştur|yeni problem)/i;
const RESEARCH_START_OR_PROFESSION =
  /(tadqiqot|research|study|boshlamoq|start|begin|yaratmoq|create|plan|garman|ologist|ogar|chemist|engineer|bo'lim|bölüm|открой|open|o't|o‘t)/i;
const CHEMISTRY_PROFESSION_ONLY =
  /(kimyogar(?:man)?|chemist|research\s*chemist|laboratory\s*scientist|phd\s*researcher|kimyager(?:im)?|химик|лабораторн)/i;
const EXPLICIT_SECTION_OPEN = /(och|open|открой|aç|sahifa|page|bo'lim|раздел)/i;

function matchAliasIntent(text: string): PlatformActionIntent | null {
  const normalized = normalizePlatformText(text);
  for (const def of Object.values(PLATFORM_ACTION_REGISTRY)) {
    for (const alias of def.aliases) {
      if (exactNormalizedMatch(normalized, alias)) {
        return { actionId: def.id, confidence: "high", params: { userStatement: text }, originalText: text };
      }
    }
  }

  for (const def of Object.values(PLATFORM_ACTION_REGISTRY)) {
    for (const alias of def.aliases) {
      if (containsNormalizedPhrase(normalized, alias) && alias.split(" ").length >= 2) {
        return { actionId: def.id, confidence: "high", params: { userStatement: text }, originalText: text };
      }
    }
  }

  return null;
}

function stripDiacriticsLower(value: string): string {
  return normalizePlatformText(value);
}

function findCountryInText(text: string): { id: string; name: string } | null {
  const haystack = stripDiacriticsLower(text);
  for (const country of countries) {
    const forms = allNameFormsForCountry(country.id, country.name);
    if (forms.some((form) => haystack.includes(stripDiacriticsLower(form)))) {
      return { id: country.id, name: country.name };
    }
  }
  return null;
}

function findCompanyInText(text: string): { id: string; name: string } | null {
  const haystack = stripDiacriticsLower(text);
  for (const company of companies) {
    if (haystack.includes(stripDiacriticsLower(company.name))) {
      return { id: company.id, name: company.name };
    }
  }
  return null;
}

function findUniversityInText(text: string): { id: string; name: string } | null {
  const haystack = stripDiacriticsLower(text);
  for (const university of universities) {
    const fullName = stripDiacriticsLower(university.name);
    if (haystack.includes(fullName)) {
      return { id: university.id, name: university.name };
    }
    // Distinctive leading token (e.g. "Stanford universitetini och" vs catalog "Stanford University").
    const lead = fullName.split(/\s+/).find((part) => part.length >= 5);
    if (lead && haystack.includes(lead)) {
      return { id: university.id, name: university.name };
    }
  }
  return null;
}

function matchEntityIntent(text: string): PlatformActionIntent | null {
  const normalized = normalizePlatformText(text);
  const openVerb = /(och|ko'rsat|show|open|aç|открой|покажи)/.test(normalized);

  const country = findCountryInText(text);
  if (country && (openVerb || normalized.includes(country.name.toLowerCase()))) {
    return {
      actionId: "entity.open_country",
      confidence: "high",
      params: { entityId: country.id, entityName: country.name, userStatement: text },
      originalText: text,
    };
  }

  const company = findCompanyInText(text);
  if (company && openVerb) {
    return {
      actionId: "entity.open_company",
      confidence: "high",
      params: { entityId: company.id, entityName: company.name, userStatement: text },
      originalText: text,
    };
  }

  const university = findUniversityInText(text);
  if (university && openVerb) {
    return {
      actionId: "entity.open_university",
      confidence: "high",
      params: { entityId: university.id, entityName: university.name, userStatement: text },
      originalText: text,
    };
  }

  return null;
}

function matchMutationIntent(text: string, locale: string): PlatformActionIntent | null {
  if (PROBLEM_MARKERS.test(text) && (PROBLEM_CREATE_MARKERS.test(text) || CREATE_MARKERS.test(text))) {
    return {
      actionId: "problem.compose",
      confidence: "high",
      params: { title: text.trim().slice(0, 90), userStatement: text },
      originalText: text,
    };
  }
  if (REPORT_MARKERS.test(text) && CREATE_MARKERS.test(text)) {
    return {
      actionId: "report.compose",
      confidence: "high",
      params: { title: locale === "uz" ? "Hisobot" : "Report", userStatement: text },
      originalText: text,
    };
  }
  if (EVIDENCE_REQUEST_MARKERS.test(text)) {
    return {
      actionId: "evidence_request.compose",
      confidence: "high",
      params: { userStatement: text },
      originalText: text,
    };
  }
  if (CREATE_MARKERS.test(text)) {
    return {
      actionId: "operational_object.compose",
      confidence: "medium",
      params: { userStatement: text },
      originalText: text,
    };
  }
  return null;
}

function matchDomainIntent(text: string, locale: string): PlatformActionIntent | null {
  const domain = resolvePlatformDomain(text);
  if (!domain) return null;

  const params: PlatformActionParams = {
    userStatement: text,
    domain: domain.domain.defaultDomain,
    draftType: domain.domain.recommendedType,
    title: localizedDomainTitle(domain.domain, locale),
    topicId: domain.topicId ?? undefined,
    query: domain.domain.id,
  };

  // Profession-only chemistry statements (all locales) → My Work discovery, never blind Research.
  if (
    domain.domain.id === "chemistry" &&
    CHEMISTRY_PROFESSION_ONLY.test(text) &&
    !EXPLICIT_SECTION_OPEN.test(text) &&
    !CREATE_MARKERS.test(text)
  ) {
    return {
      actionId: "navigate.my_work",
      confidence: "high",
      params: { ...params, topicId: undefined, query: "chemist_discover" },
      originalText: text,
    };
  }

  if (RESEARCH_START_OR_PROFESSION.test(text)) {
    // Explicit chemistry research open — Research catalog filter (no dedicated topic page).
    if (domain.domain.id === "chemistry") {
      return {
        actionId: "navigate.research",
        confidence: "high",
        params: { ...params, topicId: undefined, query: "chemistry" },
        originalText: text,
      };
    }
    return {
      actionId: domain.topicId ? "research.open_topic" : "navigate.research",
      confidence: "high",
      params,
      originalText: text,
    };
  }

  return {
    actionId: "navigate.research",
    confidence: "medium",
    params,
    originalText: text,
  };
}

function destinationToActionId(id: DestinationId): PlatformActionId | null {
  const map: Partial<Record<DestinationId, PlatformActionId>> = {
    home: "navigate.home",
    my_work: "navigate.my_work",
    search: "navigate.search",
    discover: "navigate.discover",
    countries: "navigate.countries",
    companies: "navigate.companies",
    universities: "navigate.universities",
    research: "navigate.research",
    evidence: "navigate.evidence",
    graph: "navigate.graph",
    reports: "navigate.reports",
    investor: "navigate.investor",
    government: "navigate.government",
    governance: "navigate.governance",
    trust: "navigate.trust",
    settings: "navigate.settings",
    about: "navigate.about",
    rooms: "navigate.rooms",
    notifications: "navigate.notifications",
  };
  return map[id] ?? null;
}

function matchDestinationIntent(text: string): PlatformActionIntent | null {
  const matches = matchDestinationsFromCommand(text);
  if (matches.length === 0) return null;
  if (matches.length === 1) {
    const actionId = destinationToActionId(matches[0]!.id);
    if (!actionId) return null;
    return {
      actionId,
      confidence: "high",
      params: { userStatement: text },
      originalText: text,
    };
  }
  const primary = destinationToActionId(matches[0]!.id);
  if (!primary) return null;
  return {
    actionId: primary,
    confidence: "medium",
    params: { userStatement: text },
    originalText: text,
    clarifyQuestionKey: "platformAction.clarifyIntent",
    clarifyOptions: matches.slice(0, 3).map((dest) => ({
      id: dest.id,
      labelKey: dest.titleKey,
    })),
  };
}

function hrefToActionId(href: string): PlatformActionId | null {
  const path = href.split("?")[0] ?? href;
  if (path === "/") return "navigate.home";
  if (path === "/my-work") return "navigate.my_work";
  if (path.startsWith("/search")) return "navigate.search";
  if (path === "/discover") return "navigate.discover";
  if (path === "/rooms" || path.startsWith("/rooms/")) return "navigate.rooms";
  if (path.startsWith("/countries")) return href.includes("country=") ? "entity.open_country" : "navigate.countries";
  if (path.startsWith("/companies")) return href.includes("company=") ? "entity.open_company" : "navigate.companies";
  if (path.startsWith("/universities")) return href.includes("university=") ? "entity.open_university" : "navigate.universities";
  if (path.startsWith("/research/")) return "research.open_topic";
  if (path === "/research") return "navigate.research";
  if (path === "/knowledge" || path === "/evidence") return "navigate.evidence";
  if (path === "/graph") return "navigate.graph";
  if (path === "/reports") return "navigate.reports";
  if (path === "/investor") return "navigate.investor";
  if (path === "/government") return "navigate.government";
  if (path === "/governance") return "navigate.governance";
  if (path === "/trust") return "navigate.trust";
  if (path === "/settings") return "navigate.settings";
  if (path === "/about") return "navigate.about";
  if (path === "/notifications") return "navigate.notifications";
  return null;
}

function matchAssistantFallback(text: string): PlatformActionIntent | null {
  const match = resolveAssistantCommand(text);
  if (!match) return null;

  const actionId = hrefToActionId(match.href);
  if (!actionId) return null;

  return {
    actionId,
    confidence: "high",
    params: { userStatement: text, query: match.kind === "parameterized" ? match.term : undefined },
    originalText: text,
  };
}

function matchMyWorkFilterIntent(text: string): PlatformActionIntent | null {
  const normalized = normalizePlatformText(text);
  const wantsList =
    /(show|list|open|ko'rsat|ko‘rsat|och|покажи|открой|göster|listele|what needs|nima kerak|diqqat)/.test(
      normalized,
    ) ||
    /(unfinished|tugallanmagan|needs review|ko'rib chiqish|review|waiting|blocked|drafts?|qoralama)/.test(
      normalized,
    );
  if (!wantsList) return null;

  if (/(needs?\s*(\w+\s*)?review|ko['‘]?rib\s*chiqish|требует\s*проверк|inceleme\s*gereken|review\s*kerak|what needs my review)/.test(normalized)) {
    return {
      actionId: "navigate.my_work",
      confidence: "high",
      params: { query: "review", userStatement: text },
      originalText: text,
    };
  }
  if (/(unfinished|tugallanmagan|incomplete|waiting|blocked|needs?\s*attention|diqqat\s*talab|незаверш|bekleyen)/.test(normalized)) {
    return {
      actionId: "navigate.my_work",
      confidence: "high",
      params: { query: "waiting", userStatement: text },
      originalText: text,
    };
  }
  if (/(drafts?|qoralama|черновик|taslak)/.test(normalized) && /(show|list|ko['‘]?rsat|och|open|покажи)/.test(normalized)) {
    return {
      actionId: "navigate.my_work",
      confidence: "high",
      params: { query: "draft", userStatement: text },
      originalText: text,
    };
  }
  return null;
}

function matchRouteFilterIntent(text: string, locale: string): PlatformActionIntent | null {
  const normalized = normalizePlatformText(text);
  if (!/(filter|filtr|фильтр|filtre|show only|faqat|только|yalnız)/.test(normalized)) return null;

  if (/(evidence request|dalil so|запрос доказ|kanıt iste)/.test(normalized)) {
    return {
      actionId: "route.apply_filter",
      confidence: "high",
      params: { filterKey: "opFilter", filterValue: "waiting", query: "waiting", userStatement: text },
      originalText: text,
    };
  }
  if (/(industry|soha|отрасл|sektör)/.test(normalized)) {
    const m = text.match(/(?:industry|soha|отрасл\w*|sektör)\s*[:=]?\s*([A-Za-zА-Яа-яЁёʻʼ''\-\s]{2,40})/i);
    return {
      actionId: "route.apply_filter",
      confidence: "medium",
      params: {
        filterKey: "industry",
        filterValue: m?.[1]?.trim() || intentQueryFallback(text),
        userStatement: text,
      },
      originalText: text,
    };
  }
  if (/(region|hudud|регион|bölge)/.test(normalized)) {
    const m = text.match(/(?:region|hudud|регион|bölge)\s*[:=]?\s*([A-Za-zА-Яа-яЁёʻʼ''\-\s]{2,40})/i);
    return {
      actionId: "route.apply_filter",
      confidence: "medium",
      params: {
        filterKey: "region",
        filterValue: m?.[1]?.trim() || intentQueryFallback(text),
        userStatement: text,
      },
      originalText: text,
    };
  }
  if (/(domain|discipline|soha|дисциплин|alan)/.test(normalized) && /(research|tadqiqot|исследован|araştırma)/.test(normalized)) {
    return {
      actionId: "route.apply_filter",
      confidence: "medium",
      params: { filterKey: "domain", filterValue: intentQueryFallback(text), userStatement: text },
      originalText: text,
    };
  }
  void locale;
  return null;
}

function intentQueryFallback(text: string): string {
  const parts = text.trim().split(/\s+/);
  return parts[parts.length - 1] ?? text.trim();
}

function matchSummarizeIntent(text: string): PlatformActionIntent | null {
  const normalized = normalizePlatformText(text);
  if (
    !/(summarize|summarise|summary|xulosa|rezume|резюме|özet|what is missing|nima yetishmay|что отсутствует|ne eksik)/.test(
      normalized,
    )
  ) {
    return null;
  }
  return {
    actionId: "route.summarize",
    confidence: "high",
    params: { userStatement: text },
    originalText: text,
  };
}

function matchOpenWorkObjectIntent(text: string): PlatformActionIntent | null {
  const normalized = normalizePlatformText(text);
  if (!/(continue my (latest )?research|open my .+ work|ishni och|открыть мою|işim)/.test(normalized)) {
    return null;
  }
  // Focus My Work — object id resolved later from local store when available.
  return {
    actionId: "navigate.my_work",
    confidence: "high",
    params: { query: "active", userStatement: text },
    originalText: text,
  };
}

export function resolvePlatformIntent(text: string, locale: string): PlatformActionIntent | null {
  const trimmed = text.trim();
  if (!trimmed) return null;

  const alias = matchAliasIntent(trimmed);
  if (alias) return alias;

  const summarize = matchSummarizeIntent(trimmed);
  if (summarize) return summarize;

  const myWorkFilter = matchMyWorkFilterIntent(trimmed);
  if (myWorkFilter) return myWorkFilter;

  const routeFilter = matchRouteFilterIntent(trimmed, locale);
  if (routeFilter) return routeFilter;

  const openWork = matchOpenWorkObjectIntent(trimmed);
  if (openWork) return openWork;

  const entity = matchEntityIntent(trimmed);
  if (entity) return entity;

  const engine = matchEngineIntent(trimmed);
  if (engine) return engine;

  // Creation phrases must open drafts — not navigate away from the create intent.
  const mutation = matchMutationIntent(trimmed, locale);
  if (mutation) return mutation;

  const domain = matchDomainIntent(trimmed, locale);
  if (domain) return domain;

  const assistant = matchAssistantFallback(trimmed);
  if (assistant) return assistant;

  const destination = matchDestinationIntent(trimmed);
  if (destination) return destination;

  if (trimmed.split(/\s+/).length <= 2) {
    return {
      actionId: "navigate.search",
      confidence: "low",
      params: { query: trimmed, userStatement: trimmed },
      originalText: trimmed,
      clarifyQuestionKey: "platformAction.clarifyIntent",
      clarifyOptions: [
        { id: "research", labelKey: "platformAction.optionResearch" },
        { id: "evidence", labelKey: "platformAction.optionEvidence" },
        { id: "my_work", labelKey: "platformAction.optionMyWork" },
      ],
    };
  }

  return null;
}

export function governmentVsGovernanceIntent(text: string): PlatformActionId | null {
  const normalized = normalizePlatformText(text);
  if (containsNormalizedPhrase(normalized, "davlat boshqaruvi") || containsNormalizedPhrase(normalized, "hukumat")) {
    return "navigate.government";
  }
  if (
    containsNormalizedPhrase(normalized, "boshqaruv qoidalari") ||
    containsNormalizedPhrase(normalized, "platforma qoidalarini") ||
    containsNormalizedPhrase(normalized, "nazorat")
  ) {
    return "navigate.governance";
  }
  return null;
}
