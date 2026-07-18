import type { Entity } from "@/lib/entity/entity.types";
import { countries } from "@/lib/countries";
import type { Country } from "@/lib/countries";
import { companies } from "@/lib/companies";
import type { Company } from "@/lib/companies";
import { universities } from "@/lib/universities";
import type { University } from "@/lib/universities";
import {
  buildCountryEntityId,
  buildCompanyEntityId,
  buildUniversityEntityId,
  entityIdToLegacyRegistryId,
  findEntityById,
  type EntityId,
} from "@/lib/registry";
import {
  buildCountryEvidenceGapProfile,
  buildCompanyEvidenceGapProfile,
  buildUniversityEvidenceGapProfile,
  gapStatusLabel,
} from "@/lib/evidence-gap";
import { getIndicatorExplorerCatalog } from "@/lib/indicator-explorer";
import { buildReportsCenterModel } from "@/lib/reports-center";
import { buildComparisonCandidates } from "@/lib/evidence-comparison";
import type { ComparisonEntityType } from "@/lib/evidence-comparison";
import { getCountryTimeline, timelineReadinessLabel } from "@/lib/timeline";
import {
  DECISION_CONTEXT_TEMPLATES,
  buildDecisionContextFromTemplate,
} from "@/lib/decision-intelligence";
import { decisionReadinessLabel } from "@/lib/decision-intelligence";
import { OFFICIAL_EVIDENCE_SOURCES } from "@/lib/evidence-infrastructure/sources/catalog";
import { resolveSourceDisplayName } from "@/lib/countries.coverage";
import { getIndicatorsForEntity } from "@/lib/indicator-framework";
import type { ApplicableEntity } from "@/lib/indicator-framework/types";
import { coverageStatusLabel } from "@/lib/indicator-explorer";
import { PIPELINE_LIFECYCLE_STAGES } from "@/lib/evidence-pipeline";
import {
  SEARCH_INTELLIGENCE_RECORD_VERSION,
  type SearchComparisonEntry,
  type SearchDecisionContextEntry,
  type SearchEvidenceEntry,
  type SearchIndicatorEntry,
  type SearchIntelligenceCatalog,
  type SearchIntelligenceEntityType,
  type SearchIntelligenceId,
  type SearchIntelligenceRecord,
  type SearchModuleNavLink,
  type SearchOfficialSourceEntry,
  type SearchReportEntry,
  type SearchTimelineEntry,
} from "@/lib/search-intelligence/search-intelligence.types";
import { SEARCH_INTELLIGENCE_VERSION } from "@/lib/search-intelligence/search-intelligence.version";

export const SEARCH_INTELLIGENCE_ID_PATTERN =
  /^search-intelligence-(country|company|university)-[a-z0-9-]+$/;

function buildSearchIntelligenceId(
  entityType: SearchIntelligenceEntityType,
  slug: string,
): SearchIntelligenceId {
  return `search-intelligence-${entityType}-${slug}` as SearchIntelligenceId;
}

function entitySlugFromId(entityId: string): string {
  return entityId.replace(/^(country|company|university)-/, "");
}

function legacyIdFromEntity(entity: Entity): string {
  return entity.id;
}

function entityDetailHref(
  entityType: SearchIntelligenceEntityType,
  legacyId: string,
): string {
  const routes: Record<SearchIntelligenceEntityType, string> = {
    country: "/countries",
    company: "/companies",
    university: "/universities",
  };
  return `${routes[entityType]}?id=${encodeURIComponent(legacyId)}`;
}

