import { ALL_DOMAIN_INDICATORS, getDomain, FRAMEWORK_VERSION } from "@/lib/indicator-framework";
import type { IndicatorDomainId } from "@/lib/indicator-framework/types";
import { OFFICIAL_EVIDENCE_SOURCES } from "@/lib/evidence-infrastructure/sources/catalog";
import { getInfrastructureSummary } from "@/lib/evidence-infrastructure/registry";
import { INFRASTRUCTURE_VERSION } from "@/lib/evidence-infrastructure/types";
import {
  mapSourceToStatusLabel,
  resolveSourceDisplayName,
  type CoverageStatusLabel,
} from "@/lib/countries.coverage";
import { GOVERNANCE_VERSION } from "@/lib/governance/types";
import { explorerStatusClass } from "@/lib/evidence-explorer";

export const WORKSPACES_VERSION = "1.0.0" as const;

export type WorkspaceReadinessLabel =
  | "Available Information"
  | "Evidence Source Not Connected"
  | "Insufficient Evidence"
  | "Planned"
  | "Connected";

export type WorkspaceCoverageItem = {
  id: string;
  title: string;
  description: string;
  indicatorCount: number;
  connectedCount: number;
  statusLabel: WorkspaceReadinessLabel;
};

export type WorkspaceSourceItem = {
  id: string;
  slug: string;
  name: string;
  organization: string;
  coverage: string;
  statusLabel: CoverageStatusLabel;
};

export type WorkspaceMethodologyPoint = {
  id: string;
  title: string;
  description: string;
};

export type WorkspacePersona = {
  id: string;
  title: string;
  answer: string;
};

export type WorkspaceTrustPillar = {
  id: string;
  title: string;
  description: string;
};

export type WorkspaceEntityLink = {
  id: string;
  label: string;
  route: string;
  registryCount: number;
  description: string;
};

export type WorkspaceSummary = {
  domainsTracked: number;
  domainsWithEvidence: number;
  connectedSources: number;
  totalSources: number;
};

export type WorkspaceBaseModel = {
  version: typeof WORKSPACES_VERSION;
  frameworkVersion: typeof FRAMEWORK_VERSION;
  infrastructureVersion: typeof INFRASTRUCTURE_VERSION;
  governanceVersion: typeof GOVERNANCE_VERSION;
  summary: WorkspaceSummary;
};

function getIndicatorsForDomain(domainId: IndicatorDomainId) {
  return ALL_DOMAIN_INDICATORS.filter((indicator) => indicator.category === domainId);
}

function assessDomainStatus(
  domainId: IndicatorDomainId,
  labelStyle: "standard" | "investor",
): WorkspaceCoverageItem {
  const domain = getDomain(domainId);
  const indicators = getIndicatorsForDomain(domainId);
  const connectedCount = indicators.filter((i) => i.status === "connected").length;
  const hasPlanned = indicators.some((i) => i.status === "planned");

  let statusLabel: WorkspaceReadinessLabel;
  if (connectedCount > 0) {
    statusLabel =
      labelStyle === "investor" ? "Available Information" : "Connected";
  } else if (indicators.length === 0) {
    statusLabel = "Insufficient Evidence";
  } else if (hasPlanned) {
    statusLabel = "Planned";
  } else {
    statusLabel = "Evidence Source Not Connected";
  }

  return {
    id: domainId,
    title: domain?.title ?? domainId,
    description: domain?.purpose ?? "Registered indicator domain.",
    indicatorCount: indicators.length,
    connectedCount,
    statusLabel,
  };
}

/** Build coverage rows for a list of indicator domains. */
export function buildDomainCoverage(
  domainIds: readonly IndicatorDomainId[],
  labelStyle: "standard" | "investor" = "standard",
): WorkspaceCoverageItem[] {
  return domainIds.map((id) => assessDomainStatus(id, labelStyle));
}

