import { OFFICIAL_EVIDENCE_SOURCES } from "@/lib/evidence-infrastructure/sources/catalog";
import { getIndicatorsForEntity, getDomain } from "@/lib/indicator-framework";
import type { IndicatorDefinition, IndicatorDomainId } from "@/lib/indicator-framework/types";
import { buildKnowledgeGraph } from "@/lib/graph/graph.builder";
import { graphNodeId } from "@/lib/graph/graph.types";
import type { University } from "@/lib/universities";
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

export type UniversityEvidenceCoverageSummary = {
  connected: number;
  planned: number;
  notConnected: number;
  verificationPending: number;
  total: number;
};

export type UniversityIndicatorCoverageItem = {
  id: string;
  slug: string;
  title: string;
  domainId: IndicatorDomainId;
  domainTitle: string;
  statusLabel: CoverageStatusLabel;
  requiredSources: readonly string[];
  evidenceValue?: string;
};

export type UniversitySourceCoverageItem = {
  id: string;
  slug: string;
  name: string;
  organization: string;
  statusLabel: CoverageStatusLabel;
  supportedIndicatorCount: number;
  officialWebsite: string | null;
};

export type UniversityGraphRelationship = {
  entityName: string;
  entityType: "country" | "company" | "university";
  relationshipLabel: string;
  evidenceLabel: string;
};

export type UniversityCoverageProfile = {
  evidenceCoverage: UniversityEvidenceCoverageSummary;
  indicatorsByDomain: readonly {
    domainId: IndicatorDomainId;
    domainTitle: string;
    indicators: readonly UniversityIndicatorCoverageItem[];
  }[];
  sources: readonly UniversitySourceCoverageItem[];
  graphRelationships: readonly UniversityGraphRelationship[];
  graphRelationshipCount: number;
};

export const UNIVERSITY_DOMAIN_DISPLAY_ORDER: readonly IndicatorDomainId[] = [
  "education",
  "research",
  "innovation",
  "governance",
  "public-services",
  "digital-development",
  "employment",
] as const;

const UNIVERSITY_SOURCE_CATALOG: readonly {
  id: string;
  slug: string;
  name: string;
  organization: string;
  infrastructureSlug?: string;
  statusLabel: CoverageStatusLabel;
  officialWebsite: string | null;
}[] = [
  {
    id: "uni-src-registry",
    slug: "university-registry",
    name: "University Registry",
    organization: "CBAI Local Platform Registry",
    infrastructureSlug: "cbai-local-registry",
    statusLabel: "Connected",
    officialWebsite: "https://cbai.enterprise",
  },
  {
    id: "uni-src-accreditation",
    slug: "accreditation-agency",
    name: "Accreditation Agency",
    organization: "National and international quality assurance bodies",
    statusLabel: "Planned",
    officialWebsite: null,
  },
  {
    id: "uni-src-ministry",
    slug: "ministry-of-education",
    name: "Ministry of Education",
    organization: "National education ministries and regulatory authorities",
    infrastructureSlug: "national-statistics-offices",
    statusLabel: "Planned",
    officialWebsite: "https://unstats.un.org/home/nso-sites/",
  },
  {
    id: "uni-src-unesco",
    slug: "unesco",
    name: "UNESCO",
    organization: "UNESCO Institute for Statistics",
    infrastructureSlug: "unesco",
    statusLabel: "Planned",
    officialWebsite: "https://www.unesco.org",
  },
  {
    id: "uni-src-research",
    slug: "research-databases",
    name: "Research Databases",
    organization: "Bibliometric indexes and national R&D survey systems",
    statusLabel: "Planned",
    officialWebsite: null,
  },
  {
    id: "uni-src-scholarship",
    slug: "scholarship-portals",
    name: "Scholarship Portals",
    organization: "Official scholarship and financial aid disclosure systems",
    statusLabel: "Planned",
    officialWebsite: null,
  },
  {
    id: "uni-src-open-data",
    slug: "open-data",
    name: "Open Data",
    organization: "National open data portals and OECD education statistics",
    infrastructureSlug: "oecd",
    statusLabel: "Planned",
    officialWebsite: "https://www.oecd.org",
  },
];

function connectedIndicatorEvidence(
  indicator: IndicatorDefinition,
  university: University,
): string | undefined {
  if (indicator.status !== "connected") {
    return undefined;
  }

  if (indicator.slug === "education-enrollment-statistics") {
    return `${university.type} institution — local catalog`;
  }

  if (indicator.slug === "research-output-disclosure") {
    return university.name;
  }

  return "Available from local catalog";
}

function buildIndicatorCoverageItems(
  university: University,
): UniversityIndicatorCoverageItem[] {
  return getIndicatorsForEntity("university").map((indicator) => {
    const domain = getDomain(indicator.category);
    return {
      id: indicator.id,
      slug: indicator.slug,
      title: indicator.title,
      domainId: indicator.category,
      domainTitle: domain?.title ?? indicator.category,
      statusLabel: mapIndicatorStatusToLabel(indicator),
      requiredSources: indicator.requiredEvidenceSources,
      evidenceValue: connectedIndicatorEvidence(indicator, university),
    };
  });
}

function groupIndicatorsByDomain(
  items: UniversityIndicatorCoverageItem[],
): UniversityCoverageProfile["indicatorsByDomain"] {
  const byDomain = new Map<IndicatorDomainId, UniversityIndicatorCoverageItem[]>();

  for (const item of items) {
    const list = byDomain.get(item.domainId) ?? [];
    list.push(item);
    byDomain.set(item.domainId, list);
  }

  return UNIVERSITY_DOMAIN_DISPLAY_ORDER.filter((domainId) => byDomain.has(domainId)).map(
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

function buildUniversitySourceCoverageItems(): UniversitySourceCoverageItem[] {
  return UNIVERSITY_SOURCE_CATALOG.map((entry) => {
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
  indicators: UniversityIndicatorCoverageItem[],
): UniversityEvidenceCoverageSummary {
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

function buildGraphRelationships(
  university: University,
): UniversityGraphRelationship[] {
  const graph = buildKnowledgeGraph();
  const nodeId = graphNodeId("university", university.id);
  const relationships: UniversityGraphRelationship[] = [];

  for (const edge of graph.edges) {
    if (edge.source !== nodeId && edge.target !== nodeId) continue;

    const otherNodeId = edge.source === nodeId ? edge.target : edge.source;
    const otherNode = graph.nodes.find((n) => n.id === otherNodeId);
    if (!otherNode || otherNode.type === "university") continue;

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

export function buildUniversityCoverageProfile(
  university: University,
): UniversityCoverageProfile {
  const indicatorItems = buildIndicatorCoverageItems(university);
  const graphRelationships = buildGraphRelationships(university);

  return {
    evidenceCoverage: summarizeEvidenceCoverage(indicatorItems),
    indicatorsByDomain: groupIndicatorsByDomain(indicatorItems),
    sources: buildUniversitySourceCoverageItems(),
    graphRelationships,
    graphRelationshipCount: graphRelationships.length,
  };
}

export function universityEvidenceStatusClass(
  status: "connected" | "insufficient" | "not_connected",
): string {
  switch (status) {
    case "connected":
      return "text-cyan-400 bg-cyan-500/10 border-cyan-500/20";
    case "insufficient":
      return "text-amber-400 bg-amber-500/10 border-amber-500/20";
    case "not_connected":
      return "text-zinc-400 bg-zinc-800/50 border-zinc-700/50";
  }
}