function buildNavigationHub(
  entityType: SearchIntelligenceEntityType,
  legacyId: string,
  displayName: string,
): SearchModuleNavLink[] {
  const entityHref = entityDetailHref(entityType, legacyId);
  const graphHref = `/graph?${entityType}=${encodeURIComponent(legacyId)}`;

  const hub: SearchModuleNavLink[] = [
    {
      moduleId: "country",
      label: "Country",
      href: entityType === "country" ? entityHref : "/countries",
      description:
        entityType === "country"
          ? `Open ${displayName} in Countries module.`
          : "Countries module — select a country profile.",
      available: entityType === "country",
    },
    {
      moduleId: "company",
      label: "Company",
      href: entityType === "company" ? entityHref : "/companies",
      description:
        entityType === "company"
          ? `Open ${displayName} in Companies module.`
          : "Companies module — select a company profile.",
      available: entityType === "company",
    },
    {
      moduleId: "university",
      label: "University",
      href: entityType === "university" ? entityHref : "/universities",
      description:
        entityType === "university"
          ? `Open ${displayName} in Universities module.`
          : "Universities module — select a university profile.",
      available: entityType === "university",
    },
    {
      moduleId: "evidence-explorer",
      label: "Evidence Explorer",
      href: "/knowledge",
      description: "Platform evidence architecture and source coverage.",
      available: true,
    },
    {
      moduleId: "indicator-explorer",
      label: "Indicator Explorer",
      href: "/knowledge",
      description: "Indicator definitions, methodology, and dependencies.",
      available: true,
    },
    {
      moduleId: "evidence-gap",
      label: "Evidence Gap",
      href: entityHref,
      description: "Per-indicator evidence gap transparency on entity profile.",
      available: true,
    },
    {
      moduleId: "comparison",
      label: "Comparison",
      href: entityHref,
      description: "Same-type entity evidence comparison on entity profile.",
      available: true,
    },
    {
      moduleId: "decision-intelligence",
      label: "Decision Intelligence",
      href: "/reasoning",
      description: "Decision context templates and evidence organization.",
      available: true,
    },
    {
      moduleId: "reports",
      label: "Reports",
      href: "/reports",
      description: "Report readiness center and methodology definitions.",
      available: true,
    },
    {
      moduleId: "knowledge-graph",
      label: "Knowledge Graph",
      href: graphHref,
      description: "Entity relationship graph with registry context.",
      available: true,
    },
  ];

  return hub;
}

function buildAvailableModules(
  entityType: SearchIntelligenceEntityType,
  legacyId: string,
  displayName: string,
): SearchModuleNavLink[] {
  const entityHref = entityDetailHref(entityType, legacyId);
  const pipelineStageCount = PIPELINE_LIFECYCLE_STAGES.length;

  const modules: SearchModuleNavLink[] = [
    {
      moduleId: "entity-profile",
      label: entityType.charAt(0).toUpperCase() + entityType.slice(1),
      href: entityHref,
      description: `${displayName} intelligence profile.`,
      available: true,
    },
    {
      moduleId: "evidence-pipeline",
      label: "Evidence Pipeline",
      href: entityHref,
      description: `${pipelineStageCount} declared pipeline stages on entity profile.`,
      available: true,
    },
    {
      moduleId: "search",
      label: "Search",
      href: `/search?q=${encodeURIComponent(displayName)}`,
      description: "Return to Global Search with this entity name.",
      available: true,
    },
  ];

  return [...modules, ...buildNavigationHub(entityType, legacyId, displayName)];
}

function resolveGapProfile(
  entityType: SearchIntelligenceEntityType,
  legacyId: string,
) {
  switch (entityType) {
    case "country": {
      const country = countries.find((c) => c.id === legacyId);
      return country ? buildCountryEvidenceGapProfile(country) : null;
    }
    case "company": {
      const company = companies.find((c) => c.id === legacyId);
      return company ? buildCompanyEvidenceGapProfile(company) : null;
    }
    case "university": {
      const university = universities.find((u) => u.id === legacyId);
      return university ? buildUniversityEvidenceGapProfile(university) : null;
    }
  }
}

function buildAvailableEvidence(
  entityType: SearchIntelligenceEntityType,
  legacyId: string,
): SearchEvidenceEntry[] {
  const profile = resolveGapProfile(entityType, legacyId);
  if (!profile) return [];

  return profile.gaps.map((gap) => ({
    indicatorId: gap.indicatorId,
    indicatorName: gap.indicatorTitle,
    gapStatus: gapStatusLabel(gap.currentStatus),
    expectedSource: gap.expectedSource,
  }));
}

