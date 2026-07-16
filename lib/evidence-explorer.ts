import { countries } from "@/lib/countries";
import { companies } from "@/lib/companies";
import { universities } from "@/lib/universities";
import { computeGraphStats, buildKnowledgeGraph } from "@/lib/graph/graph.builder";
import { OFFICIAL_EVIDENCE_SOURCES } from "@/lib/evidence-infrastructure/sources/catalog";
import { getInfrastructureSummary } from "@/lib/evidence-infrastructure/registry";
import type { ConnectionStatus, VerificationStatus } from "@/lib/evidence-infrastructure/types";
import {
  ALL_DOMAIN_INDICATORS,
  INDICATOR_DOMAIN_CATALOG,
  getIndicatorsForEntity,
  getDomain,
  FRAMEWORK_VERSION,
} from "@/lib/indicator-framework";
import type { ApplicableEntity, IndicatorDomainId } from "@/lib/indicator-framework/types";
import {
  mapIndicatorStatusToLabel,
  resolveSourceDisplayName,
  type CoverageStatusLabel,
} from "@/lib/countries.coverage";
import { INFRASTRUCTURE_VERSION } from "@/lib/evidence-infrastructure/types";

export const EVIDENCE_EXPLORER_VERSION = "1.0.0" as const;

export type ExplorerConnectionLabel =
  | "Connected"
  | "Evidence source planned"
  | "Evidence source not connected"
  | "Deprecated";

export type ExplorerVerificationLabel =
  | "Verified"
  | "Verification pending"
  | "Not started"
  | "Not applicable"
  | "Failed";

export type ExplorerSourceRow = {
  id: string;
  slug: string;
  name: string;
  organization: string;
  coverage: string;
  supportedIndicatorCount: number;
  supportedIndicatorSlugs: readonly string[];
  connectionLabel: ExplorerConnectionLabel;
  verificationLabel: ExplorerVerificationLabel;
  updateFrequency: string;
  license: string;
  officialWebsite: string;
};

export type ExplorerIndicatorRow = {
  id: string;
  slug: string;
  title: string;
  domainId: IndicatorDomainId;
  domainTitle: string;
  requiredSources: readonly string[];
  optionalSources: readonly string[];
  evidenceStatusLabel: CoverageStatusLabel;
  applicableEntities: readonly ApplicableEntity[];
};

export type ExplorerEntityModule = {
  entityType: "country" | "company" | "university";
  label: string;
  route: string;
  registryCount: number;
  registryAvailable: boolean;
  indicatorTotal: number;
  indicatorsConnected: number;
  indicatorsNotConnected: number;
  connectedSourceCount: number;
  totalSourceCount: number;
  missingEvidenceCategories: readonly string[];
};

export type ExplorerLifecycleStage = {
  id: string;
  title: string;
  description: string;
  sourceCount: number;
  indicatorCount: number;
};

export type ExplorerPersona = {
  id: string;
  title: string;
  verifyAnswer: string;
};

export type ExplorerTrustPillar = {
  id: string;
  title: string;
  description: string;
};

export type ExplorerMethodologyPoint = {
  id: string;
  title: string;
  description: string;
};

export type EvidenceExplorerModel = {
  version: typeof EVIDENCE_EXPLORER_VERSION;
  infrastructureVersion: typeof INFRASTRUCTURE_VERSION;
  frameworkVersion: typeof FRAMEWORK_VERSION;
  summary: {
    totalSources: number;
    connectedSources: number;
    plannedSources: number;
    totalIndicators: number;
    connectedIndicators: number;
    notConnectedIndicators: number;
    registryEntityCount: number;
    graphEdges: number;
    verifiedGraphEdges: number;
  };
  sources: readonly ExplorerSourceRow[];
  indicatorsByDomain: readonly {
    domainId: IndicatorDomainId;
    domainTitle: string;
    indicators: readonly ExplorerIndicatorRow[];
  }[];
  entityModules: readonly ExplorerEntityModule[];
  lifecycleStages: readonly ExplorerLifecycleStage[];
  methodology: readonly ExplorerMethodologyPoint[];
  personas: readonly ExplorerPersona[];
  trustPillars: readonly ExplorerTrustPillar[];
};

