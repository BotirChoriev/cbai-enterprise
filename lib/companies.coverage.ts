import { OFFICIAL_EVIDENCE_SOURCES } from "@/lib/evidence-infrastructure/sources/catalog";
import { getIndicatorsForEntity, getDomain } from "@/lib/indicator-framework";
import type { IndicatorDefinition, IndicatorDomainId } from "@/lib/indicator-framework/types";
import { buildKnowledgeGraph } from "@/lib/graph/graph.builder";
import { graphNodeId } from "@/lib/graph/graph.types";
import type { Company } from "@/lib/companies";
import {
  type CoverageStatusLabel,
  coverageStatusClass,
  mapIndicatorStatusToLabel,
  mapSourceToStatusLabel,
  resolveSourceDisplayName,
} from "@/lib/countries.coverage";

export {
  coverageStatusClass,
  resolveSourceDisplayName,
  type CoverageStatusLabel,
};

export type CompanyEvidenceCoverageSummary = {
  connected: number;
  planned: number;
  notConnected: number;
  verificationPending: number;
  total: number;
};

export type CompanyIndicatorCoverageItem = {
  id: string;
  slug: string;
  title: string;
  domainId: IndicatorDomainId;
  domainTitle: string;
  statusLabel: CoverageStatusLabel;
  requiredSources: readonly string[];
  evidenceValue?: string;
};

export type CompanySourceCoverageItem = {
  id: string;
  slug: string;
  name: string;
  organization: string;
  statusLabel: CoverageStatusLabel;
  supportedIndicatorCount: number;
  officialWebsite: string | null;
};

export type CompanyGraphRelationship = {
  entityName: string;
  entityType: "country" | "university" | "company";
  relationshipLabel: string;
  evidenceLabel: string;
};

export type CompanyCoverageProfile = {
  evidenceCoverage: CompanyEvidenceCoverageSummary;
  indicatorsByDomain: readonly {
    domainId: IndicatorDomainId;
    domainTitle: string;
    indicators: readonly CompanyIndicatorCoverageItem[];
  }[];
  sources: readonly CompanySourceCoverageItem[];
  graphRelationships: readonly CompanyGraphRelationship[];
  graphRelationshipCount: number;
};

export const COMPANY_DOMAIN_DISPLAY_ORDER: readonly IndicatorDomainId[] = [
  "governance",
  "industry",
  "trade",
  "investment",
  "public-procurement",
  "research",
  "innovation",
  "employment",
  "environment",
  "energy",
  "digital-development",
  "agriculture",
] as const;

/** Company-oriented official source catalog — maps to evidence infrastructure where applicable. */
const COMPANY_SOURCE_CATALOG: readonly {
  id: string;
  slug: string;
  name: string;
  organization: string;
  infrastructureSlug?: string;
  statusLabel: CoverageStatusLabel;
  officialWebsite: string | null;
}[] = [
  {
    id: "co-src-registry",
    slug: "company-registry",
    name: "Company Registry",
    organization: "CBAI Local Platform Registry",
    infrastructureSlug: "cbai-local-registry",
    statusLabel: "Connected",
    officialWebsite: "https://cbai.enterprise",
  },
  {
    id: "co-src-stock-exchange",
    slug: "stock-exchange",
    name: "Stock Exchange",
    organization: "National and international securities exchanges",
    statusLabel: "Planned",
    officialWebsite: null,
  },
  {
    id: "co-src-annual-reports",
    slug: "annual-reports",
    name: "Annual Reports",
    organization: "Corporate filing and disclosure systems",
    statusLabel: "Planned",
    officialWebsite: null,
  },
  {
    id: "co-src-government-registry",
    slug: "government-registry",
    name: "Government Registry",
    organization: "National business and corporate registries",
    infrastructureSlug: "national-statistics-offices",
    statusLabel: "Planned",
    officialWebsite: "https://unstats.un.org/home/nso-sites/",
  },
  {
    id: "co-src-procurement",
    slug: "procurement-registry",
    name: "Procurement Registry",
    organization: "Official procurement and tender disclosure portals",
    infrastructureSlug: "official-procurement-portals",
    statusLabel: "Planned",
    officialWebsite: "https://www.open-contracting.org/",
  },
  {
    id: "co-src-open-data",
    slug: "open-data",
    name: "Open Data",
    organization: "World Bank, OECD, and national open data portals",
    infrastructureSlug: "world-bank",
    statusLabel: "Planned",
    officialWebsite: "https://data.worldbank.org/",
  },
];

function connectedIndicatorEvidence(
  indicator: IndicatorDefinition,
  company: Company,
): string | undefined {
  if (indicator.status !== "connected") {
    return undefined;
  }

  if (indicator.slug === "industry-classification") {
    return company.industry;
  }

  return "Available from local catalog";
}

