export type EcosystemStatus = "available-today" | "in-development" | "future-workspace";

export type EcosystemIconId = "public" | "research" | "economic" | "governance";

export type CBAIEcosystem = {
  id: EcosystemIconId;
  title: string;
  valueSentence: string;
  bullets: readonly [string, string, string];
  status: EcosystemStatus;
  href?: string;
};

export const ECOSYSTEM_STATUS_LABELS: Record<EcosystemStatus, string> = {
  "available-today": "Available today",
  "in-development": "In development",
  "future-workspace": "Future workspace",
};

export const CBAI_ECOSYSTEMS: readonly CBAIEcosystem[] = [
  {
    id: "public",
    title: "Public Intelligence",
    valueSentence: "Search profiles and review what official information is available today.",
    bullets: [
      "Country, company, and university profiles",
      "Available and missing information",
      "Reports Center for continued review",
    ],
    status: "available-today",
    href: "/search",
  },
  {
    id: "research",
    title: "Research Intelligence",
    valueSentence: "Connect research topics, institutions, and scientific evidence over time.",
    bullets: [
      "Universities, labs, and publications",
      "Patents, datasets, and experiments",
      "Research collaboration workspace",
    ],
    status: "in-development",
  },
  {
    id: "economic",
    title: "Economic Intelligence",
    valueSentence: "Connect official economic data, markets, and investment evidence.",
    bullets: [
      "Markets, inflation, and interest rates",
      "Commodities, tenders, and global prices",
      "Investment and banking evidence",
    ],
    status: "future-workspace",
  },
  {
    id: "governance",
    title: "Governance Intelligence",
    valueSentence: "Connect law, public administration, and national strategy evidence.",
    bullets: [
      "Courts, rule of law, and human rights",
      "National strategies and public administration",
      "Geography, culture, and language context",
    ],
    status: "in-development",
  },
] as const;
