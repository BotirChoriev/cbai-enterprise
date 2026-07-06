import { companies } from "@/lib/companies";
import { countries } from "@/lib/countries";
import type { University } from "@/lib/universities";
import type { Entity, EntityMetadataField } from "@/lib/entity/entity.types";

const INSUFFICIENT_EVIDENCE_LABEL = "Insufficient Evidence";
const NOT_CONNECTED_SOURCE_LABEL = "Evidence Source Not Connected";

/** Cross-entity links derived from local registries only. */
export type UniversityRelationships = {
  country: string | null;
  companies: string[];
  researchCenters: string[];
  government: string[];
};

/** Ordered metadata fields for university factual overview grid. */
export const UNIVERSITY_METADATA_FIELDS: EntityMetadataField[] = [
  { key: "country", label: "Country" },
  { key: "city", label: "City" },
  { key: "type", label: "Institution Type" },
  { key: "founded", label: "Founded Year" },
  { key: "website", label: "Official Website" },
  { key: "registryStatus", label: "Registry Status" },
];

function normalizeName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function namesMatch(a: string, b: string): boolean {
  const na = normalizeName(a);
  const nb = normalizeName(b);
  return na === nb || na.includes(nb) || nb.includes(na);
}

function resolveCountryRecord(university: University) {
  return countries.find((country) => namesMatch(country.name, university.country));
}

function buildFactualOverview(university: University): string {
  const websiteLine = university.website
    ? `Website recorded in registry: ${university.website}.`
    : "Official website not recorded in local registry.";
  return `${university.name} (${university.icon}) — ${university.type} institution in ${university.city}, ${university.country}, founded ${university.founded}. ${websiteLine} Information from local platform catalog only.`;
}

/**
 * Derive university relationships from local country and company registries.
 * No fabricated partner, research center, or partnership lists.
 */
export function getUniversityRelationships(
  university: University,
): UniversityRelationships {
  const countryRecord = resolveCountryRecord(university);

  const companiesInCountry = companies
    .filter((company) => namesMatch(company.country, university.country))
    .map((company) => company.name);

  return {
    country: university.country,
    companies: companiesInCountry,
    researchCenters: [],
    government: countryRecord ? [countryRecord.government] : [],
  };
}

export function getUniversityLinkedEntities(university: University): UniversityRelationships {
  return getUniversityRelationships(university);
}

/**
 * Adapter: maps University catalog record → universal Entity interface.
 * Factual fields only — no fabricated scores or narratives.
 */
export function toUniversityEntity(university: University): Entity {
  const relationships = getUniversityRelationships(university);

  return {
    id: university.id,
    type: "university",
    name: university.name,
    icon: university.icon,
    category: university.type,
    subtitle: `${university.city}, ${university.country}`,
    overview: buildFactualOverview(university),
    status: "active",
    scores: {
      aiScore: 0,
      investmentScore: 0,
      riskScore: 0,
    },
    tags: [],
    timeline: [],
    aiSummary: INSUFFICIENT_EVIDENCE_LABEL,
    metadata: {
      country: university.country,
      city: university.city,
      type: university.type,
      founded: university.founded,
      website: university.website ?? "Not recorded in local registry",
      registryStatus: "Local reference profile",
      linkedCompanies: relationships.companies.length,
    },
    metrics: [
      {
        id: "registry-status",
        label: "Registry Status",
        value: "Local reference profile",
        highlight: true,
      },
      {
        id: "linked-companies",
        label: "Linked Companies (local catalog)",
        value: relationships.companies.length,
        unit: "records",
      },
      {
        id: "linked-country",
        label: "Country (local catalog)",
        value: relationships.country ?? "Not linked",
      },
    ],
  };
}

/** Batch adapter for list operations and cross-entity queries. */
export function toUniversityEntities(universitiesList: University[]): Entity[] {
  return universitiesList.map(toUniversityEntity);
}

/** Human-readable unavailable label for relationship sections. */
export function formatRelationshipAvailability(count: number): string {
  return count > 0
    ? `${count} record(s) from local registry`
    : NOT_CONNECTED_SOURCE_LABEL;
}

export function formatWebsiteDisplay(website: string | null): string {
  return website ?? "Not recorded in local registry";
}
