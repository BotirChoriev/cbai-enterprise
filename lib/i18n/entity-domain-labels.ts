/**
 * Deterministic localization for platform-controlled *category* vocabulary
 * (company industries and research domains).
 *
 * Policy:
 *   - These are platform taxonomy terms, NOT registered proper names, so they
 *     must be localized like any other UI copy.
 *   - Registered entity names (Apple, Stanford University, United States, …)
 *     are proper names and must NEVER be routed through this module.
 *   - Unknown labels fall back to the original string unchanged, so data-driven
 *     values never render as a missing-key error.
 */
import { canonicalizeUiLocale } from "@/lib/i18n/canonicalize-locale";

type LocaleMap = Record<"en" | "uz" | "ru" | "tr", string>;

const INDUSTRY_LABELS: Record<string, LocaleMap> = {
  "Artificial Intelligence": {
    en: "Artificial Intelligence",
    uz: "Sun’iy intellekt",
    ru: "Искусственный интеллект",
    tr: "Yapay zekâ",
  },
  Automotive: {
    en: "Automotive",
    uz: "Avtomobil sanoati",
    ru: "Автомобилестроение",
    tr: "Otomotiv",
  },
  "Consumer Electronics": {
    en: "Consumer Electronics",
    uz: "Maishiy elektronika",
    ru: "Бытовая электроника",
    tr: "Tüketici elektroniği",
  },
  "E-Commerce": {
    en: "E-Commerce",
    uz: "Elektron tijorat",
    ru: "Электронная коммерция",
    tr: "E-ticaret",
  },
  Semiconductors: {
    en: "Semiconductors",
    uz: "Yarimo‘tkazgichlar",
    ru: "Полупроводники",
    tr: "Yarı iletkenler",
  },
  Technology: {
    en: "Technology",
    uz: "Texnologiya",
    ru: "Технологии",
    tr: "Teknoloji",
  },
};

const RESEARCH_DOMAIN_LABELS: Record<string, LocaleMap> = {
  "Life Sciences": { en: "Life Sciences", uz: "Hayot fanlari", ru: "Науки о жизни", tr: "Yaşam bilimleri" },
  Medicine: { en: "Medicine", uz: "Tibbiyot", ru: "Медицина", tr: "Tıp" },
  Agriculture: { en: "Agriculture", uz: "Qishloq xo‘jaligi", ru: "Сельское хозяйство", tr: "Tarım" },
  "Climate & Environment": {
    en: "Climate & Environment",
    uz: "Iqlim va atrof-muhit",
    ru: "Климат и окружающая среда",
    tr: "İklim ve çevre",
  },
  Energy: { en: "Energy", uz: "Energetika", ru: "Энергетика", tr: "Enerji" },
  "Materials Science": {
    en: "Materials Science",
    uz: "Materialshunoslik",
    ru: "Материаловедение",
    tr: "Malzeme bilimi",
  },
  Engineering: { en: "Engineering", uz: "Muhandislik", ru: "Инженерия", tr: "Mühendislik" },
  "Computer Science": {
    en: "Computer Science",
    uz: "Kompyuter fanlari",
    ru: "Информатика",
    tr: "Bilgisayar bilimi",
  },
  "Economics & Policy": {
    en: "Economics & Policy",
    uz: "Iqtisod va siyosat",
    ru: "Экономика и политика",
    tr: "Ekonomi ve politika",
  },
  "Social Sciences": {
    en: "Social Sciences",
    uz: "Ijtimoiy fanlar",
    ru: "Социальные науки",
    tr: "Sosyal bilimler",
  },
};

function localizeFrom(map: Record<string, LocaleMap>, label: string, locale: string): string {
  const entry = map[label];
  if (!entry) return label;
  const canonical = canonicalizeUiLocale(locale);
  return entry[canonical] ?? entry.en;
}

/** Localize a platform company-industry taxonomy label. Unknown labels pass through. */
export function localizeIndustryLabel(label: string, locale: string): string {
  return localizeFrom(INDUSTRY_LABELS, label, locale);
}

/** Localize a platform research-domain taxonomy label. Unknown labels pass through. */
export function localizeResearchDomainLabel(label: string, locale: string): string {
  return localizeFrom(RESEARCH_DOMAIN_LABELS, label, locale);
}

export const KNOWN_INDUSTRY_LABELS = Object.keys(INDUSTRY_LABELS);
export const KNOWN_RESEARCH_DOMAIN_LABELS = Object.keys(RESEARCH_DOMAIN_LABELS);
