export type EcosystemStatus = "available-today" | "in-development" | "future-workspace";

export type EcosystemIconId = "research" | "governance" | "economic" | "public";

export type CBAIEcosystem = {
  id: EcosystemIconId;
  title: string;
  flagship?: boolean;
  valueSentence: string;
  bullets: readonly [string, string, string];
  status: EcosystemStatus;
  href?: string;
  ctaLabel?: string;
};

export const ECOSYSTEM_STATUS_LABELS: Record<EcosystemStatus, string> = {
  "available-today": "Available today",
  "in-development": "In development",
  "future-workspace": "Future workspace",
};

// Research, Governance, and Economic Intelligence are CBAI's three ecosystems, built on one
// shared Intelligence Core (evidence, workflow, and human decision support). Public search
// across countries, companies, and universities is the shared entry point into that core, not
// a fourth competing ecosystem — listed last and framed accordingly.
export const CBAI_ECOSYSTEMS: readonly CBAIEcosystem[] = [
  {
    id: "research",
    title: "Research Intelligence",
    flagship: true,
    valueSentence:
      "Define a research mission, connect evidence, and follow a deterministic review workflow from readiness to a recommended next action.",
    bullets: [
      "64 catalog research topics with mission, evidence, and review workflow",
      "Deterministic readiness, health, and workflow intelligence — no invented scores",
      "Evidence gaps and open questions surfaced honestly, never hidden",
    ],
    status: "available-today",
    href: "/research",
    ctaLabel: "Explore Research Intelligence →",
  },
  {
    id: "governance",
    title: "Governance Intelligence",
    valueSentence:
      "Connect countries, institutions, law, and public administration evidence — without ranking or labeling any country as \"best.\"",
    bullets: [
      "Courts, rule of law, and human rights context",
      "National strategies and public administration evidence",
      "Geography, culture, and language context",
    ],
    status: "in-development",
  },
  {
    id: "economic",
    title: "Economic Intelligence",
    valueSentence:
      "Connect official economic indicators, markets, and investment evidence — for context and comparison, never commands.",
    bullets: [
      "Markets, inflation, and interest rates",
      "Commodities, tenders, and global prices",
      "Investment and banking evidence",
    ],
    status: "future-workspace",
  },
  {
    id: "public",
    title: "Evidence Core",
    valueSentence:
      "Search profiles and review what official information is available today across countries, companies, and universities.",
    bullets: [
      "Country, company, and university profiles",
      "Available and missing information, shown honestly",
      "Reports Center for continued review",
    ],
    status: "available-today",
    href: "/search",
    ctaLabel: "Start with Search →",
  },
] as const;
