import type { Company } from "@/lib/companies";
import type { CompanyLinkedEntities } from "@/lib/companies.adapter";
import { buildCompanyCoverageProfile } from "@/lib/companies.coverage";
import { defaultEntityResolver } from "@/lib/intelligence/evidence/adapters/entity/entity-resolver";

export type CompanyEvidenceStatus = "connected" | "insufficient" | "not_connected";

export type CompanyPersonaId =
  | "citizen"
  | "investor"
  | "government"
  | "student"
  | "researcher"
  | "academic";

export const INSUFFICIENT_EVIDENCE_LABEL = "Insufficient Evidence";

export const NOT_CONNECTED_SOURCE_LABEL = "Evidence source not connected";

export const COMMERCIAL_NEUTRALITY_NOTICE =
  "CBAI provides evidence-based, neutral company intelligence. It does not endorse, attack, or commercially promote any company.";

export type CompanyRegistryFacts = {
  name: string;
  icon: string;
  country: string;
  industry: string;
  founded: number;
  sourceLabel: string;
};

export type CompanyPersonaSection = {
  id: CompanyPersonaId;
  title: string;
  currentValue: string;
  futureCapability: string;
};

export type CompanyTrustPillar = {
  id: string;
  title: string;
  description: string;
};

export type CompanyIntelligenceProfile = {
  companyId: string;
  referenceConnected: boolean;
  registryFacts: CompanyRegistryFacts;
  personas: CompanyPersonaSection[];
  linkedEntities: CompanyLinkedEntities;
  trustPillars: CompanyTrustPillar[];
  coverage: ReturnType<typeof buildCompanyCoverageProfile>;
  neutralityNotice: string;
};

const REGISTRY_SOURCE_LABEL = "Available — CBAI Local Registry";

function buildTrustPillars(): CompanyTrustPillar[] {
  return [
    {
      id: "evidence",
      title: "Evidence",
      description:
        "Company profiles display registry facts and coverage status. Financial, market, and ESG intelligence is withheld until official sources connect.",
    },
    {
      id: "transparency",
      title: "Transparency",
      description:
        "Every indicator and source shows connection status. Required evidence sources are named — never hidden behind UI polish.",
    },
    {
      id: "methodology",
      title: "Methodology",
      description:
        "CBAI does not score without evidence. Future evaluations require methodology, indicator IDs, and source provenance.",
    },
    {
      id: "political-neutrality",
      title: "Political Neutrality",
      description:
        "CBAI does not endorse companies, publish buy/sell recommendations, or substitute marketing narratives for verified evidence.",
    },
    {
      id: "no-fake-data",
      title: "No Fake Data",
      description:
        "Unavailable sections state Not connected or Planned — never hidden behind synthetic revenue, market cap, or AI summaries.",
    },
  ];
}

function buildPersonaSections(companyName: string): CompanyPersonaSection[] {
  return [
    {
      id: "citizen",
      title: "Citizen",
      currentValue: `Review ${companyName} registry facts and procurement indicator status. No public responsibility scores or ESG ratings are shown today.`,
      futureCapability:
        "Procurement participation and corporate governance indicators when government registry and procurement sources connect.",
    },
    {
      id: "investor",
      title: "Investor",
      currentValue:
        "Identify registry scope and which financial, trade, and investment indicators remain not connected — no valuation or confidence scores today.",
      futureCapability:
        "Financial reporting, ownership transparency, and stock exchange data when annual report and securities sources connect.",
    },
    {
      id: "government",
      title: "Government",
      currentValue:
        "Use coverage maps to see which compliance and procurement indicators require official sources. No regulatory recommendations.",
      futureCapability:
        "Procurement registry participation and compliance indicators when government and open data sources connect.",
    },
    {
      id: "student",
      title: "Student",
      currentValue:
        "Company name, industry, headquarters country, and founding year from local registry. Linked universities from verified catalog relationships.",
      futureCapability:
        "Research activity and innovation evidence when bibliometric and patent sources connect.",
    },
    {
      id: "researcher",
      title: "Researcher",
      currentValue:
        "Export indicator coverage, source status, and Knowledge Graph relationship counts for reproducible research scoping.",
      futureCapability:
        "Supply chain, environmental, and employment indicators when official statistical and regulatory sources connect.",
    },
    {
      id: "academic",
      title: "Academic",
      currentValue:
        "CBAI separates reference catalog data from assessed intelligence. Cite source status and methodology in scholarly work.",
      futureCapability:
        "Field-normalized corporate indicators and cross-company comparisons when verified datasets publish.",
    },
  ];
}

export function buildCompanyIntelligenceProfile(
  company: Company,
  linkedEntities: CompanyLinkedEntities,
): CompanyIntelligenceProfile {
  const resolution = defaultEntityResolver.resolveRef({
    type: "company",
    id: company.id,
    name: company.name,
  });
  const referenceConnected = resolution.entity !== undefined;

  return {
    companyId: company.id,
    referenceConnected,
    registryFacts: {
      name: company.name,
      icon: company.icon,
      country: company.country,
      industry: company.industry,
      founded: company.founded,
      sourceLabel: referenceConnected
        ? REGISTRY_SOURCE_LABEL
        : INSUFFICIENT_EVIDENCE_LABEL,
    },
    personas: buildPersonaSections(company.name),
    linkedEntities,
    trustPillars: buildTrustPillars(),
    coverage: buildCompanyCoverageProfile(company),
    neutralityNotice: COMMERCIAL_NEUTRALITY_NOTICE,
  };
}

export function resolveCompanyListEvidenceLabel(
  profile: CompanyIntelligenceProfile,
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

export { companyEvidenceStatusClass } from "@/lib/companies.coverage";

export const COMPANY_METHODOLOGY_POINTS = [
  {
    id: "no-score-without-evidence",
    title: "No scores without evidence",
    description:
      "CBAI does not display revenue, market cap, innovation, investment, ESG, or AI scores until verified official sources and methodology connect.",
  },
  {
    id: "evidence-before-judgment",
    title: "Evidence before judgment",
    description:
      "Registry facts and connected evidence items are shown first. Evaluative conclusions require a documented evidence chain.",
  },
  {
    id: "indicators-require-sources",
    title: "Indicators require official sources",
    description:
      "Each indicator in the Global Indicator Framework declares required sources. Status reflects real connectivity — not UI decoration.",
  },
  {
    id: "no-partner-competitor-claims",
    title: "No unverified relationship claims",
    description:
      "Partner and competitor lists are not inferred. Knowledge Graph shows verified local catalog relationships only.",
  },
  {
    id: "evidence-judgment-separation",
    title: "Evidence and judgment are separated",
    description:
      "Catalog facts are distinct from any future evaluative metrics or commercial recommendations.",
  },
] as const;
