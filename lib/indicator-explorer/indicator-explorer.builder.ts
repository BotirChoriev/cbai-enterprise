import {
  ALL_DOMAIN_INDICATORS,
  getDomain,
  getIndicatorById,
} from "@/lib/indicator-framework";
import type { IndicatorDefinition } from "@/lib/indicator-framework";
import { OFFICIAL_EVIDENCE_SOURCES } from "@/lib/evidence-infrastructure/sources/catalog";
import { findConnectorsByEvidenceSourceId } from "@/lib/connectors";
import { getMissionCatalog } from "@/lib/missions";
import { buildDecisionContext } from "@/lib/decision-intelligence/decision-context";
import { DECISION_CONTEXT_TEMPLATES } from "@/lib/decision-intelligence/decision-registry";
import { resolveSourceDisplayName } from "@/lib/countries.coverage";
import { buildReportsCenterModel } from "@/lib/reports-center";
import type { ApplicableEntity } from "@/lib/indicator-framework/types";
import {
  INDICATOR_EXPLORER_RECORD_VERSION,
  type IndicatorExplorerCatalog,
  type IndicatorExplorerCoverageStatus,
  type IndicatorExplorerId,
  type IndicatorExplorerRecord,
  type IndicatorOfficialSourceEntry,
  type IndicatorPlannedConnectorEntry,
  type IndicatorSupportedMissionEntry,
  type IndicatorSupportedReportEntry,
} from "@/lib/indicator-explorer/indicator-explorer.types";
import { INDICATOR_EXPLORER_VERSION } from "@/lib/indicator-explorer/indicator-explorer.version";

export const INDICATOR_EXPLORER_ID_PATTERN = /^indicator-explorer-ind-[a-z0-9-]+$/;

const SOURCE_BY_SLUG = new Map(
  OFFICIAL_EVIDENCE_SOURCES.map((source) => [source.slug, source]),
);

function buildExplorerId(indicatorId: string): IndicatorExplorerId {
  return `indicator-explorer-${indicatorId}` as IndicatorExplorerId;
}

function resolveOfficialSources(
  indicator: IndicatorDefinition,
): IndicatorOfficialSourceEntry[] {
  const requiredSlugs = new Set(indicator.requiredEvidenceSources);
  const optionalSlugs = new Set(indicator.optionalEvidenceSources);
  const allSlugs = new Set([...requiredSlugs, ...optionalSlugs]);

  const fromSlugs = [...allSlugs]
    .map((slug) => SOURCE_BY_SLUG.get(slug))
    .filter((source): source is NonNullable<typeof source> => source !== undefined)
    .map((source) => ({
      sourceId: source.id,
      sourceSlug: source.slug,
      sourceName: resolveSourceDisplayName(source.slug),
      connectionStatus: source.connectionStatus,
      verificationStatus: source.verificationStatus,
      officialWebsite: source.officialWebsite,
      required: requiredSlugs.has(source.slug),
    }));

  const fromSupported = OFFICIAL_EVIDENCE_SOURCES.filter((source) =>
    source.supportedIndicators.includes(indicator.slug),
  )
    .filter((source) => !fromSlugs.some((entry) => entry.sourceId === source.id))
    .map((source) => ({
      sourceId: source.id,
      sourceSlug: source.slug,
      sourceName: resolveSourceDisplayName(source.slug),
      connectionStatus: source.connectionStatus,
      verificationStatus: source.verificationStatus,
      officialWebsite: source.officialWebsite,
      required: false,
    }));

  return [...fromSlugs, ...fromSupported].sort((a, b) =>
    a.sourceName.localeCompare(b.sourceName),
  );
}

function resolvePlannedConnectors(
  sources: readonly IndicatorOfficialSourceEntry[],
): IndicatorPlannedConnectorEntry[] {
  const seen = new Set<string>();
  const connectors: IndicatorPlannedConnectorEntry[] = [];

  for (const source of sources) {
    for (const connector of findConnectorsByEvidenceSourceId(source.sourceId)) {
      if (seen.has(connector.connectorId)) continue;
      seen.add(connector.connectorId);
      connectors.push({
        connectorId: connector.connectorId,
        connectorName: connector.connectorName,
        organization: connector.organization,
        status: connector.status,
        evidenceSourceId: connector.evidenceSourceId ?? null,
      });
    }
  }

  return connectors.sort((a, b) => a.connectorName.localeCompare(b.connectorName));
}

function resolveSupportedMissions(indicatorId: string): IndicatorSupportedMissionEntry[] {
  return getMissionCatalog()
    .missions.filter((mission) => mission.requiredIndicators.includes(indicatorId))
    .map((mission) => ({
      missionId: mission.missionId,
      missionName: mission.missionName,
      persona: mission.persona,
    }));
}

