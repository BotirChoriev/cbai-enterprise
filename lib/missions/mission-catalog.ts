import type { MissionCatalogEntry } from "@/lib/missions/mission-types";
import { REPORT_TYPE_IDS, WORKSPACE_IDS } from "@/lib/registry";

/**
 * Declarative mission catalog — definitions only.
 * Requirements resolve to indicators, evidence, and sources at build time.
 */
export const MISSION_CATALOG_ENTRIES: readonly MissionCatalogEntry[] = [
  // Citizen
  {
    slug: "explore-public-services",
    missionName: "Explore Public Services",
    persona: "citizen",
    description:
      "Scope public service indicator coverage and source connection status — no satisfaction scores or political advice.",
    supportedEntities: ["country"],
    requiredIndicatorIds: ["ind-public-service-coverage"],
    requiredWorkspaceIds: [WORKSPACE_IDS.citizen],
    requiredReportIds: [REPORT_TYPE_IDS.governmentBrief],
  },
  {
    slug: "explore-healthcare",
    missionName: "Explore Healthcare",
    persona: "citizen",
    description:
      "Review health system evidence requirements and connection status from official sources.",
    supportedEntities: ["country"],
    requiredIndicatorIds: ["ind-health-system-coverage"],
    requiredWorkspaceIds: [WORKSPACE_IDS.citizen],
    requiredReportIds: [REPORT_TYPE_IDS.countryIntelligence],
  },
  {
    slug: "explore-education",
    missionName: "Explore Education",
    persona: "citizen",
    description:
      "Review education enrollment evidence requirements — not rankings or league tables.",
    supportedEntities: ["country", "university"],
    requiredIndicatorIds: ["ind-edu-enrollment-statistics"],
    requiredWorkspaceIds: [WORKSPACE_IDS.citizen],
    requiredReportIds: [REPORT_TYPE_IDS.universityIntelligence],
  },
  {
    slug: "explore-budget",
    missionName: "Explore Budget",
    persona: "citizen",
    description:
      "Scope budget transparency indicator and open budget source readiness.",
    supportedEntities: ["country"],
    requiredIndicatorIds: ["ind-budget-document-publication"],
    requiredWorkspaceIds: [WORKSPACE_IDS.citizen],
    requiredReportIds: [REPORT_TYPE_IDS.governmentBrief],
  },
  // Investor
  {
    slug: "evaluate-country",
    missionName: "Evaluate Country",
    persona: "investor",
    description:
      "Scope country-level macro and investment indicator readiness — no investment recommendations.",
    supportedEntities: ["country"],
    requiredIndicatorIds: [
      "ind-econ-national-accounts",
      "ind-investment-fdi-registration",
    ],
    requiredWorkspaceIds: [WORKSPACE_IDS.investor],
    requiredReportIds: [REPORT_TYPE_IDS.countryIntelligence, REPORT_TYPE_IDS.investorBrief],
  },
  {
    slug: "compare-markets",
    missionName: "Compare Markets",
    persona: "investor",
    description:
      "Define trade and economy evidence requirements for cross-country scoping — no market scores.",
    supportedEntities: ["country"],
    requiredIndicatorIds: ["ind-econ-national-accounts", "ind-trade-flow-disclosure"],
    requiredWorkspaceIds: [WORKSPACE_IDS.investor],
    requiredReportIds: [REPORT_TYPE_IDS.investorBrief],
  },
  {
    slug: "explore-companies",
    missionName: "Explore Companies",
    persona: "investor",
    description:
      "Scope company registry and industry classification evidence readiness.",
    supportedEntities: ["company", "country"],
    requiredIndicatorIds: ["ind-industry-classification"],
    requiredWorkspaceIds: [WORKSPACE_IDS.investor],
    requiredReportIds: [REPORT_TYPE_IDS.companyIntelligence],
  },
  {
    slug: "review-procurement",
    missionName: "Review Procurement",
    persona: "investor",
    description:
      "Review procurement disclosure indicator and official portal source status.",
    supportedEntities: ["country", "company"],
    requiredIndicatorIds: ["ind-procurement-disclosure-coverage"],
    requiredWorkspaceIds: [WORKSPACE_IDS.investor, WORKSPACE_IDS.government],
    requiredReportIds: [REPORT_TYPE_IDS.investorBrief],
  },
  // Government
  {
    slug: "infrastructure-planning",
    missionName: "Infrastructure Planning",
    persona: "government",
    description:
      "Scope infrastructure asset registry indicator requirements for publication planning.",
    supportedEntities: ["country"],
    requiredIndicatorIds: ["ind-infrastructure-asset-registry"],
    requiredWorkspaceIds: [WORKSPACE_IDS.government],
    requiredReportIds: [REPORT_TYPE_IDS.governmentBrief],
  },
  {
    slug: "budget-transparency",
    missionName: "Budget Transparency",
    persona: "government",
    description:
      "Define fiscal transparency indicator and open budget source requirements.",
    supportedEntities: ["country"],
    requiredIndicatorIds: ["ind-budget-document-publication"],
    requiredWorkspaceIds: [WORKSPACE_IDS.government],
    requiredReportIds: [REPORT_TYPE_IDS.governmentBrief],
  },
  {
    slug: "public-procurement",
    missionName: "Public Procurement",
    persona: "government",
    description:
      "Define procurement disclosure indicator requirements for contracting authorities.",
    supportedEntities: ["country"],
    requiredIndicatorIds: ["ind-procurement-disclosure-coverage"],
    requiredWorkspaceIds: [WORKSPACE_IDS.government],
    requiredReportIds: [REPORT_TYPE_IDS.governmentBrief],
  },
  {
    slug: "digital-government",
    missionName: "Digital Government",
    persona: "government",
    description:
      "Scope digital connectivity and e-government indicator evidence requirements.",
    supportedEntities: ["country"],
    requiredIndicatorIds: ["ind-digital-connectivity"],
    requiredWorkspaceIds: [WORKSPACE_IDS.government],
    requiredReportIds: [REPORT_TYPE_IDS.governmentBrief],
  },
  // Researcher
  {
    slug: "research-country",
    missionName: "Research Country",
    persona: "researcher",
    description:
      "Export country indicator definitions, source slugs, and connection status for reproducible scoping.",
    supportedEntities: ["country"],
    requiredIndicatorIds: ["ind-gov-institutional-framework"],
    requiredWorkspaceIds: [WORKSPACE_IDS.citizen, WORKSPACE_IDS.government],
    requiredReportIds: [REPORT_TYPE_IDS.researchBrief, REPORT_TYPE_IDS.countryIntelligence],
  },
  {
    slug: "research-industry",
    missionName: "Research Industry",
    persona: "researcher",
    description:
      "Scope industry classification and trade indicators for sector research.",
    supportedEntities: ["country", "company"],
    requiredIndicatorIds: ["ind-industry-classification", "ind-trade-flow-disclosure"],
    requiredWorkspaceIds: [WORKSPACE_IDS.investor],
    requiredReportIds: [REPORT_TYPE_IDS.researchBrief],
  },
  {
    slug: "research-university",
    missionName: "Research University",
    persona: "researcher",
    description:
      "Scope university research output and education indicators for academic scoping.",
    supportedEntities: ["university", "country"],
    requiredIndicatorIds: [
      "ind-research-output-disclosure",
      "ind-edu-enrollment-statistics",
    ],
    requiredWorkspaceIds: [WORKSPACE_IDS.citizen],
    requiredReportIds: [
      REPORT_TYPE_IDS.universityIntelligence,
      REPORT_TYPE_IDS.researchBrief,
    ],
  },
  // Academic
  {
    slug: "methodology-review",
    missionName: "Methodology Review",
    persona: "academic",
    description:
      "Review indicator methodology blocks and evidence requirements for scholarly citation.",
    supportedEntities: ["country", "company", "university"],
    requiredIndicatorIds: ["ind-gov-institutional-framework"],
    requiredWorkspaceIds: [WORKSPACE_IDS.government],
    requiredReportIds: [REPORT_TYPE_IDS.academicMethodology],
  },
  {
    slug: "indicator-review",
    missionName: "Indicator Review",
    persona: "academic",
    description:
      "Catalog indicator IDs, domains, and lifecycle status across entity types.",
    supportedEntities: ["country", "company", "university"],
    requiredIndicatorIds: ["ind-industry-classification", "ind-edu-enrollment-statistics"],
    requiredWorkspaceIds: [WORKSPACE_IDS.investor, WORKSPACE_IDS.citizen],
    requiredReportIds: [REPORT_TYPE_IDS.academicMethodology, REPORT_TYPE_IDS.researchBrief],
  },
  {
    slug: "evidence-review",
    missionName: "Evidence Review",
    persona: "academic",
    description:
      "Trace evidence source registration and verification status for audit reproducibility.",
    supportedEntities: ["country", "company", "university"],
    requiredIndicatorIds: ["ind-budget-document-publication", "ind-procurement-disclosure-coverage"],
    requiredWorkspaceIds: [WORKSPACE_IDS.government],
    requiredReportIds: [REPORT_TYPE_IDS.academicMethodology],
  },
  // Enterprise
  {
    slug: "country-risk-review",
    missionName: "Country Risk Review",
    persona: "enterprise",
    description:
      "Scope governance and macro indicator readiness for enterprise risk scoping — no risk scores.",
    supportedEntities: ["country"],
    requiredIndicatorIds: [
      "ind-gov-institutional-framework",
      "ind-econ-national-accounts",
    ],
    requiredWorkspaceIds: [WORKSPACE_IDS.investor, WORKSPACE_IDS.government],
    requiredReportIds: [REPORT_TYPE_IDS.countryIntelligence],
  },
  {
    slug: "supply-chain-review",
    missionName: "Supply Chain Review",
    persona: "enterprise",
    description:
      "Scope trade, procurement, and company registry evidence for supply chain due diligence scoping.",
    supportedEntities: ["country", "company"],
    requiredIndicatorIds: ["ind-trade-flow-disclosure", "ind-procurement-disclosure-coverage"],
    requiredWorkspaceIds: [WORKSPACE_IDS.investor],
    requiredReportIds: [REPORT_TYPE_IDS.companyIntelligence, REPORT_TYPE_IDS.investorBrief],
  },
  {
    slug: "partner-discovery",
    missionName: "Partner Discovery",
    persona: "enterprise",
    description:
      "Scope university and company registry relationships for partnership scoping — no recommendations.",
    supportedEntities: ["company", "university", "country"],
    requiredIndicatorIds: ["ind-research-output-disclosure", "ind-industry-classification"],
    requiredWorkspaceIds: [WORKSPACE_IDS.investor, WORKSPACE_IDS.citizen],
    requiredReportIds: [REPORT_TYPE_IDS.companyIntelligence, REPORT_TYPE_IDS.universityIntelligence],
  },
] as const;