/** Build coverage for a topic mapped to one or more domains — uses worst status. */
export function buildTopicCoverage(
  id: string,
  title: string,
  description: string,
  domainIds: readonly IndicatorDomainId[],
  labelStyle: "standard" | "investor" = "standard",
): WorkspaceCoverageItem {
  const rows = buildDomainCoverage(domainIds, labelStyle);
  const indicatorCount = rows.reduce((sum, row) => sum + row.indicatorCount, 0);
  const connectedCount = rows.reduce((sum, row) => sum + row.connectedCount, 0);

  const priority: WorkspaceReadinessLabel[] = [
    "Connected",
    "Available Information",
    "Planned",
    "Insufficient Evidence",
    "Evidence Source Not Connected",
  ];

  let statusLabel: WorkspaceReadinessLabel = "Evidence Source Not Connected";
  for (const priorityLabel of priority) {
    if (rows.some((row) => row.statusLabel === priorityLabel)) {
      statusLabel = priorityLabel;
      break;
    }
  }

  if (
    connectedCount === 0 &&
    statusLabel !== "Planned" &&
    indicatorCount > 0
  ) {
    statusLabel = "Evidence Source Not Connected";
  }

  return {
    id,
    title,
    description,
    indicatorCount,
    connectedCount,
    statusLabel,
  };
}

/** Build source rows — all sources or filtered by slug. */
export function buildSourceCoverage(sourceSlugs?: readonly string[]): WorkspaceSourceItem[] {
  const sources = sourceSlugs
    ? OFFICIAL_EVIDENCE_SOURCES.filter((s) => sourceSlugs.includes(s.slug))
    : OFFICIAL_EVIDENCE_SOURCES;

  return sources.map((source) => ({
    id: source.id,
    slug: source.slug,
    name: resolveSourceDisplayName(source.slug),
    organization: source.organization,
    coverage: source.coverage,
    statusLabel: mapSourceToStatusLabel(
      source.connectionStatus,
      source.verificationStatus,
    ),
  }));
}

export function buildWorkspaceSummary(domainIds: readonly IndicatorDomainId[]): WorkspaceSummary {
  const infra = getInfrastructureSummary();
  const coverage = buildDomainCoverage(domainIds);
  const domainsWithEvidence = coverage.filter(
    (row) =>
      row.statusLabel === "Connected" || row.statusLabel === "Available Information",
  ).length;

  return {
    domainsTracked: domainIds.length,
    domainsWithEvidence,
    connectedSources: infra.connectedSources,
    totalSources: infra.sourceCount,
  };
}

export function workspaceStatusClass(label: string): string {
  switch (label) {
    case "Connected":
    case "Available Information":
      return "text-teal-400 bg-teal-500/10 border-teal-500/20";
    case "Planned":
      return "text-violet-400 bg-violet-500/10 border-violet-500/20";
    case "Insufficient Evidence":
      return "text-amber-400 bg-amber-500/10 border-amber-500/20";
    case "Evidence Source Not Connected":
    case "Not connected":
      return "text-zinc-400 bg-zinc-800/50 border-zinc-700/50";
    default:
      return explorerStatusClass(label);
  }
}

export function displayStatusLabel(label: WorkspaceReadinessLabel | CoverageStatusLabel): string {
  switch (label) {
    case "Not connected":
    case "Evidence Source Not Connected":
      return "No source connected";
    case "Planned":
      return "Not yet available";
    case "Verification pending":
      return "Review pending";
    case "Connected":
      return "Available now";
    case "Insufficient Evidence":
      return "Limited evidence";
    default:
      return label;
  }
}

export { buildGovernmentWorkspace } from "@/lib/workspaces/government";
export type { GovernmentWorkspaceModel } from "@/lib/workspaces/government";
export { buildInvestorWorkspace } from "@/lib/workspaces/investor";
export type { InvestorWorkspaceModel } from "@/lib/workspaces/investor";
export { buildCitizenWorkspace } from "@/lib/workspaces/citizen";
export type { CitizenWorkspaceModel, CitizenFeedbackNotice } from "@/lib/workspaces/citizen";