function resolveSupportedReports(
  indicator: IndicatorDefinition,
): IndicatorSupportedReportEntry[] {
  const reports = buildReportsCenterModel().reportTypes;
  const entities = indicator.applicableEntities;

  return reports
    .filter((report) => {
      if (report.entityScope === "multi-entity") return true;
      return entities.includes(report.entityScope as ApplicableEntity);
    })
    .map((report) => ({
      reportId: report.id,
      reportTitle: report.title,
      entityScope: report.entityScope ?? "multi-entity",
    }));
}

function resolveCoverageStatus(
  indicator: IndicatorDefinition,
  sources: readonly IndicatorOfficialSourceEntry[],
): IndicatorExplorerCoverageStatus {
  const connectedCount = sources.filter((s) => s.connectionStatus === "connected").length;
  const plannedCount = sources.filter((s) => s.connectionStatus === "planned").length;

  if (
    indicator.status === "connected" &&
    sources.length > 0 &&
    connectedCount === sources.length
  ) {
    return "connected";
  }

  if (connectedCount > 0 && connectedCount < sources.length) return "partial";

  if (indicator.status === "connected" && connectedCount > 0) return "partial";

  if (indicator.status === "planned" || plannedCount > 0) return "planned";

  if (connectedCount > 0) return "partial";

  return "not_available";
}

function buildStandardLimitations(): string[] {
  return [
    "Indicator Explorer explains indicator definitions and dependencies — not analytics or scores.",
    "Coverage status reflects registry connection posture — not evaluative conclusions.",
    "Future scoring derivation text is disclosed but not implemented.",
    "Human review is required before using indicator information in decision support.",
    "Static export — no live evidence values or time-series data.",
  ];
}

/** Build a full indicator explorer record from framework definition. */
export function buildIndicatorExplorerRecord(
  indicatorId: string,
): IndicatorExplorerRecord | null {
  const indicator = getIndicatorById(indicatorId);
  if (!indicator) return null;

  const domain = getDomain(indicator.category);
  const officialSources = resolveOfficialSources(indicator);
  const plannedConnectors = resolvePlannedConnectors(officialSources);

  return {
    indicatorExplorerId: buildExplorerId(indicator.id),
    indicatorId: indicator.id,
    indicatorName: indicator.title,
    indicatorSlug: indicator.slug,
    domain: domain?.title ?? indicator.category,
    domainId: indicator.category,
    description: indicator.description,
    methodologyReferences: {
      whyItExists: indicator.methodology.whyItExists,
      requiredEvidence: indicator.methodology.requiredEvidence,
      missingEvidence: indicator.methodology.missingEvidence,
      futureScoringDerivation: indicator.methodology.futureScoringDerivation,
      standardReference: `indicator-framework/${indicator.category}/${indicator.slug}`,
    },
    officialSources,
    plannedConnectors,
    supportedEntities: [...indicator.applicableEntities],
    supportedMissions: resolveSupportedMissions(indicator.id),
    supportedReports: resolveSupportedReports(indicator),
    coverageStatus: resolveCoverageStatus(indicator, officialSources),
    limitations: buildStandardLimitations(),
    humanReviewRequired: true,
    version: INDICATOR_EXPLORER_RECORD_VERSION,
  };
}

/** Build explorer record from indicator definition directly. */
export function buildIndicatorExplorerRecordFromDefinition(
  indicator: IndicatorDefinition,
): IndicatorExplorerRecord {
  const built = buildIndicatorExplorerRecord(indicator.id);
  if (!built) {
    throw new Error(`Failed to build explorer record for ${indicator.id}`);
  }
  return built;
}

/** Build full indicator explorer catalog. */
export function buildIndicatorExplorerCatalog(): IndicatorExplorerCatalog {
  const indicators = ALL_DOMAIN_INDICATORS.map((indicator) =>
    buildIndicatorExplorerRecordFromDefinition(indicator),
  );

  const byDomain: Record<string, IndicatorExplorerRecord[]> = {};
  for (const record of indicators) {
    const list = byDomain[record.domainId] ?? [];
    list.push(record);
    byDomain[record.domainId] = list;
  }

  return {
    version: INDICATOR_EXPLORER_VERSION,
    explorerRecordVersion: INDICATOR_EXPLORER_RECORD_VERSION,
    indicatorCount: indicators.length,
    indicators,
    byDomain,
  };
}

export function isValidIndicatorExplorerIdFormat(id: string): id is IndicatorExplorerId {
  return INDICATOR_EXPLORER_ID_PATTERN.test(id);
}

/** Indicator IDs referenced by Decision Intelligence templates. */
export function listDecisionIntelligenceIndicatorIds(): string[] {
  const ids = new Set<string>();

  for (const template of DECISION_CONTEXT_TEMPLATES) {
    const context = buildDecisionContext({
      slug: template.slug,
      input: { missionIds: [template.missionId] },
    });
    for (const id of context.indicatorIds) ids.add(id);
  }

  return [...ids].sort();
}