function buildAvailableIndicators(
  entityType: SearchIntelligenceEntityType,
): SearchIndicatorEntry[] {
  const applicableEntity = entityType as ApplicableEntity;
  const frameworkIndicators = getIndicatorsForEntity(applicableEntity);
  const explorerCatalog = getIndicatorExplorerCatalog();
  const explorerById = new Map(
    explorerCatalog.indicators.map((record) => [record.indicatorId, record]),
  );

  return frameworkIndicators.map((indicator) => {
    const explorer = explorerById.get(indicator.id);
    return {
      indicatorId: indicator.id,
      indicatorName: indicator.title,
      domain: explorer?.domain ?? indicator.category,
      explorerCoverageStatus: explorer
        ? coverageStatusLabel(explorer.coverageStatus)
        : "Not available",
    };
  });
}

function buildAvailableReports(
  entityType: SearchIntelligenceEntityType,
): SearchReportEntry[] {
  const reports = buildReportsCenterModel().reportTypes;

  return reports
    .filter((report) => {
      if (report.entityScope === "multi-entity") return true;
      return report.entityScope === entityType;
    })
    .map((report) => ({
      reportId: report.id,
      reportTitle: report.title,
      availabilityLabel: report.availableToday,
    }));
}

function buildAvailableComparisons(
  entityType: SearchIntelligenceEntityType,
  entityId: EntityId,
): SearchComparisonEntry[] {
  const comparisonType = entityType as ComparisonEntityType;
  return buildComparisonCandidates(comparisonType, entityId).map((candidate) => ({
    targetEntityId: candidate.entityId,
    targetDisplayName: candidate.displayName,
    entityType,
  }));
}

function buildAvailableTimeline(
  entityType: SearchIntelligenceEntityType,
  legacyId: string,
): SearchTimelineEntry | null {
  if (entityType !== "country") {
    return {
      timelineId: null,
      available: false,
      readinessLabel: "Timeline foundation supports countries only.",
      entityScope: entityType,
    };
  }

  const country = countries.find((c) => c.id === legacyId);
  if (!country) return null;

  const timeline = getCountryTimeline(country);
  return {
    timelineId: timeline.timelineId,
    available: true,
    readinessLabel: timelineReadinessLabel(timeline.readinessStatus),
    entityScope: "country",
  };
}

function buildAvailableDecisionContexts(
  entityType: SearchIntelligenceEntityType,
  legacyId: string,
): SearchDecisionContextEntry[] {
  return DECISION_CONTEXT_TEMPLATES.filter((template) =>
    template.supportedEntityTypes.includes(entityType),
  ).map((template) => {
    const context = buildDecisionContextFromTemplate(template.slug, {
      countryId: entityType === "country" ? legacyId : null,
      companyId: entityType === "company" ? legacyId : null,
      universityId: entityType === "university" ? legacyId : null,
    });

    return {
      templateSlug: template.slug,
      title: template.title,
      readinessLabel: context
        ? decisionReadinessLabel(context.readinessStatus)
        : "Not available",
      supported: context !== null,
    };
  });
}

function buildOfficialSources(
  entityType: SearchIntelligenceEntityType,
): SearchOfficialSourceEntry[] {
  const applicableEntity = entityType as ApplicableEntity;
  const indicatorSlugs = new Set(
    getIndicatorsForEntity(applicableEntity).map((indicator) => indicator.slug),
  );

  return OFFICIAL_EVIDENCE_SOURCES.filter((source) =>
    source.supportedIndicators.some((slug) => indicatorSlugs.has(slug)),
  )
    .map((source) => ({
      sourceId: source.id,
      sourceName: resolveSourceDisplayName(source.slug),
      connectionStatus: source.connectionStatus,
      verificationStatus: source.verificationStatus,
      indicatorCount: source.supportedIndicators.filter((slug) =>
        indicatorSlugs.has(slug),
      ).length,
    }))
    .sort((a, b) => a.sourceName.localeCompare(b.sourceName));
}

function buildStandardLimitations(): string[] {
  return [
    "Global Search Intelligence routes to registry-backed modules — not AI-generated answers.",
    "Token matching uses local catalogs only — no ordinals or confidence values displayed.",
    "Navigation links expose declared platform areas — not evaluative conclusions.",
    "Evidence and indicator lists reflect registry posture — not live data completeness.",
    "Human review is required before using search results in decision support.",
  ];
}

