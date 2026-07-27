/**
 * Build UniversityIntelligenceProfile from registry — honest empty scientific slots.
 */

import { companies } from "@/lib/companies";
import { countries } from "@/lib/countries";
import type { University } from "@/lib/universities";
import { resolveUniversityLogo } from "@/lib/university-intelligence/logo";
import {
  UNIVERSITY_INTELLIGENCE_SCHEMA_VERSION,
  type MetricWithProvenance,
  type UniversityIntelligenceProfile,
  type UniversityIntelligenceSnapshot,
} from "@/lib/university-intelligence/types";
import { namesMatch } from "@/lib/name-match";
import { flagEmojiFromIsoAlpha2 } from "@/lib/country-intelligence/flags";

function countryForUniversity(u: University): { id: string | null; code: string | null } {
  const match = countries.find((c) => namesMatch(c.name, u.country));
  return { id: match?.id ?? null, code: match?.code ?? null };
}

function emptyMetric(key: string, labelKey: string): MetricWithProvenance {
  return {
    key,
    value: null,
    labelKey,
    verificationState: "not_connected",
    measurementPeriod: null,
    methodologyNote: "Counting rule unavailable until a verified source is connected.",
    lastVerifiedAt: null,
    coverageLimitation: "No verified observation connected.",
    sourceUrl: null,
  };
}

function buildSnapshot(): UniversityIntelligenceSnapshot {
  return {
    researchThemes: [],
    metrics: [
      emptyMetric("faculties", "metricFaculties"),
      emptyMetric("departments", "metricDepartments"),
      emptyMetric("laboratories", "metricLaboratories"),
      emptyMetric("researchCenters", "metricResearchCenters"),
      emptyMetric("researchers", "metricResearchers"),
      emptyMetric("projects", "metricProjects"),
      emptyMetric("publications", "metricPublications"),
      emptyMetric("datasets", "metricDatasets"),
      emptyMetric("patents", "metricPatents"),
      emptyMetric("opportunities", "metricOpportunities"),
      emptyMetric("presentations", "metricPresentations"),
    ],
    dataCoverage: "structured_empty",
    freshness: "unknown",
    missingData: [
      "faculties",
      "departments",
      "laboratories",
      "researchers",
      "projects",
      "publications",
      "datasets",
      "patents",
      "opportunities",
    ],
    honestyNotice:
      "Registry identity facts only until licensed sources connect. Missing stays empty — never zero as a stand-in.",
  };
}

function domainFromWebsite(website: string | null): string[] {
  if (!website) return [];
  try {
    const host = new URL(website).hostname.replace(/^www\./, "");
    return host ? [host] : [];
  } catch {
    return [];
  }
}

export function buildUniversityNetworkProfile(
  university: University,
): UniversityIntelligenceProfile {
  const country = countryForUniversity(university);
  const logo = resolveUniversityLogo(university.id);
  const linkedCompanies = companies
    .filter((c) => namesMatch(c.country, university.country))
    .map((c) => c.id);

  return {
    schemaVersion: UNIVERSITY_INTELLIGENCE_SCHEMA_VERSION,
    identity: {
      id: university.id,
      officialName: university.name,
      alternateNames: [...(university.aliases ?? [])],
      abbreviation: university.icon,
      countryId: country.id,
      countryName: university.country,
      countryCode: country.code,
      city: university.city,
      address: null,
      universityType: university.type,
      officialWebsite: university.website,
      verifiedDomains: domainFromWebsite(university.website),
      logo,
      operatingLanguages: [],
      establishedYear: university.founded,
      identifiers: [],
      sourceReferences: university.website ? [university.website] : [],
      lastVerifiedAt: null,
      dataCoverage: "structured_empty",
      contentLocale: null,
    },
    structure: {
      faculties: [],
      departments: [],
      laboratories: [],
      researchCenters: [],
      institutes: [],
      facilities: [],
      equipment: [],
      officialRelationships: [],
      notice: "Scientific structure is not connected. Do not invent faculties, labs, or centers.",
    },
    snapshot: buildSnapshot(),
    timeline: [],
    academics: [],
    projects: [],
    opportunities: [],
    presentations: [],
    publications: [],
    datasets: [],
    patents: [],
    linkedCountryId: country.id,
    linkedCompanyIds: linkedCompanies,
    limitations: [
      "No licensed live scientific catalog is connected in this deployment.",
      "Neutral monogram is used when no permitted official logo exists.",
      "Collaboration matches require human confirmation before any communication.",
    ],
    disputedDataNotice: null,
    registry: { ...university },
  };
}

export function countryFlagEmojiForUniversity(profile: UniversityIntelligenceProfile): string {
  if (!profile.identity.countryCode) return "";
  return flagEmojiFromIsoAlpha2(profile.identity.countryCode);
}

export function listUniversityIntelligenceProfiles(
  list: readonly University[],
): readonly UniversityIntelligenceProfile[] {
  return list.map(buildUniversityNetworkProfile);
}