function buildIndicatorCoverageItems(company: Company): CompanyIndicatorCoverageItem[] {
  return getIndicatorsForEntity("company").map((indicator) => {
    const domain = getDomain(indicator.category);
    return {
      id: indicator.id,
      slug: indicator.slug,
      title: indicator.title,
      domainId: indicator.category,
      domainTitle: domain?.title ?? indicator.category,
      statusLabel: mapIndicatorStatusToLabel(indicator),
      requiredSources: indicator.requiredEvidenceSources,
      evidenceValue: connectedIndicatorEvidence(indicator, company),
    };
  });
}

function groupIndicatorsByDomain(
  items: CompanyIndicatorCoverageItem[],
): CompanyCoverageProfile["indicatorsByDomain"] {
  const byDomain = new Map<IndicatorDomainId, CompanyIndicatorCoverageItem[]>();

  for (const item of items) {
    const list = byDomain.get(item.domainId) ?? [];
    list.push(item);
    byDomain.set(item.domainId, list);
  }

  return COMPANY_DOMAIN_DISPLAY_ORDER.filter((domainId) => byDomain.has(domainId)).map(
    (domainId) => ({
      domainId,
      domainTitle: getDomain(domainId)?.title ?? domainId,
      indicators: byDomain.get(domainId) ?? [],
    }),
  );
}

function countSupportedIndicators(slug: string | undefined): number {
  if (!slug) return 0;
  const source = OFFICIAL_EVIDENCE_SOURCES.find((s) => s.slug === slug);
  return source?.supportedIndicators.length ?? 0;
}

function buildCompanySourceCoverageItems(): CompanySourceCoverageItem[] {
  return COMPANY_SOURCE_CATALOG.map((entry) => {
    if (entry.infrastructureSlug) {
      const infra = OFFICIAL_EVIDENCE_SOURCES.find(
        (s) => s.slug === entry.infrastructureSlug,
      );
      if (infra) {
        return {
          id: entry.id,
          slug: entry.slug,
          name: entry.name,
          organization: entry.organization,
          statusLabel:
            infra.slug === "cbai-local-registry"
              ? mapSourceToStatusLabel(
                  infra.connectionStatus,
                  infra.verificationStatus,
                )
              : entry.statusLabel,
          supportedIndicatorCount: countSupportedIndicators(entry.infrastructureSlug),
          officialWebsite: entry.officialWebsite ?? infra.officialWebsite,
        };
      }
    }

    return {
      id: entry.id,
      slug: entry.slug,
      name: entry.name,
      organization: entry.organization,
      statusLabel: entry.statusLabel,
      supportedIndicatorCount: 0,
      officialWebsite: entry.officialWebsite,
    };
  });
}

function summarizeEvidenceCoverage(
  indicators: CompanyIndicatorCoverageItem[],
): CompanyEvidenceCoverageSummary {
  const summary = {
    connected: 0,
    planned: 0,
    notConnected: 0,
    verificationPending: 0,
    total: indicators.length,
  };

  for (const indicator of indicators) {
    switch (indicator.statusLabel) {
      case "Connected":
        summary.connected += 1;
        break;
      case "Planned":
        summary.planned += 1;
        break;
      case "Not connected":
        summary.notConnected += 1;
        break;
      case "Verification pending":
        summary.verificationPending += 1;
        break;
    }
  }

  return summary;
}

function buildGraphRelationships(company: Company): CompanyGraphRelationship[] {
  const graph = buildKnowledgeGraph();
  const nodeId = graphNodeId("company", company.id);
  const relationships: CompanyGraphRelationship[] = [];

  for (const edge of graph.edges) {
    if (edge.source !== nodeId && edge.target !== nodeId) continue;

    const otherNodeId = edge.source === nodeId ? edge.target : edge.source;
    const otherNode = graph.nodes.find((n) => n.id === otherNodeId);
    if (!otherNode || otherNode.type === "company") continue;

    relationships.push({
      entityName: otherNode.label,
      entityType: otherNode.type,
      relationshipLabel: edge.label,
      evidenceLabel:
        edge.evidenceStatus === "evidence_available"
          ? "Verified local catalog"
          : "Evidence missing",
    });
  }

  return relationships;
}

export function buildCompanyCoverageProfile(company: Company): CompanyCoverageProfile {
  const indicatorItems = buildIndicatorCoverageItems(company);
  const graphRelationships = buildGraphRelationships(company);

  return {
    evidenceCoverage: summarizeEvidenceCoverage(indicatorItems),
    indicatorsByDomain: groupIndicatorsByDomain(indicatorItems),
    sources: buildCompanySourceCoverageItems(),
    graphRelationships,
    graphRelationshipCount: graphRelationships.length,
  };
}

export function companyEvidenceStatusClass(
  status: "connected" | "insufficient" | "not_connected",
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
