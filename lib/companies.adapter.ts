import { countries } from "@/lib/countries";
import { universities } from "@/lib/universities";
import type { Company } from "@/lib/companies";
import {
  INSUFFICIENT_EVIDENCE_LABEL,
  NOT_CONNECTED_SOURCE_LABEL,
} from "@/lib/companies.intelligence";
import type { Entity } from "@/lib/entity/entity.types";
import { namesMatch } from "@/lib/name-match";

/** Links derived from local country and university catalogs only. */
export type CompanyLinkedEntities = {
  relatedCountry: string | null;
  universities: string[];
};

export type CompanyRelationships = {
  headquartersCountry: string | null;
  universities: string[];
  partnerCompanies: string[];
  competitorCompanies: string[];
};

/** Ordered metadata fields for company factual overview grid. */
export const COMPANY_METADATA_FIELDS = [
  { key: "country", label: "Headquarters Country" },
  { key: "industry", label: "Industry" },
  { key: "founded", label: "Founded" },
  { key: "icon", label: "Catalog Symbol" },
] as const;

function resolveHeadquartersCountry(company: Company): string | null {
  const match = countries.find((country) =>
    namesMatch(country.name, company.country),
  );
  return match?.name ?? (company.country || null);
}

/**
 * Derive company relationships from local country and university catalogs.
 * No fabricated partner, competitor, or market relationship lists.
 */
export function getCompanyRelationships(company: Company): CompanyRelationships {
  const headquartersCountry = resolveHeadquartersCountry(company);

  const linkedUniversities = universities
    .filter((university) => namesMatch(university.country, company.country))
    .map((university) => university.name);

  return {
    headquartersCountry,
    universities: linkedUniversities,
    partnerCompanies: [],
    competitorCompanies: [],
  };
}

export function getCompanyLinkedEntities(company: Company): CompanyLinkedEntities {
  const relationships = getCompanyRelationships(company);
  return {
    relatedCountry: relationships.headquartersCountry,
    universities: relationships.universities,
  };
}

function buildFactualOverview(company: Company): string {
  return `${company.name} (${company.icon}) — ${company.industry}, headquartered in ${company.country}, founded ${company.founded}. Information from local platform catalog only.`;
}

/**
 * Adapter: maps Company catalog record → universal Entity interface.
 * Factual fields only — no fabricated scores or narratives.
 */
export function toCompanyEntity(company: Company): Entity {
  const relationships = getCompanyRelationships(company);

  return {
    id: company.id,
    type: "company",
    name: company.name,
    icon: company.icon,
    category: company.industry,
    subtitle: `${company.country} · Est. ${company.founded}`,
    overview: buildFactualOverview(company),
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
      country: company.country,
      industry: company.industry,
      founded: company.founded,
      icon: company.icon,
    },
    metrics: [
      {
        id: "reference-status",
        label: "Reference Status",
        value: "Local catalog profile",
        highlight: true,
      },
      {
        id: "linked-country",
        label: "Linked Country (local catalog)",
        value: relationships.headquartersCountry ?? "Not linked",
      },
      {
        id: "linked-universities",
        label: "Universities in same country (local catalog)",
        value: relationships.universities.length,
        unit: "records",
      },
    ],
  };
}

/** Batch adapter for list operations and cross-entity queries. */
export function toCompanyEntities(companiesList: Company[]): Entity[] {
  return companiesList.map(toCompanyEntity);
}

/** Human-readable unavailable label for relationship sections. */
export function formatRelationshipAvailability(count: number): string {
  return count > 0
    ? `${count} linked record(s)`
    : NOT_CONNECTED_SOURCE_LABEL;
}
