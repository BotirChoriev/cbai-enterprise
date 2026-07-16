import type { Country } from "@/lib/countries";
import type { CountryRelationships } from "@/lib/countries.adapter";
import { buildCountryCoverageProfile } from "@/lib/countries.coverage";
import { defaultEntityResolver } from "@/lib/intelligence/evidence/adapters/entity/entity-resolver";

/** Evidence connection classification for country views. */
export type CountryEvidenceStatus = "connected" | "insufficient" | "not_connected";

/** Persona identifiers aligned with CBAI governance standard. */
export type CountryPersonaId =
  | "citizen"
  | "investor"
  | "government"
  | "student"
  | "researcher"
  | "academic";

export const INSUFFICIENT_EVIDENCE_LABEL = "Insufficient Evidence";

export const NOT_CONNECTED_SOURCE_LABEL = "Evidence source not connected";

export const POLITICAL_NEUTRALITY_NOTICE =
  "CBAI provides evidence-based, politically neutral intelligence. It does not interfere in domestic politics or endorse political actors.";

export type CountryRegistryFacts = {
  name: string;
  code: string;
  capital: string;
  region: string;
  government: string;
  sourceLabel: string;
};

export type CountryPersonaSection = {
  id: CountryPersonaId;
  title: string;
  currentValue: string;
  futureCapability: string;
};

export type CountryTrustPillar = {
  id: string;
  title: string;
  description: string;
};

export type CountryLinkedEntities = CountryRelationships;

export type CountryIntelligenceProfile = {
  countryId: string;
  referenceConnected: boolean;
  registryFacts: CountryRegistryFacts;
  personas: CountryPersonaSection[];
  linkedEntities: CountryLinkedEntities;
  trustPillars: CountryTrustPillar[];
  coverage: ReturnType<typeof buildCountryCoverageProfile>;
  neutralityNotice: string;
};

const REGISTRY_SOURCE_LABEL = "Available — CBAI Local Registry";

function buildTrustPillars(): CountryTrustPillar[] {
  return [
    {
      id: "evidence-first",
      title: "Evidence First",
      description:
        "Country profiles display registry facts and coverage status. Extended intelligence is withheld until official sources connect.",
    },
    {
      id: "political-neutrality",
      title: "Political Neutrality",
      description:
        "CBAI does not endorse governments, publish geopolitical rankings, or substitute narratives for verified evidence.",
    },
    {
      id: "source-attribution",
      title: "Source Attribution",
      description:
        "Every indicator and source shows connection status. Required evidence sources are named — never hidden.",
    },
    {
      id: "methodology-before-metrics",
      title: "Methodology Before Metrics",
      description:
        "CBAI does not score without evidence. Future evaluations require methodology and connected sources.",
    },
    {
      id: "no-fake-data",
      title: "No Fake Data",
      description:
        "Unavailable sections state Not connected or Planned — never hidden behind synthetic scores or AI summaries.",
    },
    {
      id: "reproducibility",
      title: "Reproducibility",
      description:
        "Indicator IDs, source slugs, and coverage status export cleanly for researchers and academic citation.",
    },
  ];
}

