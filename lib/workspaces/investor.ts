import { countries } from "@/lib/countries";
import { companies } from "@/lib/companies";
import { universities } from "@/lib/universities";
import type { IndicatorDomainId } from "@/lib/indicator-framework/types";
import { FRAMEWORK_VERSION } from "@/lib/indicator-framework";
import { INFRASTRUCTURE_VERSION } from "@/lib/evidence-infrastructure/types";
import { GOVERNANCE_VERSION } from "@/lib/governance/types";
import {
  WORKSPACES_VERSION,
  buildDomainCoverage,
  buildSourceCoverage,
  buildWorkspaceSummary,
  type WorkspaceBaseModel,
  type WorkspaceCoverageItem,
  type WorkspaceEntityLink,
  type WorkspaceMethodologyPoint,
  type WorkspacePersona,
  type WorkspaceSourceItem,
  type WorkspaceTrustPillar,
} from "@/lib/workspaces";

export const INVESTOR_WORKSPACE_VERSION = "1.0.0" as const;

const INVESTMENT_DOMAIN_IDS: readonly IndicatorDomainId[] = [
  "economy",
  "investment",
  "trade",
  "industry",
  "infrastructure",
  "energy",
  "employment",
  "digital-development",
  "public-procurement",
  "budget-transparency",
];

const INVESTOR_SOURCE_SLUGS = [
  "world-bank",
  "imf",
  "oecd",
  "national-statistics-offices",
  "official-procurement-portals",
  "national-open-budget-portals",
  "cbai-local-registry",
] as const;

export type InvestorWorkspaceModel = WorkspaceBaseModel & {
  workspaceVersion: typeof INVESTOR_WORKSPACE_VERSION;
  hero: {
    title: string;
    subtitle: string;
    description: string;
  };
  investmentEvidenceMap: readonly WorkspaceCoverageItem[];
  entityLinks: readonly WorkspaceEntityLink[];
  sources: readonly WorkspaceSourceItem[];
  opportunityReadiness: readonly WorkspaceCoverageItem[];
  methodology: readonly WorkspaceMethodologyPoint[];
  personas: readonly WorkspacePersona[];
  trustPillars: readonly WorkspaceTrustPillar[];
};

function buildEntityLinks(): WorkspaceEntityLink[] {
  return [
    {
      id: "countries",
      label: "Countries",
      route: "/countries",
      registryCount: countries.length,
      description:
        "Country registry facts and indicator coverage — no investment scores.",
    },
    {
      id: "companies",
      label: "Companies",
      route: "/companies",
      registryCount: companies.length,
      description:
        "Company registry and industry classification readiness — not market recommendations.",
    },
    {
      id: "universities",
      label: "Universities",
      route: "/universities",
      registryCount: universities.length,
      description:
        "University registry and research indicator status — not league tables.",
    },
  ];
}

function buildMethodology(): WorkspaceMethodologyPoint[] {
  return [
    {
      id: "no-investment-advice",
      title: "No investment advice",
      description:
        "This workspace shows evidence readiness — not where to invest or divest.",
    },
    {
      id: "no-score-without-evidence",
      title: "No score without evidence",
      description:
        "Investment climate metrics are withheld until official sources connect and verify.",
    },
    {
      id: "no-recommendation-without-source",
      title: "No recommendation without source",
      description:
        "Every future investment-related claim must trace to a registered source slug.",
    },
  ];
}

function buildPersonas(): WorkspacePersona[] {
  return [
    {
      id: "investor",
      title: "Investor",
      answer:
        "Which economic, trade, and procurement evidence domains have connected sources versus gaps.",
    },
    {
      id: "government",
      title: "Government",
      answer:
        "Which official datasets investors would need for transparent due diligence scoping.",
    },
    {
      id: "researcher",
      title: "Researcher",
      answer:
        "Indicator and source registry status for reproducible investment climate research.",
    },
    {
      id: "academic",
      title: "Academic",
      answer:
        "Methodology definitions for investment-related indicators before citing evaluations.",
    },
    {
      id: "citizen",
      title: "Citizen",
      answer:
        "How public procurement and budget transparency evidence connects — without market hype.",
    },
    {
      id: "student",
      title: "Student",
      answer:
        "The difference between registry facts and future investment metrics on entity routes.",
    },
  ];
}

function buildTrustPillars(): WorkspaceTrustPillar[] {
  return [
    {
      id: "source-attribution",
      title: "Source attribution",
      description:
        "World Bank, IMF, OECD, NSO, and procurement sources listed with connection status.",
    },
    {
      id: "reproducibility",
      title: "Reproducibility",
      description:
        "Domain and source slugs are exportable for audit — no hidden data pipelines.",
    },
    {
      id: "no-fabricated-metrics",
      title: "No fabricated metrics",
      description:
        "No opportunity scores, market charts, or growth KPIs on this workspace.",
    },
  ];
}

/** Build the Investor Intelligence Workspace model. */
export function buildInvestorWorkspace(): InvestorWorkspaceModel {
  const investmentEvidenceMap = buildDomainCoverage(INVESTMENT_DOMAIN_IDS, "investor");

  return {
    version: WORKSPACES_VERSION,
    workspaceVersion: INVESTOR_WORKSPACE_VERSION,
    frameworkVersion: FRAMEWORK_VERSION,
    infrastructureVersion: INFRASTRUCTURE_VERSION,
    governanceVersion: GOVERNANCE_VERSION,
    summary: buildWorkspaceSummary(INVESTMENT_DOMAIN_IDS),
    hero: {
      title: "Investor Intelligence Workspace",
      subtitle: "Evidence readiness for due diligence scoping",
      description:
        "Explore evidence readiness for countries, sectors, companies, universities, procurement, infrastructure, trade, and investment climate. No “invest here” recommendations — only source and indicator status.",
    },
    investmentEvidenceMap,
    entityLinks: buildEntityLinks(),
    sources: buildSourceCoverage([...INVESTOR_SOURCE_SLUGS]),
    opportunityReadiness: investmentEvidenceMap,
    methodology: buildMethodology(),
    personas: buildPersonas(),
    trustPillars: buildTrustPillars(),
  };
}
