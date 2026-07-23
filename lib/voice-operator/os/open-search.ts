/**
 * Compare / open / search NL helpers for the Digital Assistant OS layer.
 */

import { countries } from "@/lib/countries";
import { companies } from "@/lib/companies";
import { universities } from "@/lib/universities";
import { allNameFormsForCountry } from "@/lib/i18n/country-names";
import { getResearchTopicPath, RESEARCH_TOPICS } from "@/lib/research/research-topics";

export type OsNavigateResult = {
  readonly assistantText: string;
  readonly href: string;
};

const COUNTRY_ALIASES: Record<string, string> = {
  usa: "usa",
  us: "usa",
  "u.s.": "usa",
  "u.s.a.": "usa",
  "united states": "usa",
  "united states of america": "usa",
  japan: "japan",
  jp: "japan",
};

function stripDiacriticsLower(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/['’ʻʼ]/g, "")
    .trim();
}

function resolveCountryId(term: string): (typeof countries)[number] | null {
  const key = stripDiacriticsLower(term);
  const aliasId = COUNTRY_ALIASES[key];
  if (aliasId) {
    return countries.find((c) => c.id === aliasId) ?? null;
  }
  for (const country of countries) {
    if (stripDiacriticsLower(country.name) === key) return country;
    if (stripDiacriticsLower(country.code) === key) return country;
    if (allNameFormsForCountry(country.id, country.name).some((f) => stripDiacriticsLower(f) === key)) {
      return country;
    }
  }
  return null;
}

/** Compare USA and Japan / Compare United States with Japan */
export function detectCompareIntent(raw: string): OsNavigateResult | null {
  const match = raw.match(
    /\bcompare\s+(.+?)\s+(?:and|with|vs\.?|versus)\s+(.+?)(?:[.?!]|$)/i,
  );
  if (!match) return null;
  const left = resolveCountryId(match[1]);
  const right = resolveCountryId(match[2]);
  if (left && right) {
    return {
      href: `/countries?country=${left.id}&compare=${right.id}`,
      assistantText: `Opening country intelligence to compare ${left.name} and ${right.name}. Comparables use registry facts only — no invented scores.`,
    };
  }
  // Company compare fallback
  const leftCo = companies.find((c) => stripDiacriticsLower(c.name) === stripDiacriticsLower(match[1]));
  const rightCo = companies.find((c) => stripDiacriticsLower(c.name) === stripDiacriticsLower(match[2]));
  if (leftCo && rightCo) {
    return {
      href: `/companies?company=${leftCo.id}`,
      assistantText: `Opening ${leftCo.name}. Use Comparables in the profile to benchmark against ${rightCo.name} when evidence allows.`,
    };
  }
  return {
    href: "/countries",
    assistantText: `I could not resolve both sides of that comparison in the registry. Opening Countries — try exact catalog names such as “United States” and “Japan”.`,
  };
}

/** Open United States / Search Apple / Search Stanford / Find corruption indicators */
export function detectOpenSearchIntent(raw: string): OsNavigateResult | null {
  const openMatch = raw.match(/^(?:open|show|go to)\s+(.+)$/i);
  const searchMatch = raw.match(/^(?:search|find)\s+(.+)$/i);
  const term = (openMatch?.[1] ?? searchMatch?.[1] ?? "").trim().replace(/[.?!]$/, "");
  if (!term) return null;

  // Skip if it's a module name handled by fixed commands
  if (
    /^(countries|companies|universities|research|evidence|reports|trust|governance|mission|home|settings)\b/i.test(
      term,
    )
  ) {
    return null;
  }

  if (/\bcorruption indicators?\b/i.test(term) || /\bcorruption\b/i.test(raw)) {
    return {
      href: "/knowledge?q=corruption",
      assistantText:
        "Opening Evidence for corruption-related indicators. CBAI does not invent corruption indices — only registered indicator methodology and connected sources.",
    };
  }

  if (/\bconstitutional evidence\b/i.test(raw) || /\bconstitution(al)?\b/i.test(term)) {
    return {
      href: "/trust#constitution",
      assistantText:
        "Opening Trust → Constitution. Constitutional evidence follows official texts when connected — never invented.",
    };
  }

  const country = resolveCountryId(term);
  if (country) {
    return {
      href: `/countries?country=${country.id}`,
      assistantText: `Opening ${country.name}.`,
    };
  }

  const company = companies.find(
    (c) =>
      stripDiacriticsLower(c.name) === stripDiacriticsLower(term) ||
      stripDiacriticsLower(c.name).startsWith(stripDiacriticsLower(term)),
  );
  if (company && term.length >= 3) {
    return {
      href: `/companies?company=${company.id}`,
      assistantText: `Opening ${company.name}.`,
    };
  }

  const university = universities.find(
    (u) =>
      stripDiacriticsLower(u.name) === stripDiacriticsLower(term) ||
      stripDiacriticsLower(u.name).includes(stripDiacriticsLower(term)),
  );
  if (university && term.length >= 4) {
    return {
      href: `/universities?university=${university.id}`,
      assistantText: `Opening ${university.name}.`,
    };
  }

  const topic = RESEARCH_TOPICS.find(
    (t) =>
      stripDiacriticsLower(t.topicName) === stripDiacriticsLower(term) ||
      stripDiacriticsLower(t.topicId) === stripDiacriticsLower(term.replace(/\s+/g, "-")),
  );
  if (topic) {
    return {
      href: getResearchTopicPath(topic.topicId),
      assistantText: `Opening research topic ${topic.topicName}.`,
    };
  }

  if (searchMatch) {
    return {
      href: `/search?q=${encodeURIComponent(term)}`,
      assistantText: `Searching the catalog for “${term}”.`,
    };
  }

  return null;
}
