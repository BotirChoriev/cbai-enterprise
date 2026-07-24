/** Research domain resolution — chemistry, biology, etc. Not chemistry-only. */

import { filterResearchTopics, getResearchTopicPath, RESEARCH_TOPICS } from "@/lib/research/research-topics";
import type { OperationalObjectDomain, OperationalObjectType } from "@/lib/operational-objects/operational-object.types";
import { containsNormalizedPhrase, normalizePlatformText } from "@/lib/platform-actions/normalize-text";

export type PlatformDomainId =
  | "chemistry"
  | "biology"
  | "medicine"
  | "physics"
  | "engineering"
  | "environment"
  | "economics"
  | "governance"
  | "education"
  | "technology";

export type PlatformDomainMapping = {
  readonly id: PlatformDomainId;
  readonly defaultDomain: OperationalObjectDomain;
  readonly recommendedType: OperationalObjectType;
  readonly aliases: readonly string[];
  readonly professionMarkers: readonly string[];
  readonly topicQuery?: string;
  readonly fallbackHref: string;
};

export const PLATFORM_DOMAIN_MAPPINGS: readonly PlatformDomainMapping[] = [
  {
    id: "chemistry",
    defaultDomain: "research",
    recommendedType: "research_question",
    aliases: ["kimyo", "chemistry", "ximiya", "химия", "kimya", "kimyo bo'limi", "chemistry research"],
    professionMarkers: ["kimyogar", "chemist", "ximik", "kimyogarman", "kimyager", "химик"],
    topicQuery: "chemistry",
    fallbackHref: "/research?q=chemistry",
  },
  {
    id: "biology",
    defaultDomain: "research",
    recommendedType: "research_question",
    aliases: ["biologiya", "biology", "biolog", "биология"],
    professionMarkers: ["biolog", "biologist"],
    topicQuery: "microbiology",
    fallbackHref: "/research/microbiology",
  },
  {
    id: "medicine",
    defaultDomain: "research",
    recommendedType: "research_question",
    aliases: ["tibbiyot", "medicine", "medical", "медицина", "tıp"],
    professionMarkers: ["shifokor", "doctor", "vrach"],
    topicQuery: "public-health",
    fallbackHref: "/research/public-health-systems",
  },
  {
    id: "physics",
    defaultDomain: "research",
    recommendedType: "research_question",
    aliases: ["fizika", "physics", "физика"],
    professionMarkers: ["fizik", "physicist"],
    topicQuery: "quantum",
    fallbackHref: "/research",
  },
  {
    id: "engineering",
    defaultDomain: "research",
    recommendedType: "work_plan",
    aliases: ["muhandislik", "engineering", "инженерия", "mühendislik"],
    professionMarkers: ["muhandis", "engineer"],
    topicQuery: "structural",
    fallbackHref: "/research/structural-safety",
  },
  {
    id: "environment",
    defaultDomain: "research",
    recommendedType: "research_question",
    aliases: ["ekologiya", "environment", "climate", "iqlim", "экология", "çevre"],
    professionMarkers: ["ekolog", "ecologist"],
    topicQuery: "climate",
    fallbackHref: "/research/climate-adaptation",
  },
  {
    id: "economics",
    defaultDomain: "investor",
    recommendedType: "work_plan",
    aliases: ["iqtisod", "economics", "economy", "экономика", "ekonomi"],
    professionMarkers: ["iqtisodchi", "economist"],
    fallbackHref: "/investor",
  },
  {
    id: "governance",
    defaultDomain: "governance",
    recommendedType: "review",
    aliases: ["boshqaruv", "public policy", "policy", "siyosat"],
    professionMarkers: ["siyosatshunos"],
    fallbackHref: "/governance",
  },
  {
    id: "education",
    defaultDomain: "general",
    recommendedType: "work_plan",
    aliases: ["ta'lim", "education", "образование", "eğitim"],
    professionMarkers: ["o'qituvchi", "teacher"],
    fallbackHref: "/research",
  },
  {
    id: "technology",
    defaultDomain: "research",
    recommendedType: "work_plan",
    aliases: ["texnologiya", "technology", "tech", "технологии", "teknoloji"],
    professionMarkers: ["dasturchi", "developer"],
    topicQuery: "ai",
    fallbackHref: "/research/ai-safety",
  },
];