function mapConnectionLabel(status: ConnectionStatus): ExplorerConnectionLabel {
  switch (status) {
    case "connected":
      return "Connected";
    case "planned":
      return "Evidence source planned";
    case "deprecated":
      return "Deprecated";
  }
}

function mapVerificationLabel(status: VerificationStatus): ExplorerVerificationLabel {
  switch (status) {
    case "verified":
      return "Verified";
    case "verification_pending":
      return "Verification pending";
    case "not_started":
      return "Not started";
    case "not_applicable":
      return "Not applicable";
    case "failed":
      return "Failed";
  }
}

function mapIndicatorToExplorerRow(
  indicator: (typeof ALL_DOMAIN_INDICATORS)[number],
): ExplorerIndicatorRow {
  const domain = getDomain(indicator.category);
  return {
    id: indicator.id,
    slug: indicator.slug,
    title: indicator.title,
    domainId: indicator.category,
    domainTitle: domain?.title ?? indicator.category,
    requiredSources: indicator.requiredEvidenceSources,
    optionalSources: indicator.optionalEvidenceSources,
    evidenceStatusLabel: mapIndicatorStatusToLabel(indicator),
    applicableEntities: indicator.applicableEntities,
  };
}

function buildSourceRows(): ExplorerSourceRow[] {
  return OFFICIAL_EVIDENCE_SOURCES.map((source) => ({
    id: source.id,
    slug: source.slug,
    name: resolveSourceDisplayName(source.slug),
    organization: source.organization,
    coverage: source.coverage,
    supportedIndicatorCount: source.supportedIndicators.length,
    supportedIndicatorSlugs: source.supportedIndicators,
    connectionLabel: mapConnectionLabel(source.connectionStatus),
    verificationLabel: mapVerificationLabel(source.verificationStatus),
    updateFrequency: source.updateFrequency,
    license: source.license,
    officialWebsite: source.officialWebsite,
  }));
}

function buildIndicatorsByDomain(): EvidenceExplorerModel["indicatorsByDomain"] {
  const byDomain = new Map<IndicatorDomainId, ExplorerIndicatorRow[]>();

  for (const indicator of ALL_DOMAIN_INDICATORS) {
    const row = mapIndicatorToExplorerRow(indicator);
    const list = byDomain.get(indicator.category) ?? [];
    list.push(row);
    byDomain.set(indicator.category, list);
  }

  return INDICATOR_DOMAIN_CATALOG.filter((domain) => byDomain.has(domain.id)).map(
    (domain) => ({
      domainId: domain.id,
      domainTitle: domain.title,
      indicators: byDomain.get(domain.id) ?? [],
    }),
  );
}

function buildEntityModule(
  entityType: "country" | "company" | "university",
  label: string,
  route: string,
  registryCount: number,
): ExplorerEntityModule {
  const indicators = getIndicatorsForEntity(entityType);
  const connected = indicators.filter((i) => i.status === "connected").length;
  const notConnected = indicators.filter(
    (i) => i.status === "not_connected" || i.status === "planned",
  ).length;

  const domainIds = new Set(indicators.map((i) => i.category));
  const missingCategories: string[] = [];

  for (const domainId of domainIds) {
    const domainIndicators = indicators.filter((i) => i.category === domainId);
    const hasConnected = domainIndicators.some((i) => i.status === "connected");
    if (!hasConnected) {
      missingCategories.push(getDomain(domainId)?.title ?? domainId);
    }
  }

  const connectedSources = OFFICIAL_EVIDENCE_SOURCES.filter(
    (s) => s.connectionStatus === "connected",
  ).length;

  return {
    entityType,
    label,
    route,
    registryCount,
    registryAvailable: registryCount > 0,
    indicatorTotal: indicators.length,
    indicatorsConnected: connected,
    indicatorsNotConnected: notConnected,
    connectedSourceCount: connectedSources,
    totalSourceCount: OFFICIAL_EVIDENCE_SOURCES.length,
    missingEvidenceCategories: missingCategories,
  };
}

