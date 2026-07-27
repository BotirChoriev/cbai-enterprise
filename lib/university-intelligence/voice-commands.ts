/**
 * University Intelligence voice / typed commands — read-only by default.
 */

import { universities } from "@/lib/universities";
import { countries } from "@/lib/countries";
import { namesMatch } from "@/lib/name-match";

export type UniversityIntelligenceVoiceResult =
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
        | "research_question"
        | "meeting_plan"
        | "project_presentation"
        | "collaboration_brief";
      readonly message: string;
      readonly universityIds: readonly string[];
      readonly idempotencyKey: string;
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

function findUniversities(raw: string): string[] {
  const n = normalize(raw);
  const found: string[] = [];
  for (const u of universities) {
    const forms = [u.name, u.icon, ...(u.aliases ?? [])].map(normalize).filter((f) => f.length >= 3);
    if (forms.some((f) => n.includes(f))) found.push(u.id);
  }
  return found;
}

function findCountryIds(raw: string): string[] {
  const n = normalize(raw);
  const ids: string[] = [];
  for (const c of countries) {
    if (namesMatch(c.name, raw) || n.includes(normalize(c.name)) || n.includes(normalize(c.code))) {
      ids.push(c.id);
    }
  }
  if (/\bgermany\b|\bgermaniya\b|\balmanya\b|\bгермания\b/.test(n) && !ids.includes("germany")) {
    ids.push("germany");
  }
  if (/\buzbekistan\b|\bozbekiston\b|\bözbekistan\b|\bузбекистан\b/.test(n) && !ids.includes("uzbekistan")) {
    ids.push("uzbekistan");
  }
  return ids;
}

export function resolveUniversityIntelligenceVoiceCommand(
  rawInput: string,
): UniversityIntelligenceVoiceResult | null {
  const trimmed = rawInput.trim();
  if (!trimmed) return null;
  const n = normalize(trimmed);
  const key = `uis:${n}`;

  const isUniIntent =
    /universit|lab|laborator|academic|faculty|department|collaboration|present(ation)?|water purification|methodology|opportunity|seminar|grant|patent|dataset|davlat|universitet|universität|üniversite|университет/i.test(
      trimmed,
    );
  if (!isUniIntent) return null;

  if (/stop listening|close (the )?operator|to'xta|закрыть оператор/i.test(trimmed)) {
    return {
      type: "message",
      message: "Stop/Close should be handled by the Voice Operator lifecycle — releasing mic/audio.",
      idempotencyKey: key,
    };
  }

  if (/missing|yetishmay|недоста|eksik|what information is missing/i.test(trimmed) && !/evidence request|dalil so|запрос доказательств|kanıt talebi/i.test(trimmed)) {
    const uni = findUniversities(trimmed)[0];
    const params = new URLSearchParams();
    if (uni) params.set("university", uni);
    params.set("tab", "evidence");
    params.set("section", "missing");
    return {
      type: "navigate",
      href: `/universities?${params.toString()}`,
      message: "Opening missing-data / evidence tab for University Intelligence.",
      idempotencyKey: key,
    };
  }

  // Do not steal Evidence Request / create intents — OO confirmation path owns those.
  if (/evidence request|create an evidence|dalil so|запрос доказательств|kanıt talebi/i.test(trimmed)) {
    return null;
  }

  if (/present(ation)?|tayyorla|hazırla|подготов/i.test(trimmed) && /project|loyiha|проект|proje/i.test(trimmed)) {
    return {
      type: "suggest_draft",
      preset: "project_presentation",
      message:
        "Prepared a Project Presentation Card draft. Nothing is sent until you confirm. Communication provider may be not connected.",
      universityIds: findUniversities(trimmed),
      idempotencyKey: key,
      requiresHumanConfirmation: true,
    };
  }

  if (/meeting plan|uchrashuv|план встречи|toplantı/i.test(trimmed)) {
    return {
      type: "suggest_draft",
      preset: "meeting_plan",
      message: "Prepared a Meeting Plan Draft Work Card. Consent required before recording or assignments.",
      universityIds: findUniversities(trimmed),
      idempotencyKey: key,
      requiresHumanConfirmation: true,
    };
  }

  if (/laborator|lab.*water|water purification|suv tozalash|wasseraufbereitung/i.test(trimmed)) {
    const params = new URLSearchParams();
    params.set("tab", "laboratories");
    params.set("q", "water purification");
    const countriesFound = findCountryIds(trimmed);
    if (countriesFound[0]) params.set("country", countriesFound[0]);
    return {
      type: "navigate",
      href: `/universities?${params.toString()}`,
      message: "Opening laboratories tab — verified lab data may be not connected.",
      idempotencyKey: key,
    };
  }

  if (/compare.*method|methodology|metodolog/i.test(trimmed)) {
    return {
      type: "navigate",
      href: `/universities?tab=collaboration&section=methods`,
      message: "Opening methodology comparison surface — work/methods only, never personal rankings.",
      idempotencyKey: key,
    };
  }

  if (/find universit|germany|uzbekistan|germaniya|ozbekiston/i.test(trimmed)) {
    const countryIds = findCountryIds(trimmed);
    const params = new URLSearchParams();
    if (countryIds.length) params.set("countries", countryIds.join(","));
    params.set("tab", "collaboration");
    return {
      type: "navigate",
      href: `/universities?${params.toString()}`,
      message: `Filtering University Intelligence by countries: ${countryIds.join(", ") || "all"}.`,
      idempotencyKey: key,
    };
  }

  const uni = findUniversities(trimmed)[0];
  if (uni) {
    return {
      type: "navigate",
      href: `/universities?university=${encodeURIComponent(uni)}&view=intelligence`,
      message: `Opening University Intelligence for ${uni}.`,
      idempotencyKey: key,
    };
  }

  return {
    type: "message",
    message: "University Intelligence heard the command but needs a university, tab, or presentation intent.",
    idempotencyKey: key,
  };
}
