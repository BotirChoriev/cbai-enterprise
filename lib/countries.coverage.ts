import { OFFICIAL_EVIDENCE_SOURCES } from "@/lib/evidence-infrastructure/sources/catalog";
import type { VerificationStatus } from "@/lib/evidence-infrastructure/types";
import {
  getIndicatorsForEntity,
  getDomain,
} from "@/lib/indicator-framework";
import type { IndicatorDefinition, IndicatorDomainId } from "@/lib/indicator-framework/types";
import { buildKnowledgeGraph } from "@/lib/graph/graph.builder";
import { graphNodeId } from "@/lib/graph/graph.types";
import type { Country } from "@/lib/countries";

/** User-facing coverage status labels. */
export type CoverageStatusLabel =
  | "Connected"
  | "Planned"
  | "Not connected"
  | "Verification pending";

export type CountryEvidenceCoverageSummary = {
  connected: number;
  planned: number;
  notConnected: number;
  verificationPending: number;
  total: number;
};

export type CountryIndicatorCoverageItem = {
  id: string;
  slug: string;
  title: string;
  domainId: IndicatorDomainId;
  domainTitle: string;
  statusLabel: CoverageStatusLabel;
  requiredSources: readonly string[];
};

export type CountrySourceCoverageItem = {
  id: string;
  slug: string;
  name: string;
  organization: string;
  statusLabel: CoverageStatusLabel;
  supportedIndicatorCount: number;
  officialWebsite: string;
};

export type CountryGraphRelationship = {
  entityName: string;
  entityType: "company" | "university";
  relationshipLabel: string;
  evidenceLabel: string;
};

export type CountryCoverageProfile = {
  evidenceCoverage: CountryEvidenceCoverageSummary;
  indicatorsByDomain: readonly {
    domainId: IndicatorDomainId;
    domainTitle: string;
    indicators: readonly CountryIndicatorCoverageItem[];
  }[];
  sources: readonly CountrySourceCoverageItem[];
  graphRelationships: readonly CountryGraphRelationship[];
  graphRelationshipCount: number;
};

/** Domain display order for country intelligence UI. */
export const COUNTRY_DOMAIN_DISPLAY_ORDER: readonly IndicatorDomainId[] = [
  "governance",
  "economy",
  "human-rights",
  "education",
  "health",
  "infrastructure",
  "environment",
  "energy",
  "public-procurement",
  "budget-transparency",
  "judicial-system",
  "public-services",
  "trade",
  "investment",
  "industry",
  "agriculture",
  "climate",
  "disaster-preparedness",
  "digital-development",
  "employment",
  "research",
  "innovation",
] as const;

const SOURCE_DISPLAY_NAMES: Record<string, string> = {
  "cbai-local-registry": "CBAI Local Registry",
  "united-nations": "United Nations",
  "world-bank": "World Bank",
  imf: "IMF",
  who: "WHO",
  unesco: "UNESCO",
  ilo: "ILO",
  itu: "ITU",
  oecd: "OECD",
  "open-contracting-partnership": "Open Contracting",
  "national-statistics-offices": "National Statistics",
  "official-procurement-portals": "Procurement Portal",
  "national-open-budget-portals": "Open Budget",
};

export function resolveSourceDisplayName(slug: string): string {
  return SOURCE_DISPLAY_NAMES[slug] ?? slug;
}

export function mapIndicatorStatusToLabel(
  indicator: IndicatorDefinition,
): CoverageStatusLabel {
  if (indicator.status === "connected") {
    return "Connected";
  }
  if (indicator.status === "planned") {
    return "Planned";
  }
  return "Not connected";
}

export function mapSourceToStatusLabel(
  connectionStatus: (typeof OFFICIAL_EVIDENCE_SOURCES)[number]["connectionStatus"],
  verificationStatus: VerificationStatus,
): CoverageStatusLabel {
  if (connectionStatus === "connected") {
    if (verificationStatus === "verification_pending") {
      return "Verification pending";
    }
    return "Connected";
  }
  if (connectionStatus === "planned") {
    return "Planned";
  }
  return "Not connected";
}

function buildIndicatorCoverageItems(): CountryIndicatorCoverageItem[] {
  return getIndicatorsForEntity("country").map((indicator) => {
    const domain = getDomain(indicator.category);
    return {
      id: indicator.id,
      slug: indicator.slug,
      title: indicator.title,
      domainId: indicator.category,
      domainTitle: domain?.title ?? indicator.category,
      statusLabel: mapIndicatorStatusToLabel(indicator),
      requiredSources: indicator.requiredEvidenceSources,
    };
  });
}

function groupIndicatorsByDomain(
  items: CountryIndicatorCoverageItem[],
): CountryCoverageProfile["indicatorsByDomain"] {
  const byDomain = new Map<IndicatorDomainId, CountryIndicatorCoverageItem[]>();

  for (const item of items) {
    const list = byDomain.get(item.domainId) ?? [];
    list.push(item);
    byDomain.set(item.domainId, list);
  }

  return COUNTRY_DOMAIN_DISPLAY_ORDER.filter((domainId) => byDomain.has(domainId)).map(
    (domainId) => ({
      domainId,
      domainTitle: getDomain(domainId)?.title ?? domainId,
      indicators: byDomain.get(domainId) ?? [],
    }),
  );
}

function buildSourceCoverageItems(): CountrySourceCoverageItem[] {
  return OFFICIAL_EVIDENCE_SOURCES.map((source) => ({
    id: source.id,
    slug: source.slug,
    name: resolveSourceDisplayName(source.slug),
    organization: source.organization,
    statusLabel: mapSourceToStatusLabel(
      source.connectionStatus,
      source.verificationStatus,
    ),
    supportedIndicatorCount: source.supportedIndicators.length,
    officialWebsite: source.officialWebsite,
  }));
}

function summarizeEvidenceCoverage(
  indicators: CountryIndicatorCoverageItem[],
): CountryEvidenceCoverageSummary {
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
  country: Country,
): CountryGraphRelationship[] {
  const graph = buildKnowledgeGraph();
  const nodeId = graphNodeId("country", country.id);
  const relationships: CountryGraphRelationship[] = [];

  for (const edge of graph.edges) {
    if (edge.source !== nodeId && edge.target !== nodeId) continue;

    const otherNodeId = edge.source === nodeId ? edge.target : edge.source;
    const otherNode = graph.nodes.find((n) => n.id === otherNodeId);
    if (!otherNode || otherNode.type === "country") continue;

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

/** Build full country coverage profile from platform foundations. */
export function buildCountryCoverageProfile(
  country: Country,
): CountryCoverageProfile {
  const indicatorItems = buildIndicatorCoverageItems();
  const graphRelationships = buildGraphRelationships(country);

  return {
    evidenceCoverage: summarizeEvidenceCoverage(indicatorItems),
    indicatorsByDomain: groupIndicatorsByDomain(indicatorItems),
    sources: buildSourceCoverageItems(),
    graphRelationships,
    graphRelationshipCount: graphRelationships.length,
  };
}

export function coverageStatusClass(status: CoverageStatusLabel): string {
  switch (status) {
    case "Connected":
      return "text-cyan-400 bg-cyan-500/10 border-cyan-500/20";
    case "Planned":
      return "text-violet-400 bg-violet-500/10 border-violet-500/20";
    case "Verification pending":
      return "text-amber-400 bg-amber-500/10 border-amber-500/20";
    case "Not connected":
      return "text-zinc-400 bg-zinc-800/50 border-zinc-700/50";
  }
}