export type DomainResolution = {
  readonly domain: PlatformDomainMapping;
  readonly topicId: string | null;
  readonly href: string;
  readonly userContextOnly: boolean;
  readonly titleSuggestion: string;
};

const RESEARCH_START_MARKERS = /(tadqiqot|research|study|boshlamoq|start|begin|yaratmoq|create|plan)/i;

export function resolvePlatformDomain(text: string): DomainResolution | null {
  const normalized = normalizePlatformText(text);
  if (!normalized) return null;

  for (const mapping of PLATFORM_DOMAIN_MAPPINGS) {
    const aliasHit = mapping.aliases.some((alias) => containsNormalizedPhrase(normalized, alias));
    const professionHit = mapping.professionMarkers.some((marker) => containsNormalizedPhrase(normalized, marker));
    if (!aliasHit && !professionHit) continue;

    let topicId: string | null = null;
    if (mapping.topicQuery && mapping.id !== "chemistry") {
      const matches = filterResearchTopics(RESEARCH_TOPICS, { query: mapping.topicQuery });
      topicId = matches[0]?.topicId ?? null;
    }

    // Chemistry has no dedicated topic page — open Research catalog with chemistry filter.
    const href =
      mapping.id === "chemistry"
        ? `/research?q=${encodeURIComponent("chemistry")}`
        : topicId
          ? getResearchTopicPath(topicId)
          : mapping.fallbackHref;
    const titleBase = mapping.aliases[0] ?? mapping.id;
    const titleSuggestion =
      RESEARCH_START_MARKERS.test(text)
        ? `${titleBase.charAt(0).toUpperCase()}${titleBase.slice(1)} research`
        : `${titleBase.charAt(0).toUpperCase()}${titleBase.slice(1)}`;

    return {
      domain: mapping,
      topicId,
      href,
      userContextOnly: professionHit && !aliasHit,
      titleSuggestion,
    };
  }

  return null;
}

export function localizedDomainTitle(domain: PlatformDomainMapping, locale: string): string {
  const titles: Record<PlatformDomainId, Record<string, string>> = {
    chemistry: { en: "Chemistry research", uz: "Kimyo bo'yicha tadqiqot", ru: "Исследование по химии", tr: "Kimya araştırması" },
    biology: { en: "Biology research", uz: "Biologiya bo'yicha tadqiqot", ru: "Исследование по биологии", tr: "Biyoloji araştırması" },
    medicine: { en: "Medicine research", uz: "Tibbiyot bo'yicha tadqiqot", ru: "Медицинское исследование", tr: "Tıp araştırması" },
    physics: { en: "Physics research", uz: "Fizika bo'yicha tadqiqot", ru: "Исследование по физике", tr: "Fizik araştırması" },
    engineering: { en: "Engineering research", uz: "Muhandislik tadqiqoti", ru: "Инженерное исследование", tr: "Mühendislik araştırması" },
    environment: { en: "Environment research", uz: "Ekologiya tadqiqoti", ru: "Экологическое исследование", tr: "Çevre araştırması" },
    economics: { en: "Economics analysis", uz: "Iqtisodiy tahlil", ru: "Экономический анализ", tr: "Ekonomi analizi" },
    governance: { en: "Governance review", uz: "Boshqaruv ko'rib chiqish", ru: "Обзор управления", tr: "Yönetişim incelemesi" },
    education: { en: "Education work plan", uz: "Ta'lim ish rejasi", ru: "План образовательной работы", tr: "Eğitim çalışma planı" },
    technology: { en: "Technology research", uz: "Texnologiya tadqiqoti", ru: "Технологическое исследование", tr: "Teknoloji araştırması" },
  };
  return titles[domain.id][locale] ?? titles[domain.id].en ?? domain.id;
}
