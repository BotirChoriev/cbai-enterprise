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

export const CITIZEN_WORKSPACE_VERSION = "1.0.0" as const;

const CITIZEN_DOMAIN_IDS: readonly IndicatorDomainId[] = [
  "public-services",
  "budget-transparency",
  "public-procurement",
  "education",
  "health",
  "environment",
  "infrastructure",
  "digital-development",
  "governance",
  "judicial-system",
];

export type CitizenFeedbackNotice = {
  title: string;
  description: string;
  allowedResponses: readonly string[];
  notImplementedNote: string;
};

export type CitizenWorkspaceModel = WorkspaceBaseModel & {
  workspaceVersion: typeof CITIZEN_WORKSPACE_VERSION;
  hero: {
    title: string;
    subtitle: string;
    description: string;
  };
  topics: readonly WorkspaceCoverageItem[];
  feedbackNotice: CitizenFeedbackNotice;
  evidenceCoverage: readonly WorkspaceCoverageItem[];
  sources: readonly WorkspaceSourceItem[];
  methodology: readonly WorkspaceMethodologyPoint[];
  personas: readonly WorkspacePersona[];
  trustPillars: readonly WorkspaceTrustPillar[];
};

function buildTopics(): WorkspaceCoverageItem[] {
  return [
    buildTopicCoverage(
      "public-services",
      "Public Services",
      "How public services are documented when official data connects.",
      ["public-services"],
    ),
    buildTopicCoverage(
      "budget",
      "Budget",
      "Whether budget documents and execution reports have connected sources.",
      ["budget-transparency"],
    ),
    buildTopicCoverage(
      "procurement",
      "Procurement",
      "Tender and award disclosure readiness from procurement portals.",
      ["public-procurement"],
    ),
    buildTopicCoverage(
      "education",
      "Education",
      "School and university evidence from official education statistics.",
      ["education"],
    ),
    buildTopicCoverage(
      "healthcare",
      "Healthcare",
      "Health system evidence from national and WHO sources.",
      ["health"],
    ),
    buildTopicCoverage(
      "environment",
      "Environment",
      "Air, water, and land monitoring from environmental agencies.",
      ["environment"],
    ),
    buildTopicCoverage(
      "infrastructure",
      "Infrastructure",
      "Roads, utilities, and public asset registries.",
      ["infrastructure"],
    ),
    buildTopicCoverage(
      "digital-government",
      "Digital Government",
      "Online public services and digital access indicators.",
      ["digital-development"],
    ),
    buildTopicCoverage(
      "laws-public-information",
      "Laws / Public Information",
      "Governance and judicial system evidence from official records.",
      ["governance", "judicial-system"],
    ),
  ];
}

function buildFeedbackNotice(): CitizenFeedbackNotice {
  return {
    title: "Citizen Feedback (Future)",
    description:
      "Citizens may eventually share whether they are satisfied with public services. This will be separate from official evidence and will not affect CBAI ratings or scores.",
    allowedResponses: ["Satisfied", "Unsatisfied", "No Opinion"],
    notImplementedNote:
      "Feedback collection is not implemented in this release. No voting, sentiment scoring, or unrest indices appear on this workspace.",
  };
}

function buildMethodology(): WorkspaceMethodologyPoint[] {
  return [
    {
      id: "cbai-does-not-judge",
      title: "CBAI does not judge",
      description:
        "Citizens see evidence connection status — not platform opinions about government performance.",
    },
    {
      id: "evidence-and-source-status",
      title: "CBAI shows evidence and source status",
      description:
        "When official sources connect, citizens can trace public information to registered datasets.",
    },
  ];
}

function buildPersonas(): WorkspacePersona[] {
  return [
    {
      id: "citizen",
      title: "Citizen",
      answer:
        "Which public topics have connected official evidence and which show Evidence Source Not Connected.",
    },
    {
      id: "student",
      title: "Student",
      answer:
        "How education and public service information is sourced — without simplified rankings.",
    },
    {
      id: "researcher",
      title: "Researcher",
      answer:
        "Topic-to-domain mapping and source slugs for civic transparency research.",
    },
    {
      id: "government",
      title: "Government",
      answer:
        "Which citizen-facing topics need official data publication to move from planned to connected.",
    },
    {
      id: "investor",
      title: "Investor",
      answer:
        "Public procurement and budget transparency readiness relevant to civic accountability.",
    },
    {
      id: "academic",
      title: "Academic",
      answer:
        "Methodology boundaries between citizen feedback (future) and official evidence (now).",
    },
  ];
}

function buildTrustPillars(): WorkspaceTrustPillar[] {
  return [
    {
      id: "respect-law",
      title: "Respect law",
      description:
        "CBAI presents official public information pathways — not legal advice or advocacy.",
    },
    {
      id: "political-neutrality",
      title: "Political neutrality",
      description:
        "No partisan framing, protest scoring, or dissatisfaction indices on citizen topics.",
    },
    {
      id: "no-social-sentiment",
      title: "No social sentiment scoring",
      description:
        "Social media mood, viral metrics, and unrest scoring are excluded from this workspace.",
    },
    {
      id: "no-fake-data",
      title: "No fake data",
      description:
        "No fabricated satisfaction rates, polls, or service quality scores.",
    },
  ];
}

/** Build the Citizen Intelligence Workspace model. */
export function buildCitizenWorkspace(): CitizenWorkspaceModel {
  const topics = buildTopics();

  return {
    version: WORKSPACES_VERSION,
    workspaceVersion: CITIZEN_WORKSPACE_VERSION,
    frameworkVersion: FRAMEWORK_VERSION,
    infrastructureVersion: INFRASTRUCTURE_VERSION,
    governanceVersion: GOVERNANCE_VERSION,
    summary: buildWorkspaceSummary(CITIZEN_DOMAIN_IDS),
    hero: {
      title: "Citizen Intelligence Workspace",
      subtitle: "Public information in clear language",
      description:
        "Explore reforms, public services, budget, tenders, education, healthcare, environment, and official evidence status. CBAI shows what is connected — it does not judge governments or citizens.",
    },
    topics,
    feedbackNotice: buildFeedbackNotice(),
    evidenceCoverage: buildDomainCoverage(CITIZEN_DOMAIN_IDS),
    sources: buildSourceCoverage(),
    methodology: buildMethodology(),
    personas: buildPersonas(),
    trustPillars: buildTrustPillars(),
  };
}
