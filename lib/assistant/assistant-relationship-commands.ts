/**
 * Relationship-aware Command Center commands (Platform Relationship Activation mission).
 *
 * `resolveAssistantCommand` (assistant-commands.ts) is a pure phrase→fixed-href table — it has no
 * notion of "the entity currently on screen," so it cannot answer "open related research" for
 * whichever country/company/university/research topic the user is actually looking at. This
 * resolver fills that gap using the real relationship data every entity module already computes
 * (getCountryRelationships, getCompanyRelationships, getUniversityRelationships,
 * getRelatedResearchTopics/getRelatedCompaniesForTopic) — never a new relationship engine, never a
 * fabricated link. When exactly one real related entity exists, it navigates straight there; when
 * several exist, it opens the real listing page; when none exist, it returns an honest message
 * instead of guessing.
 */

import { countries } from "@/lib/countries";
import { companies } from "@/lib/companies";
import { universities } from "@/lib/universities";
import { getCountryRelationships } from "@/lib/countries.adapter";
import { getCompanyRelationships } from "@/lib/companies.adapter";
import { getUniversityRelationships } from "@/lib/universities.adapter";
import { getRelatedResearchTopics, getRelatedCompaniesForTopic } from "@/lib/company-research";
import { getResearchTopicById, getResearchTopicPath } from "@/lib/research/research-topics";
import { countryHrefByName, companyHrefByName, universityHrefByName } from "@/components/shared/resolve-entity-link";
import { profileSectionHref } from "@/components/shared/entity-profile-path";

export type RelationshipFocus =
  | { kind: "country"; id: string }
  | { kind: "company"; id: string }
  | { kind: "university"; id: string }
  | { kind: "research_topic"; id: string };

export type RelationshipCommandResult =
  | { type: "navigate"; href: string; message: string }
  | { type: "message"; message: string };

function matchesAny(normalized: string, phrases: readonly string[]): boolean {
  return phrases.some((phrase) => normalized.includes(phrase));
}

function pickTarget(
  names: readonly string[],
  hrefFn: (name: string) => string | null,
  listHref: string,
  kindLabel: string,
): RelationshipCommandResult {
  const real = names.filter((name) => hrefFn(name) !== null);
  if (real.length === 0) {
    return { type: "message", message: `No related ${kindLabel} connected yet.` };
  }
  if (real.length === 1) {
    return { type: "navigate", href: hrefFn(real[0])!, message: `Opening ${real[0]}.` };
  }
  return { type: "navigate", href: listHref, message: `Opening ${kindLabel} (${real.length} related).` };
}

function focusBaseHref(focus: RelationshipFocus): string {
  switch (focus.kind) {
    case "country":
      return `/countries?country=${focus.id}`;
    case "company":
      return `/companies?company=${focus.id}`;
    case "university":
      return `/universities?university=${focus.id}`;
    case "research_topic":
      return getResearchTopicPath(focus.id);
  }
}

const RELATED_EVIDENCE_PHRASES = ["open related evidence", "related evidence", "open evidence"];
const RELATED_RESEARCH_PHRASES = ["open related research", "related research"];
const RELATED_COMPANY_PHRASES = ["open related compan", "related compan"];
const RELATED_UNIVERSITY_PHRASES = ["open related universit", "related universit"];
const OPEN_COUNTRY_PHRASES = ["open related country", "related country", "open country"];

/**
 * Resolves a relationship-aware command against whichever real entity is currently focused.
 * Returns null when the phrase isn't one of this resolver's — callers should fall through to
 * `resolveAssistantCommand` next.
 */
