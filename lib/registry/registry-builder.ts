import { getIndicatorsForEntity } from "@/lib/indicator-framework";
import type { ApplicableEntity } from "@/lib/indicator-framework/types";
import { OFFICIAL_EVIDENCE_SOURCES } from "@/lib/evidence-infrastructure/sources/catalog";
import { countries } from "@/lib/countries";
import { companies } from "@/lib/companies";
import { universities } from "@/lib/universities";
import type { Country } from "@/lib/countries";
import type { Company } from "@/lib/companies";
import type { University } from "@/lib/universities";
import type {
  ActiveEntityType,
  GlobalRegistry,
  RegistryEntityRecord,
} from "@/lib/registry/types";
import {
  ENTITY_RECORD_VERSION,
  REPORT_TYPE_IDS,
  WORKSPACE_IDS,
} from "@/lib/registry/types";
import {
  buildCountryEntityId,
  buildCompanyEntityId,
  buildUniversityEntityId,
  countrySlugFromRegistryId,
} from "@/lib/registry/entity-id";
import { resolveCountryCodeByName, resolveRelatedEntityIds } from "@/lib/registry/entity-links";
import { REGISTRY_VERSION } from "@/lib/registry/registry-version";

function applicableEntityForType(type: ActiveEntityType): ApplicableEntity {
  return type;
}

function collectIndicatorIds(entityType: ActiveEntityType): string[] {
  return getIndicatorsForEntity(applicableEntityForType(entityType)).map(
    (indicator) => indicator.id,
  );
}

function collectSourceIds(entityType: ActiveEntityType): string[] {
  const indicators = getIndicatorsForEntity(applicableEntityForType(entityType));
  const indicatorSlugs = new Set(indicators.map((indicator) => indicator.slug));

  return OFFICIAL_EVIDENCE_SOURCES.filter((source) =>
    source.supportedIndicators.some((slug) => indicatorSlugs.has(slug)),
  ).map((source) => source.id);
}

function collectEvidenceIds(entityType: ActiveEntityType): string[] {
  return getIndicatorsForEntity(applicableEntityForType(entityType))
    .filter((indicator) => indicator.status === "connected")
    .map((indicator) => `evidence-${indicator.slug}`);
}

function workspaceIdsForType(entityType: ActiveEntityType): string[] {
  switch (entityType) {
    case "country":
      return [
        WORKSPACE_IDS.government,
        WORKSPACE_IDS.investor,
        WORKSPACE_IDS.citizen,
      ];
    case "company":
      return [WORKSPACE_IDS.investor];
    case "university":
      return [WORKSPACE_IDS.citizen];
  }
}

function reportIdsForType(entityType: ActiveEntityType): string[] {
  const shared = [
    REPORT_TYPE_IDS.investorBrief,
    REPORT_TYPE_IDS.governmentBrief,
    REPORT_TYPE_IDS.researchBrief,
    REPORT_TYPE_IDS.academicMethodology,
  ];

  switch (entityType) {
    case "country":
      return [REPORT_TYPE_IDS.countryIntelligence, ...shared];
    case "company":
      return [REPORT_TYPE_IDS.companyIntelligence, ...shared];
    case "university":
      return [REPORT_TYPE_IDS.universityIntelligence, ...shared];
  }
}

function buildCountryRecord(country: Country): RegistryEntityRecord {
  const slug = countrySlugFromRegistryId(country.id);
  const entityId = buildCountryEntityId(country.id);

  return {
    entityId,
    entityType: "country",
    slug,
    displayName: country.name,
    countryCode: country.code,
    relatedEntityIds: resolveRelatedEntityIds("country", country.id),
    indicatorIds: collectIndicatorIds("country"),
    evidenceIds: collectEvidenceIds("country"),
    sourceIds: collectSourceIds("country"),
    workspaceIds: workspaceIdsForType("country"),
    reportIds: reportIdsForType("country"),
    missionIds: [],
    status: "active",
    version: ENTITY_RECORD_VERSION,
    legacyRegistryId: country.id,
  };
}

function buildCompanyRecord(company: Company): RegistryEntityRecord {
  const entityId = buildCompanyEntityId(company.id);

  return {
    entityId,
    entityType: "company",
    slug: company.id,
    displayName: company.name,
    countryCode: resolveCountryCodeByName(company.country),
    relatedEntityIds: resolveRelatedEntityIds("company", company.id),
    indicatorIds: collectIndicatorIds("company"),
    evidenceIds: collectEvidenceIds("company"),
    sourceIds: collectSourceIds("company"),
    workspaceIds: workspaceIdsForType("company"),
    reportIds: reportIdsForType("company"),
    missionIds: [],
    status: "active",
    version: ENTITY_RECORD_VERSION,
    legacyRegistryId: company.id,
  };
}

function buildUniversityRecord(university: University): RegistryEntityRecord {
  const entityId = buildUniversityEntityId(university.id);

  return {
    entityId,
    entityType: "university",
    slug: university.id,
    displayName: university.name,
    countryCode: resolveCountryCodeByName(university.country),
    relatedEntityIds: resolveRelatedEntityIds("university", university.id),
    indicatorIds: collectIndicatorIds("university"),
    evidenceIds: collectEvidenceIds("university"),
    sourceIds: collectSourceIds("university"),
    workspaceIds: workspaceIdsForType("university"),
    reportIds: reportIdsForType("university"),
    missionIds: [],
    status: "active",
    version: ENTITY_RECORD_VERSION,
    legacyRegistryId: university.id,
  };
}

/** Build the unified global registry from platform source catalogs. */
export function buildGlobalRegistry(): GlobalRegistry {
  const entities: RegistryEntityRecord[] = [
    ...countries.map(buildCountryRecord),
    ...companies.map(buildCompanyRecord),
    ...universities.map(buildUniversityRecord),
  ];

  return {
    version: REGISTRY_VERSION,
    entityVersion: ENTITY_RECORD_VERSION,
    builtAt: new Date().toISOString(),
    entities,
    entityCount: entities.length,
    byType: {
      country: entities.filter((entity) => entity.entityType === "country").length,
      company: entities.filter((entity) => entity.entityType === "company").length,
      university: entities.filter((entity) => entity.entityType === "university").length,
    },
  };
}
