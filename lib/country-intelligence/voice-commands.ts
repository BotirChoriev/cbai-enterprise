/**
 * Country Intelligence voice / typed commands — read-only navigation by default.
 * Mutations only suggest a Draft Work Card (never create silently).
 */

import { countries } from "@/lib/countries";
import { COUNTRY_LOCALIZED_NAMES, allNameFormsForCountry } from "@/lib/i18n/country-names";
import type { CountryIntelligenceDomainId } from "@/lib/country-intelligence/types";
import { isCountryIntelligenceDomainId } from "@/lib/country-intelligence/domains";

export type CountryIntelligenceVoiceResult =
  | {
      readonly type: "navigate";
      readonly href: string;
      readonly message: string;
      readonly idempotencyKey: string;
    }
  | {
      readonly type: "suggest_draft";
      readonly preset:
        | "evidence_request"
        | "work_plan"
        | "research_question"
        | "decision_brief"
        | "comparative_study"
        | "monitoring_plan";
      readonly message: string;
      readonly countryIds: readonly string[];
      readonly domainId: CountryIntelligenceDomainId | null;
      readonly idempotencyKey: string;
      /** Mutations require Draft Work Card confirmation — never auto-create. */
      readonly requiresHumanConfirmation: true;
    }
  | {
      readonly type: "message";
      readonly message: string;
      readonly idempotencyKey: string;
    };

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\u2018\u2019\u02bb\u02bcʻ''`]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function findCountriesInText(raw: string): string[] {
  const n = normalize(raw);
  const found: string[] = [];

  // Prefer explicit localized / catalog full names (longest match first).
  const candidates = countries
    .map((c) => ({
      id: c.id,
      forms: allNameFormsForCountry(c.id, c.name)
        .map(normalize)
        .filter((f) => f.length >= 4)
        .sort((a, b) => b.length - a.length),
    }))
    .sort((a, b) => (b.forms[0]?.length ?? 0) - (a.forms[0]?.length ?? 0));

  for (const c of candidates) {
    if (c.forms.some((f) => f && n.includes(f))) found.push(c.id);
  }

  // Extra UZ/RU short forms with word boundaries — never match inside other words
  // (e.g. "us" inside "ustuvorligi" must not resolve to USA).
  if (
    /\b(o['ʻ']?zbekiston|ozbekiston|uzbekistan|узбекистан)\b/i.test(n) &&
    !found.includes("uzbekistan")
  ) {
    found.push("uzbekistan");
  }
  if (/\b(germaniya|germany|almanya|германия)\b/i.test(n) && !found.includes("germany")) {
    found.push("germany");
  }
  if (/\b(yaponiya|japan|япония|japonya)\b/i.test(n) && !found.includes("japan")) {
    found.push("japan");
  }
  if (/\b(xitoy|china|китай|çin)\b/i.test(n) && !found.includes("china")) {
    found.push("china");
  }

  return found;
}

function detectDomain(raw: string): CountryIntelligenceDomainId | null {
  const n = normalize(raw);
  const map: Array<[RegExp, CountryIntelligenceDomainId]> = [
    [/qonun ustuvor|rule of law|верховенств|hukukun ustun/i, "rule_of_law"],
    [/adliya|justice|судеб|yargi/i, "justice"],
    [/demokrat|civic|fuqarolik|граждан/i, "democratic_processes"],
    [/talim|ta'lim|education|образован|eğitim|research|tadqiqot/i, "education_research"],
    [/iqtisod|economy|экономик|ekonomi|inflation|inflyatsiya|bandlik|employment/i, "economy"],
    [/sog'liq|health|здрав|sağlık/i, "health"],
    [/infratuzilma|infrastructure|инфраструктур/i, "infrastructure"],
    [/atrof-muhit|environment|эколог|çevre/i, "environment"],
    [/raqamli|digital|цифров|dijital/i, "digital_access"],
    [/huquq|human rights|прав человека|insan hak/i, "human_rights"],
    [/ijtimoiy|social|социаль|sosyal/i, "social_conditions"],
    [/davlat boshqaruvi|public administration|госуправлен|kamu yönet/i, "public_administration"],
  ];
  for (const [re, id] of map) {
    if (re.test(raw) || re.test(n)) return id;
  }
  return null;
}

function isCompareIntent(raw: string): boolean {
  return /taqqosla|compare|сравни|karşılaştır|vs\b|и\s+/i.test(raw);
}

function isEvidenceRequestIntent(raw: string): boolean {
  return /evidence request|yetishmayotgan|missing data|запрос доказательств|kanıt talebi/i.test(raw);
}

function isMonitoringIntent(raw: string): boolean {
  return /monitoring|monitoring reja|мониторинг|izleme plan/i.test(raw);
}

function isExplainIntent(raw: string): boolean {
  return /sabab|tushuntir|why did|explain|причин|açıkla/i.test(raw);
}

function isFiveYearIntent(raw: string): boolean {
  return /besh yillik|five.?year|пятилет|beş yıllık|so'nggi besh|oxirgi besh/i.test(raw);
}

/**
 * Resolve Country Intelligence voice/typed command.
 * Idempotency key is stable for identical normalized text so duplicates do not double-fire.
 */
export function resolveCountryIntelligenceVoiceCommand(
  rawInput: string,
): CountryIntelligenceVoiceResult | null {
  const trimmed = rawInput.trim();
  if (!trimmed) return null;

  const countryHint =
    /country intelligence|davlat intellekt|странов|ülke istihbarat|qonun ustuvor|ko['ʻ']?rsatkich|indicator|taqqosla|compare countries|five.?year|besh yillik|yetishmayotgan|evidence request|monitoring reja|monitoring plan|nima uchun o['ʻ']?zgardi|why did it change|tushuntir/i.test(
      trimmed,
    ) ||
    (/taqqosla|compare|сравни|karşılaştır/i.test(trimmed) &&
      Object.values(COUNTRY_LOCALIZED_NAMES).some(
        (n) => trimmed.includes(n.uz) || trimmed.includes(n.ru) || trimmed.toLowerCase().includes("germany") || trimmed.toLowerCase().includes("uzbekistan"),
      ));

  if (!countryHint && !isFiveYearIntent(trimmed) && !isEvidenceRequestIntent(trimmed) && !isMonitoringIntent(trimmed)) {
    return null;
  }

  const countryIds = findCountriesInText(trimmed);
  const domainId = detectDomain(trimmed);
  const key = `cis:${normalize(trimmed)}`;

  if (isEvidenceRequestIntent(trimmed)) {
    return {
      type: "suggest_draft",
      preset: "evidence_request",
      message:
        "Prepared an Evidence Request Draft Work Card for missing country data. Nothing is saved until you confirm.",
      countryIds,
      domainId,
      idempotencyKey: key,
      requiresHumanConfirmation: true,
    };
  }

  if (isMonitoringIntent(trimmed)) {
    return {
      type: "suggest_draft",
      preset: "monitoring_plan",
      message:
        "Prepared a Monitoring Plan Draft Work Card. Nothing is saved until you confirm.",
      countryIds,
      domainId,
      idempotencyKey: key,
      requiresHumanConfirmation: true,
    };
  }

  if (isCompareIntent(trimmed) && countryIds.length >= 2) {
    const params = new URLSearchParams();
    params.set("countries", countryIds.slice(0, 4).join(","));
    if (domainId) params.set("domain", domainId);
    return {
      type: "navigate",
      href: `/countries/compare?${params.toString()}`,
      message: `Opening country comparison for ${countryIds.slice(0, 4).join(", ")}.`,
      idempotencyKey: key,
    };
  }

  if (isCompareIntent(trimmed) && countryIds.length >= 1) {
    return {
      type: "suggest_draft",
      preset: "comparative_study",
      message:
        "Prepared a Comparative Study Draft Work Card. Add 2–4 countries, then confirm — nothing is saved yet.",
      countryIds,
      domainId,
      idempotencyKey: key,
      requiresHumanConfirmation: true,
    };
  }

  if (countryIds[0]) {
    const params = new URLSearchParams();
    params.set("country", countryIds[0]);
    params.set("view", "intelligence");
    if (domainId && isCountryIntelligenceDomainId(domainId)) params.set("domain", domainId);
    if (isFiveYearIntent(trimmed)) params.set("history", "5");
    if (isExplainIntent(trimmed)) params.set("section", "causes");
    return {
      type: "navigate",
      href: `/countries?${params.toString()}`,
      message: `Opening Country Intelligence for ${countryIds[0]}.`,
      idempotencyKey: key,
    };
  }

  return {
    type: "message",
    message: "Country Intelligence heard the command but could not resolve a country. Try naming the country explicitly.",
    idempotencyKey: key,
  };
}
