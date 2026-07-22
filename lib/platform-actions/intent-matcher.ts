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

const CREATE_MARKERS = /(yaratmoq|yarat|create|generate|draft|tuz|reja|hisobot|report|plan|start|boshla)/i;
const REPORT_MARKERS = /(hisobot|report|rapor|отчёт)/i;
const EVIDENCE_REQUEST_MARKERS = /(dalil so'ra|evidence request|request evidence|manba so'ra)/i;
const RESEARCH_START_OR_PROFESSION =
  /(tadqiqot|research|study|boshlamoq|start|begin|yaratmoq|create|plan|garman|ologist|ogar|chemist|engineer|bo'lim|bölüm|открой|open|o't|o‘t)/i;

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

  if (RESEARCH_START_OR_PROFESSION.test(text)) {
    // Chemistry has no dedicated topic page — always use Research catalog filter.
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

function hrefToActionId(href: string): PlatformActionId | null {
  const path = href.split("?")[0] ?? href;
  if (path === "/") return "navigate.home";
  if (path === "/my-work") return "navigate.my_work";
  if (path.startsWith("/search")) return "navigate.search";
  if (path.startsWith("/countries")) return href.includes("country=") ? "entity.open_country" : "navigate.countries";
  if (path.startsWith("/companies")) return href.includes("company=") ? "entity.open_company" : "navigate.companies";
  if (path.startsWith("/universities")) return href.includes("university=") ? "entity.open_university" : "navigate.universities";
  if (path.startsWith("/research/")) return "research.open_topic";
  if (path === "/research") return "navigate.research";
  if (path === "/knowledge") return "navigate.evidence";
  if (path === "/graph") return "navigate.graph";
  if (path === "/reports") return "navigate.reports";
  if (path === "/investor") return "navigate.investor";
  if (path === "/government") return "navigate.government";
  if (path === "/governance") return "navigate.governance";
  if (path === "/trust") return "navigate.trust";
  if (path === "/settings") return "navigate.settings";
  if (path === "/about") return "navigate.about";
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

export function resolvePlatformIntent(text: string, locale: string): PlatformActionIntent | null {
  const trimmed = text.trim();
  if (!trimmed) return null;

  const alias = matchAliasIntent(trimmed);
  if (alias) return alias;

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