function buildPersonaSections(countryName: string): CountryPersonaSection[] {
  return [
    {
      id: "citizen",
      title: "Citizen",
      currentValue: `Review ${countryName} registry facts, evidence coverage, and indicator status before relying on any public claim on this platform.`,
      futureCapability:
        "Governance, public services, and budget transparency indicators when national open data sources connect.",
    },
    {
      id: "investor",
      title: "Investor",
      currentValue:
        "Identify registry scope and which fiscal, trade, and investment indicators remain not connected — no due diligence scores today.",
      futureCapability:
        "National accounts, FDI statistics, and procurement disclosure when World Bank, IMF, and procurement sources connect.",
    },
    {
      id: "government",
      title: "Government",
      currentValue:
        "Use coverage maps to prioritize official data publication. CBAI provides no political ratings or policy recommendations.",
      futureCapability:
        "Open budget, procurement, and public service indicators when national portals and NSO feeds connect.",
    },
    {
      id: "student",
      title: "Student",
      currentValue:
        "Country name, capital, region, and government form from local registry. Linked universities from verified catalog relationships.",
      futureCapability:
        "Education enrollment and research indicators when UNESCO and national ministry sources connect.",
    },
    {
      id: "researcher",
      title: "Researcher",
      currentValue:
        "Export indicator coverage, source status, and Knowledge Graph relationship counts for reproducible research scoping.",
      futureCapability:
        "Time-series macro, climate, and human rights treaty data when UN and NSO evidence sources connect.",
    },
    {
      id: "academic",
      title: "Academic",
      currentValue:
        "CBAI separates reference registry data from assessed intelligence. Cite source status and methodology in scholarly work.",
      futureCapability:
        "Field-normalized indicators and cross-country comparisons when verified datasets and methodology versions publish.",
    },
  ];
}

/**
 * Build Countries Intelligence 2.0 profile — constitution-compliant, foundation-integrated.
 */
export function buildCountryIntelligenceProfile(
  country: Country,
  linkedEntities: CountryLinkedEntities,
): CountryIntelligenceProfile {
  const resolution = defaultEntityResolver.resolveRef({
    type: "country",
    id: country.id,
    name: country.name,
  });
  const referenceConnected = resolution.entity !== undefined;

  return {
    countryId: country.id,
    referenceConnected,
    registryFacts: {
      name: country.name,
      code: country.code,
      capital: country.capital,
      region: country.region,
      government: country.government,
      sourceLabel: referenceConnected
        ? REGISTRY_SOURCE_LABEL
        : INSUFFICIENT_EVIDENCE_LABEL,
    },
    personas: buildPersonaSections(country.name),
    linkedEntities,
    trustPillars: buildTrustPillars(),
    coverage: buildCountryCoverageProfile(country),
    neutralityNotice: POLITICAL_NEUTRALITY_NOTICE,
  };
}

/** Status badge label for list cards. */
export function resolveCountryListEvidenceLabel(
  profile: CountryIntelligenceProfile,
): string {
  const { evidenceCoverage } = profile.coverage;
  if (evidenceCoverage.connected > 0) {
    return `${evidenceCoverage.connected} indicator connected`;
  }
  if (profile.referenceConnected) {
    return "Registry available";
  }
  return INSUFFICIENT_EVIDENCE_LABEL;
}

/** Status color class for evidence badges. */
export function countryEvidenceStatusClass(
  status: CountryEvidenceStatus,
): string {
  switch (status) {
    case "connected":
      return "text-teal-400 bg-teal-500/10 border-teal-500/20";
    case "insufficient":
      return "text-amber-400 bg-amber-500/10 border-amber-500/20";
    case "not_connected":
      return "text-zinc-400 bg-zinc-800/50 border-zinc-700/50";
  }
}

export const COUNTRY_METHODOLOGY_POINTS = [
  {
    id: "no-score-without-evidence",
    title: "No scores without evidence",
    description:
      "CBAI does not display investment, risk, AI, or composite scores until verified evidence sources and methodology are connected.",
  },
  {
    id: "indicators-require-sources",
    title: "Indicators require sources",
    description:
      "Each indicator in the Global Indicator Framework declares required evidence sources. Status reflects real connectivity — not UI decoration.",
  },
  {
    id: "future-scores-require-methodology",
    title: "Future scores require methodology",
    description:
      "When evaluation becomes available, every metric will cite indicator ID, methodology version, and source provenance before display.",
  },
  {
    id: "no-social-sentiment",
    title: "No social sentiment scoring",
    description:
      "Social media sentiment, popularity indices, and viral metrics are excluded from CBAI country intelligence by constitutional standard.",
  },
  {
    id: "evidence-judgment-separation",
    title: "Evidence and judgment are separated",
    description:
      "Registry facts and connected evidence items are distinct from any future evaluative conclusions or recommendations.",
  },
] as const;
