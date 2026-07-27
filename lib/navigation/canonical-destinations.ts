/**
 * Canonical Intelligence OS destination registry.
 * Shared by navigation, breadcrumbs, page titles, and typed/voice commands.
 */

export type DestinationId =
  | "home"
  | "my_work"
  | "problems"
  | "search"
  | "discover"
  | "countries"
  | "companies"
  | "universities"
  | "research"
  | "evidence"
  | "graph"
  | "reports"
  | "investor"
  | "government"
  | "governance"
  | "trust"
  | "settings"
  | "about"
  | "rooms"
  | "notifications";

export type DestinationDefinition = {
  readonly id: DestinationId;
  readonly href: string;
  readonly titleKey: string;
  readonly primary: boolean;
  readonly aliases: readonly string[];
};

/**
 * Aliases are lowercase; matchers normalize apostrophes and whitespace.
 * Official entity names are not destinations — use search for those.
 */
export const CANONICAL_DESTINATIONS: readonly DestinationDefinition[] = [
  {
    id: "home",
    href: "/",
    titleKey: "navigation.home",
    primary: true,
    aliases: ["home", "bosh sahifa", "главная", "ana sayfa", "open home", "return home"],
  },
  {
    id: "my_work",
    href: "/my-work",
    titleKey: "navigation.myWork",
    primary: true,
    aliases: [
      "my work",
      "mening ishlarim",
      "mening ishim",
      "shaxsiy kabinet",
      "shaxsiy kabinetimni och",
      "kabinetimni och",
      "ish maydonimni och",
      "loyihalarimni ko'rsat",
      "моя работа",
      "личный кабинет",
      "открой мой кабинет",
      "çalışmalarım",
      "kişisel kabinimi aç",
      "show my active work",
      "open my work",
      "open my personal cabinet",
      "show my projects",
    ],
  },
  {
    id: "problems",
    href: "/problems",
    titleKey: "navigation.problemSpace",
    primary: true,
    aliases: [
      "problem space",
      "open problem space",
      "problems",
      "muammo maydoni",
      "muammolar",
      "muammo maydonini och",
    ],
  },
  {
    id: "search",
    href: "/search",
    titleKey: "navigation.search",
    primary: true,
    aliases: ["search", "qidiruv", "поиск", "arama", "open search"],
  },
  {
    id: "discover",
    href: "/discover",
    titleKey: "navigation.globalActivity",
    primary: true,
    aliases: ["global activity", "global faoliyat", "глобальная активность", "küresel etkinlik", "discover"],
  },
  {
    id: "countries",
    href: "/countries",
    titleKey: "navigation.worldIntelligence",
    primary: true,
    aliases: [
      "world intelligence",
      "countries",
      "mamlakatlar",
      "jahon tahlili",
      "страны",
      "ülkeler",
      "open uzbekistan",
      "o'zbekiston",
      "ozbekiston",
      "ўзбекистон",
    ],
  },
  {
    id: "research",
    href: "/research",
    titleKey: "navigation.researchEvidence",
    primary: true,
    aliases: ["research", "tadqiqot", "исследование", "araştırma", "tadqiqot sahifasi", "open research"],
  },
  {
    id: "reports",
    href: "/reports",
    titleKey: "navigation.reports",
    primary: true,
    aliases: ["reports", "hisobot", "hisobotlar", "отчёты", "отчеты", "raporlar", "create report", "hisobot yaratish"],
  },
  {
    id: "companies",
    href: "/companies",
    titleKey: "navigation.companies",
    primary: false,
    aliases: ["companies", "kompaniyalar", "компании", "şirketler"],
  },
  {
    id: "universities",
    href: "/universities",
    titleKey: "navigation.universities",
    primary: false,
    aliases: ["universities", "universitetlar", "университеты", "üniversiteler"],
  },
  {
    id: "evidence",
    href: "/evidence",
    titleKey: "navigation.evidence",
    primary: false,
    aliases: ["evidence", "dalil", "dalillar", "доказательства", "kanıt", "open evidence", "dalillarni och"],
  },
  {
    id: "graph",
    href: "/graph",
    titleKey: "navigation.knowledgeGraph",
    primary: false,
    aliases: ["knowledge graph", "bilim grafi", "граф знаний", "bilgi grafiği", "bilim grafiga", "graph"],
  },
  {
    id: "investor",
    href: "/investor",
    titleKey: "navigation.investor",
    primary: false,
    aliases: ["investor", "investor lens", "инвестор", "yatırımcı"],
  },
  {
    id: "government",
    href: "/government",
    titleKey: "navigation.government",
    primary: false,
    aliases: ["government", "hukumat", "правительство", "hükümet"],
  },
  {
    id: "governance",
    href: "/governance",
    titleKey: "navigation.governance",
    primary: false,
    aliases: ["governance", "boshqaruv", "управление", "yönetişim"],
  },
  {
    id: "trust",
    href: "/trust",
    titleKey: "navigation.trust",
    primary: false,
    aliases: ["trust", "ishonch", "доверие", "güven"],
  },
  {
    id: "settings",
    href: "/settings",
    titleKey: "navigation.settings",
    primary: false,
    aliases: ["settings", "sozlamalar", "настройки", "ayarlar", "privacy"],
  },
  {
    id: "about",
    href: "/about",
    titleKey: "navigation.about",
    primary: false,
    aliases: ["about", "haqida", "о платформе", "hakkında"],
  },
  {
    id: "rooms",
    href: "/rooms",
    titleKey: "navigation.liveRooms",
    primary: false,
    aliases: [
      "live rooms",
      "meeting hall",
      "yig'ilish zali",
      "yigilish zali",
      "зал встреч",
      "toplantı salonu",
      "open meeting hall",
    ],
  },
  {
    id: "notifications",
    href: "/notifications",
    titleKey: "navigation.globalUpdates",
    primary: false,
    aliases: ["global updates", "updates", "yangiliklar", "обновления", "güncellemeler", "followed updates"],
  },
] as const;

