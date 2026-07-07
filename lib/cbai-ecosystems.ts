export type EcosystemStatus = "available-today" | "in-development" | "future-workspace";

export type CBAIEcosystem = {
  id: string;
  title: string;
  audience: string;
  description: string;
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
    audience:
      "For citizens, governments, investors, students, and institutions.",
    description:
      "Search public profiles and review available official information.",
    status: "available-today",
    href: "/search",
  },
  {
    id: "research",
    title: "Research Intelligence",
    audience:
      "For scientists, universities, labs, experiments, publications, patents, and research collaboration.",
    description:
      "Connect research topics, scientists, universities, labs, publications, patents, datasets, and experiments.",
    status: "in-development",
  },
  {
    id: "economic",
    title: "Economic Intelligence",
    audience:
      "For economists, investors, banks, markets, inflation, interest rates, commodities, tenders, and global prices.",
    description:
      "Connect official economic data, banks, interest rates, inflation, tenders, commodity prices, markets, and investment evidence.",
    status: "future-workspace",
  },
  {
    id: "governance",
    title: "Governance Intelligence",
    audience:
      "For law, courts, rule of law, public administration, human rights, national strategies, geography, culture, and language.",
    description:
      "Connect governance, law, courts, rule of law, human rights, national strategies, geography, culture, and language.",
    status: "in-development",
  },
] as const;