function buildLifecycleStages(
  sources: ExplorerSourceRow[],
  indicators: ExplorerIndicatorRow[],
): ExplorerLifecycleStage[] {
  const indicatorConnected = indicators.filter(
    (i) => i.evidenceStatusLabel === "Connected",
  ).length;
  const indicatorNotConnected = indicators.filter(
    (i) => i.evidenceStatusLabel === "Not connected",
  ).length;
  const indicatorPlanned = indicators.filter(
    (i) => i.evidenceStatusLabel === "Planned",
  ).length;

  return [
    {
      id: "planned",
      title: "Planned",
      description:
        "Source or indicator registered in architecture — integration not started.",
      sourceCount: sources.filter((s) => s.connectionLabel === "Evidence source planned")
        .length,
      indicatorCount: indicatorPlanned,
    },
    {
      id: "connected",
      title: "Connected",
      description:
        "Technical connection or registry path exists — evidence may flow.",
      sourceCount: sources.filter((s) => s.connectionLabel === "Connected").length,
      indicatorCount: indicatorConnected,
    },
    {
      id: "verification-pending",
      title: "Verification Pending",
      description:
        "Data received or registry active — validation checklist not complete.",
      sourceCount: sources.filter((s) => s.verificationLabel === "Verification pending")
        .length,
      indicatorCount: 0,
    },
    {
      id: "verified",
      title: "Verified",
      description:
        "Passed validation — suitable for entity display and future evaluation.",
      sourceCount: sources.filter((s) => s.verificationLabel === "Verified").length,
      indicatorCount: indicatorConnected,
    },
    {
      id: "deprecated",
      title: "Deprecated",
      description: "Retired source or indicator — not used for new evidence.",
      sourceCount: sources.filter((s) => s.connectionLabel === "Deprecated").length,
      indicatorCount: 0,
    },
    {
      id: "not-connected",
      title: "Not Connected",
      description:
        "Indicator defined but required sources not wired — no claims displayed.",
      sourceCount: 0,
      indicatorCount: indicatorNotConnected,
    },
  ];
}

function buildPersonas(): ExplorerPersona[] {
  return [
    {
      id: "citizen",
      title: "Citizen",
      verifyAnswer:
        "Which official sources CBAI has registered, which are connected, and which evidence categories remain missing for public institutions.",
    },
    {
      id: "investor",
      title: "Investor",
      verifyAnswer:
        "Source connection status for fiscal, procurement, and market indicators before any due diligence data appears on entity routes.",
    },
    {
      id: "government",
      title: "Government",
      verifyAnswer:
        "Evidence gaps by domain and source — what publication priorities would unlock indicator coverage.",
    },
    {
      id: "student",
      title: "Student",
      verifyAnswer:
        "Whether education and accreditation indicators have connected sources — not league tables or rankings.",
    },
    {
      id: "researcher",
      title: "Researcher",
      verifyAnswer:
        "Indicator IDs, required source slugs, and lifecycle status for reproducible research scoping.",
    },
    {
      id: "academic",
      title: "Academic",
      verifyAnswer:
        "Methodology requirements and source attribution rules before citing any future CBAI evaluation.",
    },
  ];
}

function buildTrustPillars(): ExplorerTrustPillar[] {
  return [
    {
      id: "evidence-first",
      title: "Evidence First",
      description:
        "The explorer shows registered sources and indicators — not fabricated documents or confidence scores.",
    },
    {
      id: "official-source-priority",
      title: "Official Source Priority",
      description:
        "United Nations, World Bank, NSO, and other official sources are registered with connection status — not scraped or social data.",
    },
    {
      id: "reproducibility",
      title: "Reproducibility",
      description:
        "Every row traces to evidence infrastructure and indicator framework IDs — exportable for audit.",
    },
    {
      id: "methodology-before-metrics",
      title: "Methodology Before Metrics",
      description:
        "Future scores require methodology and verified sources — none are displayed here.",
    },
    {
      id: "no-fake-data",
      title: "No Fake Data",
      description:
        "No document counts, corpus health, or AI summaries — only real platform architecture state.",
    },
    {
      id: "political-neutrality",
      title: "Political Neutrality",
      description:
        "Source and indicator registry is politically neutral — no editorial ranking or advocacy.",
    },
  ];
}