export function normalizeCommandText(input: string): string {
  return input
    .normalize("NFKC")
    .toLocaleLowerCase("en-US")
    .replace(/[’‘ʻʼ`´]/g, "'")
    .replace(/['']/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export function getDestinationById(id: DestinationId): DestinationDefinition {
  const found = CANONICAL_DESTINATIONS.find((item) => item.id === id);
  if (!found) throw new Error(`Unknown destination: ${id}`);
  return found;
}

export function getDestinationByHref(href: string): DestinationDefinition | null {
  const path = href.split("?")[0] ?? href;
  if (path === "/knowledge") return getDestinationById("evidence");
  return CANONICAL_DESTINATIONS.find((item) => item.href === path) ?? null;
}

export function listPrimaryDestinations(): readonly DestinationDefinition[] {
  return CANONICAL_DESTINATIONS.filter((item) => item.primary);
}

/** Match a natural-language command to at most three destination candidates. */
export function matchDestinationsFromCommand(text: string): readonly DestinationDefinition[] {
  const normalized = normalizeCommandText(text);
  if (!normalized) return [];

  const scored: Array<{ dest: DestinationDefinition; score: number }> = [];
  for (const dest of CANONICAL_DESTINATIONS) {
    let score = 0;
    for (const alias of dest.aliases) {
      const a = normalizeCommandText(alias);
      if (!a) continue;
      if (normalized === a) score = Math.max(score, 100);
      else if (normalized.includes(a)) score = Math.max(score, 80);
      else if (a.includes(normalized) && normalized.length >= 4) score = Math.max(score, 50);
    }
    // Light verb wrappers common in UZ/EN
    if (/och|o't|ot|open|show|ko'rsat|kor sat|покаж|göster/.test(normalized)) {
      for (const alias of dest.aliases) {
        const a = normalizeCommandText(alias);
        if (a && normalized.includes(a)) score = Math.max(score, 85);
      }
    }
    if (score > 0) scored.push({ dest, score });
  }

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((item) => item.dest);
}