export function resolveRelationshipCommand(
  rawInput: string,
  focus: RelationshipFocus | null,
): RelationshipCommandResult | null {
  const normalized = rawInput.trim().toLowerCase();
  if (!normalized) return null;

  if (matchesAny(normalized, RELATED_EVIDENCE_PHRASES)) {
    if (!focus) return { type: "navigate", href: "/knowledge", message: "Opening Evidence." };
    return {
      type: "navigate",
      href: profileSectionHref(focusBaseHref(focus), "evidence"),
      message: "Opening Evidence.",
    };
  }

  if (matchesAny(normalized, RELATED_RESEARCH_PHRASES)) {
    if (focus?.kind === "company") {
      const company = companies.find((c) => c.id === focus.id);
      if (!company) return { type: "message", message: "Company not found." };
      const matches = getRelatedResearchTopics(company);
      if (matches.length === 0) {
        return { type: "message", message: `No research topics related to ${company.name} yet.` };
      }
      if (matches.length === 1) {
        return {
          type: "navigate",
          href: getResearchTopicPath(matches[0].topic.topicId),
          message: `Opening ${matches[0].topic.topicName}.`,
        };
      }
      return { type: "navigate", href: "/research", message: `Opening Research (${matches.length} related topics).` };
    }
    if (focus?.kind === "country" || focus?.kind === "university") {
      return { type: "message", message: "No verified research connection exists for this entity yet." };
    }
    return { type: "navigate", href: "/research", message: "Opening Research." };
  }

  if (matchesAny(normalized, RELATED_COMPANY_PHRASES)) {
    if (focus?.kind === "country") {
      const country = countries.find((c) => c.id === focus.id);
      if (!country) return { type: "message", message: "Country not found." };
      return pickTarget(getCountryRelationships(country).relatedCompanies, companyHrefByName, "/companies", "companies");
    }
    if (focus?.kind === "university") {
      const university = universities.find((u) => u.id === focus.id);
      if (!university) return { type: "message", message: "University not found." };
      return pickTarget(getUniversityRelationships(university).companies, companyHrefByName, "/companies", "companies");
    }
    if (focus?.kind === "research_topic") {
      const topic = getResearchTopicById(focus.id);
      if (!topic) return { type: "message", message: "Research topic not found." };
      const matches = getRelatedCompaniesForTopic(topic);
      if (matches.length === 0) {
        return { type: "message", message: `No companies related to ${topic.topicName} yet.` };
      }
      if (matches.length === 1) {
        return { type: "navigate", href: companyHrefByName(matches[0].company.name)!, message: `Opening ${matches[0].company.name}.` };
      }
      return { type: "navigate", href: "/companies", message: `Opening Companies (${matches.length} related).` };
    }
    return { type: "message", message: "No related companies connected yet." };
  }

  if (matchesAny(normalized, RELATED_UNIVERSITY_PHRASES)) {
    if (focus?.kind === "country") {
      const country = countries.find((c) => c.id === focus.id);
      if (!country) return { type: "message", message: "Country not found." };
      return pickTarget(getCountryRelationships(country).universities, universityHrefByName, "/universities", "universities");
    }
    if (focus?.kind === "company") {
      const company = companies.find((c) => c.id === focus.id);
      if (!company) return { type: "message", message: "Company not found." };
      return pickTarget(getCompanyRelationships(company).universities, universityHrefByName, "/universities", "universities");
    }
    return { type: "message", message: "No related universities connected yet." };
  }

  if (matchesAny(normalized, OPEN_COUNTRY_PHRASES)) {
    if (focus?.kind === "company") {
      const company = companies.find((c) => c.id === focus.id);
      const name = company ? getCompanyRelationships(company).headquartersCountry : null;
      const href = name ? countryHrefByName(name) : null;
      return href && name
        ? { type: "navigate", href, message: `Opening ${name}.` }
        : { type: "message", message: "No related country connected yet." };
    }
    if (focus?.kind === "university") {
      const university = universities.find((u) => u.id === focus.id);
      const name = university ? getUniversityRelationships(university).country : null;
      const href = name ? countryHrefByName(name) : null;
      return href && name
        ? { type: "navigate", href, message: `Opening ${name}.` }
        : { type: "message", message: "No related country connected yet." };
    }
    if (focus?.kind === "country") {
      return { type: "message", message: "Already viewing a country." };
    }
    return { type: "navigate", href: "/countries", message: "Opening Countries." };
  }

  return null;
}