function buildMethodology(): ExplorerMethodologyPoint[] {
  return [
    {
      id: "no-evidence-no-score",
      title: "No evidence → no score",
      description:
        "CBAI does not display evaluation metrics until verified evidence connects through the infrastructure pipeline.",
    },
    {
      id: "no-source-no-claim",
      title: "No source → no claim",
      description:
        "Every intelligence claim on entity routes must trace to a registered source with honest connection status.",
    },
    {
      id: "evidence-judgment-separation",
      title: "Evidence and judgment are separated",
      description:
        "Registry facts and connected evidence items are distinct from any future evaluative conclusions.",
    },
    {
      id: "future-scores-methodology",
      title: "Future scores require methodology",
      description:
        "When evaluation becomes available, indicator ID, methodology version, and source provenance precede any number.",
    },
  ];
}

/** Build the full Evidence Explorer model from platform foundations. */
export function buildEvidenceExplorerModel(): EvidenceExplorerModel {
  const sources = buildSourceRows();
  const indicatorsByDomain = buildIndicatorsByDomain();
  const allIndicators = indicatorsByDomain.flatMap((g) => g.indicators);
  const graph = buildKnowledgeGraph();
  const graphStats = computeGraphStats(graph);
  const infraSummary = getInfrastructureSummary();

  const connectedSources = sources.filter((s) => s.connectionLabel === "Connected").length;
  const plannedSources = sources.filter(
    (s) => s.connectionLabel === "Evidence source planned",
  ).length;
  const connectedIndicators = allIndicators.filter(
    (i) => i.evidenceStatusLabel === "Connected",
  ).length;
  const notConnectedIndicators = allIndicators.filter(
    (i) => i.evidenceStatusLabel === "Not connected",
  ).length;

  return {
    version: EVIDENCE_EXPLORER_VERSION,
    infrastructureVersion: INFRASTRUCTURE_VERSION,
    frameworkVersion: FRAMEWORK_VERSION,
    summary: {
      totalSources: infraSummary.sourceCount,
      connectedSources,
      plannedSources,
      totalIndicators: ALL_DOMAIN_INDICATORS.length,
      connectedIndicators,
      notConnectedIndicators,
      registryEntityCount: countries.length + companies.length + universities.length,
      graphEdges: graphStats.totalEdges,
      verifiedGraphEdges: graphStats.verifiedEdgeCount,
    },
    sources,
    indicatorsByDomain,
    entityModules: [
      buildEntityModule("country", "Countries", "/countries", countries.length),
      buildEntityModule("company", "Companies", "/companies", companies.length),
      buildEntityModule("university", "Universities", "/universities", universities.length),
    ],
    lifecycleStages: buildLifecycleStages(sources, allIndicators),
    methodology: buildMethodology(),
    personas: buildPersonas(),
    trustPillars: buildTrustPillars(),
  };
}

export function explorerStatusClass(label: CoverageStatusLabel | string): string {
  switch (label) {
    case "Connected":
      return "text-teal-400 bg-teal-500/10 border-teal-500/20";
    case "Planned":
    case "Evidence source planned":
      return "text-violet-400 bg-violet-500/10 border-violet-500/20";
    case "Verification pending":
    case "Verified":
      return "text-amber-400 bg-amber-500/10 border-amber-500/20";
    case "Not connected":
    case "Evidence source not connected":
      return "text-zinc-400 bg-zinc-800/50 border-zinc-700/50";
    case "Deprecated":
      return "text-zinc-500 bg-zinc-900/50 border-zinc-700/50";
    default:
      return "text-zinc-400 bg-zinc-800/50 border-zinc-700/50";
  }
}