function resolveEntityRecord(
  entityType: SearchIntelligenceEntityType,
  legacyId: string,
  displayName: string,
): SearchIntelligenceRecord | null {
  const entityId =
    entityType === "country"
      ? buildCountryEntityId(legacyId)
      : entityType === "company"
        ? buildCompanyEntityId(legacyId)
        : buildUniversityEntityId(legacyId);

  if (!findEntityById(entityId)) return null;

  const slug = entitySlugFromId(entityId);

  return {
    searchIntelligenceId: buildSearchIntelligenceId(entityType, slug),
    entityId,
    entityType,
    displayName,
    availableModules: buildAvailableModules(entityType, legacyId, displayName),
    availableEvidence: buildAvailableEvidence(entityType, legacyId),
    availableIndicators: buildAvailableIndicators(entityType),
    availableReports: buildAvailableReports(entityType),
    availableComparisons: buildAvailableComparisons(entityType, entityId),
    availableTimeline: buildAvailableTimeline(entityType, legacyId),
    availableDecisionContexts: buildAvailableDecisionContexts(entityType, legacyId),
    officialSources: buildOfficialSources(entityType),
    limitations: buildStandardLimitations(),
    humanReviewRequired: true,
    version: SEARCH_INTELLIGENCE_RECORD_VERSION,
  };
}

/** Build search intelligence record from platform entity. */
export function buildSearchIntelligenceRecordFromEntity(
  entity: Entity,
): SearchIntelligenceRecord | null {
  if (
    entity.type !== "country" &&
    entity.type !== "company" &&
    entity.type !== "university"
  ) {
    return null;
  }

  return resolveEntityRecord(
    entity.type,
    legacyIdFromEntity(entity),
    entity.name,
  );
}

/** Build search intelligence record by registry entity ID. */
export function buildSearchIntelligenceRecord(
  entityId: EntityId | string,
): SearchIntelligenceRecord | null {
  const registryEntity = findEntityById(entityId as EntityId);
  if (!registryEntity) return null;

  const legacyId = entityIdToLegacyRegistryId(entityId as EntityId);
  if (!legacyId) return null;

  const entityType = registryEntity.entityType as SearchIntelligenceEntityType;
  return resolveEntityRecord(entityType, legacyId, registryEntity.displayName);
}

/** Build search intelligence record from typed catalog row. */
export function buildSearchIntelligenceRecordFromCatalog(
  entityType: SearchIntelligenceEntityType,
  row: Country | Company | University,
): SearchIntelligenceRecord {
  const built = resolveEntityRecord(entityType, row.id, row.name);
  if (!built) {
    throw new Error(`Failed to build search intelligence record for ${row.id}`);
  }
  return built;
}

/** Build full search intelligence catalog from global registry entities. */
export function buildSearchIntelligenceCatalog(): SearchIntelligenceCatalog {
  const records: SearchIntelligenceRecord[] = [
    ...countries.map((country) =>
      buildSearchIntelligenceRecordFromCatalog("country", country),
    ),
    ...companies.map((company) =>
      buildSearchIntelligenceRecordFromCatalog("company", company),
    ),
    ...universities.map((university) =>
      buildSearchIntelligenceRecordFromCatalog("university", university),
    ),
  ];

  const byEntityType: SearchIntelligenceCatalog["byEntityType"] = {
    country: records.filter((record) => record.entityType === "country"),
    company: records.filter((record) => record.entityType === "company"),
    university: records.filter((record) => record.entityType === "university"),
  };

  return {
    version: SEARCH_INTELLIGENCE_VERSION,
    recordVersion: SEARCH_INTELLIGENCE_RECORD_VERSION,
    entityCount: records.length,
    records,
    byEntityType,
  };
}

export function isValidSearchIntelligenceIdFormat(
  id: string,
): id is SearchIntelligenceId {
  return SEARCH_INTELLIGENCE_ID_PATTERN.test(id);
}

/** Navigation hub links for a search intelligence record. */
export function getSearchNavigationHub(
  record: SearchIntelligenceRecord,
): readonly SearchModuleNavLink[] {
  return record.availableModules.filter((module) =>
    [
      "country",
      "company",
      "university",
      "evidence-explorer",
      "indicator-explorer",
      "evidence-gap",
      "comparison",
      "decision-intelligence",
      "reports",
      "knowledge-graph",
    ].includes(module.moduleId),
  );
}
