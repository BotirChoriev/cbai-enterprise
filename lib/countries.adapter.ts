import { companies } from "@/lib/companies";
import { universities } from "@/lib/universities";
import type { Country } from "@/lib/countries";
import {
  INSUFFICIENT_EVIDENCE_LABEL,
  NOT_AVAILABLE_SOURCE_LABEL,
} from "@/lib/countries.intelligence";
import type { Entity } from "@/lib/entity/entity.types";

/** Cross-entity links derived from local registries only. */
export type CountryRelationships = {
  relatedCompanies: string[];
  universities: string[];
  government: string[];
  industries: string[];
};

/** Ordered metadata fields for country factual overview grid. */
export const COUNTRY_METADATA_FIELDS = [
  { key: "region", label: "Region" },
  { key: "capital", label: "Capital" },
  { key: "government", label: "Government Form" },
  { key: "code", label: "Country Code" },
] as const;

function normalizeName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function namesMatch(a: string, b: string): boolean {
  const na = normalizeName(a);
  const nb = normalizeName(b);
  return na === nb || na.includes(nb) || nb.includes(na);
}

/**
 * Derive country relationships from local company and university registries.
 * No hardcoded or fabricated relationship lists.
 */
export function getCountryRelationships(country: Country): CountryRelationships {
  const relatedCompanies = companies
    .filter((company) => namesMatch(company.country, country.name))
    .map((company) => company.name);

  const linkedUniversities = universities
    .filter((university) => namesMatch(university.country, country.name))
    .map((university) => university.name);

  return {
    relatedCompanies,
    universities: linkedUniversities,
    government: [country.government],
    industries: [],
  };
}

function buildFactualOverview(country: Country): string {
  return `${country.name} (${country.code}) — capital ${country.capital}, region ${country.region}. Government form recorded in local registry: ${country.government}.`;
}

/**
 * Adapter: maps Country registry record → universal Entity interface.
 * Factual fields only — no fabricated scores or narratives.
 */
export function toCountryEntity(country: Country): Entity {
  return {
    id: country.id,
    type: "country",
    name: country.name,
    icon: country.code,
    category: country.region,
    subtitle: `${country.capital} · ${country.region}`,
    overview: buildFactualOverview(country),
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
      region: country.region,
      capital: country.capital,
      government: country.government,
      code: country.code,
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
        label: "Linked Companies (local registry)",
        value: getCountryRelationships(country).relatedCompanies.length,
        unit: "records",
      },
      {
        id: "linked-universities",
        label: "Linked Universities (local registry)",
        value: getCountryRelationships(country).universities.length,
        unit: "records",
      },
    ],
  };
}

/** Batch adapter for list operations and cross-entity queries. */
export function toCountryEntities(countriesList: Country[]): Entity[] {
  return countriesList.map(toCountryEntity);
}

/** Human-readable unavailable label for relationship sections. */
export function formatRelationshipAvailability(count: number): string {
  return count > 0
    ? `${count} record(s) from local registry`
    : NOT_AVAILABLE_SOURCE_LABEL;
}
