import type { IndicatorDomainId } from "@/lib/indicator-framework/types";
import { FRAMEWORK_VERSION } from "@/lib/indicator-framework";
import { INFRASTRUCTURE_VERSION } from "@/lib/evidence-infrastructure/types";
import { GOVERNANCE_VERSION } from "@/lib/governance/types";
import {
  WORKSPACES_VERSION,
  buildDomainCoverage,
  buildSourceCoverage,
  buildTopicCoverage,
  buildWorkspaceSummary,
  type WorkspaceBaseModel,
  type WorkspaceCoverageItem,
  type WorkspaceMethodologyPoint,
  type WorkspacePersona,
  type WorkspaceSourceItem,
  type WorkspaceTrustPillar,
} from "@/lib/workspaces";

export const GOVERNMENT_WORKSPACE_VERSION = "1.0.0" as const;

const GOVERNANCE_DOMAIN_IDS: readonly IndicatorDomainId[] = [
  "governance",
  "budget-transparency",
  "public-procurement",
  "judicial-system",
  "public-services",
  "digital-development",
  "infrastructure",
  "health",
  "education",
  "energy",
  "environment",
];

export type GovernmentWorkspaceModel = WorkspaceBaseModel & {
  workspaceVersion: typeof GOVERNMENT_WORKSPACE_VERSION;
  hero: {
    title: string;
    subtitle: string;
    description: string;
  };
  governanceCoverage: readonly WorkspaceCoverageItem[];
  sources: readonly WorkspaceSourceItem[];
  publicServiceAreas: readonly WorkspaceCoverageItem[];
  methodology: readonly WorkspaceMethodologyPoint[];
  personas: readonly WorkspacePersona[];
  trustPillars: readonly WorkspaceTrustPillar[];
};

function buildMethodology(): WorkspaceMethodologyPoint[] {
  return [
    {
      id: "evidence-before-judgment",
      title: "Evidence before judgment",
      description:
        "Governance intelligence displays source connection status and indicator definitions — not evaluative conclusions.",
    },
    {
      id: "no-social-sentiment",
      title: "No social sentiment scoring",
      description:
        "Public satisfaction, unrest, or viral sentiment metrics are excluded from this workspace.",
    },
    {
      id: "no-political-recommendation",
      title: "No political recommendation",
      description:
        "CBAI does not advise governments on policy choices, elections, or partisan positioning.",
    },
    {
      id: "official-source-priority",
      title: "Official source priority",
      description:
        "Budget, procurement, and service indicators require official publications — not scraped or social data.",
    },
  ];
}

function buildPersonas(): WorkspacePersona[] {
  return [
    {
      id: "government",
      title: "Government",
      answer:
        "Which governance domains have registered indicators and which official sources remain not connected.",
    },
    {
      id: "citizen",
      title: "Citizen",
      answer:
        "Where public service, budget, and procurement evidence is planned versus connected — without political advice.",
    },
    {
      id: "investor",
      title: "Investor",
      answer:
        "Fiscal and procurement evidence readiness that may support future due diligence — not investment recommendations.",
    },
    {
      id: "researcher",
      title: "Researcher",
      answer:
        "Domain-level indicator IDs and source slugs for reproducible governance research scoping.",
    },
    {
      id: "academic",
      title: "Academic",
      answer:
        "Methodology requirements per governance domain before any evaluative metrics can be cited.",
    },
    {
      id: "student",
      title: "Student",
      answer:
        "How public institutions document evidence gaps — not rankings or league tables.",
    },
  ];
}

function buildTrustPillars(): WorkspaceTrustPillar[] {
  return [
    {
      id: "political-neutrality",
      title: "Political neutrality",
      description:
        "No partisan framing, national favoritism, or ideological scoring on governance topics.",
    },
    {
      id: "evidence-first",
      title: "Evidence first",
      description:
        "Every row traces to the Indicator Framework or Evidence Infrastructure — no fabricated statistics.",
    },
    {
      id: "methodology-before-metrics",
      title: "Methodology before metrics",
      description:
        "Indicator methodology is defined before any governance metric would appear.",
    },
    {
      id: "no-fake-data",
      title: "No fake data",
      description:
        "No dashboard KPIs, charts, or confidence scores — evidence readiness only.",
    },
  ];
}

function buildPublicServiceAreas(): WorkspaceCoverageItem[] {
  return [
    buildTopicCoverage(
      "water",
      "Water",
      "Water quality and utility service evidence from environment and infrastructure domains.",
      ["environment", "infrastructure"],
    ),
    buildTopicCoverage(
      "energy",
      "Energy",
      "Energy access and mix disclosure from official energy balances.",
      ["energy"],
    ),
    buildTopicCoverage(
      "healthcare",
      "Healthcare",
      "Health system coverage from WHO and national health statistics.",
      ["health"],
    ),
    buildTopicCoverage(
      "education",
      "Education",
      "Education enrollment and accreditation evidence.",
      ["education"],
    ),
    buildTopicCoverage(
      "transport",
      "Transport",
      "Transport infrastructure asset registries and service coverage.",
      ["infrastructure"],
    ),
    buildTopicCoverage(
      "environment",
      "Environment",
      "Environmental monitoring from official agencies.",
      ["environment"],
    ),
    buildTopicCoverage(
      "digital-services",
      "Digital services",
      "E-government and digital connectivity indicators.",
      ["digital-development"],
    ),
  ];
}

/** Build the Government Intelligence Workspace model. */
export function buildGovernmentWorkspace(): GovernmentWorkspaceModel {
  const base = buildWorkspaceSummary(GOVERNANCE_DOMAIN_IDS);

  return {
    version: WORKSPACES_VERSION,
    workspaceVersion: GOVERNMENT_WORKSPACE_VERSION,
    frameworkVersion: FRAMEWORK_VERSION,
    infrastructureVersion: INFRASTRUCTURE_VERSION,
    governanceVersion: GOVERNANCE_VERSION,
    summary: base,
    hero: {
      title: "Government Intelligence Workspace",
      subtitle: "Evidence-based governance intelligence",
      description:
        "Help public institutions understand evidence coverage across governance, services, procurement, budget, infrastructure, judiciary, and digital government. This is not political advice — only source and indicator readiness.",
    },
    governanceCoverage: buildDomainCoverage(GOVERNANCE_DOMAIN_IDS),
    sources: buildSourceCoverage(),
    publicServiceAreas: buildPublicServiceAreas(),
    methodology: buildMethodology(),
    personas: buildPersonas(),
    trustPillars: buildTrustPillars(),
  };
}
