/**
 * Build CountryProfile from registry Country — honest empty indicator slots.
 * Never fabricates numeric values, scores, or forecasts.
 */

import { companies } from "@/lib/companies";
import type { Country } from "@/lib/countries";
import { DOMAIN_DEFINITIONS } from "@/lib/country-intelligence/domains";
import { buildFlagMetadata, resolveEmblemMetadata } from "@/lib/country-intelligence/flags";
import { emptyIndicatorSeriesPlaceholder } from "@/lib/country-intelligence/history";
import { isoAlpha3ForCountryId } from "@/lib/country-intelligence/iso";
import { summarizeSourceCapability } from "@/lib/country-intelligence/source-registry";
import {
  COUNTRY_INTELLIGENCE_SCHEMA_VERSION,
  type CauseExplanation,
  type CountryProfile,
  type IndicatorObservation,
  type ThenNowNextPanel,
} from "@/lib/country-intelligence/types";
import { namesMatch } from "@/lib/name-match";
import { universities } from "@/lib/universities";

function emptyObservation(
  domainId: IndicatorObservation["domainId"],
  indicatorId: string,
): IndicatorObservation {
  return {
    id: `${indicatorId}:latest`,
    domainId,
    indicatorId,
    localizedLabelKey: indicatorId,
    officialSourceLabel: null,
    value: null,
    unit: null,
    observationDate: null,
    geographicCoverage: null,
    sourceOrganization: null,
    sourceUrl: null,
    datasetName: null,
    releaseDate: null,
    methodologyUrl: null,
    methodologyNote: null,
    evidenceStatus: "not_available",
    comparabilityStatus: "unknown",
    freshnessStatus: "unknown",
    missingDataReason: "No verified data available",
    revisionNote: null,
    provenance: "uncertainty",
    officialTarget: null,
    scenarioValue: null,
  };
}

function buildThenNowNext(_country: Country): ThenNowNextPanel {
  return {
    then: {
      baselineYear: null,
      summary: "",
      sourceLabel: null,
      contextualEvents: [],
    },
    now: {
      summary: "",
      evidenceState: "not_available",
      constraints: [],
      uncertainties: [],
    },
    next: {
      officialCommitments: [],
      publishedPlans: [],
      targets: [],
      cbaiScenarios: [],
      risks: [],
      monitoringSignals: [],
      notice: "",
    },
  };
}

function buildDefaultCauses(country: Country): readonly CauseExplanation[] {
  return [
    {
      id: `${country.id}:cause:insufficient`,
      statement: "",
      classification: "insufficient_evidence",
      supportingSourceIds: [],
      alternativeExplanations: [],
      limitations: [],
    },
  ];
}

export function buildCountryProfile(country: Country): CountryProfile {
  const sourceSummary = summarizeSourceCapability();
  const linkedUniversities = universities.filter((u) => namesMatch(u.country, country.name));
  const linkedCompanies = companies.filter((c) => namesMatch(c.country, country.name));

  const domainSlots = DOMAIN_DEFINITIONS.map((domain) => {
    const primaryIndicator = domain.indicatorIds[0] ?? `${domain.id}_primary`;
    const series = emptyIndicatorSeriesPlaceholder(primaryIndicator, domain.id);
    const latest = emptyObservation(domain.id, primaryIndicator);
    return {
      domainId: domain.id,
      latest,
      series,
      sourceCount: 0,
      hasComparableHistory: false,
    };
  });

  const completeness: CountryProfile["profileCompleteness"] = "structured_empty";

  return {
    schemaVersion: COUNTRY_INTELLIGENCE_SCHEMA_VERSION,
    id: country.id,
    isoAlpha2: country.code.toUpperCase(),
    isoAlpha3: isoAlpha3ForCountryId(country.id),
    officialName: country.name,
    displayNameKey: `country.${country.id}`,
    sourceLanguageName: null,
    flag: buildFlagMetadata(country.code),
    emblem: resolveEmblemMetadata(country.id),
    capital: country.capital,
    region: country.region,
    subregion: null,
    officialLanguages: [],
    population: { value: null, source: null, year: null },
    currency: null,
    governmentForm: { label: country.government, provenance: "registry" },
    officialWebsite: country.officialWebsite ?? null,
    profileCompleteness: completeness,
    lastVerifiedDate: null,
    sourceCoverageSummary: {
      connected: sourceSummary.connected,
      availableNotConnected: sourceSummary.availableNotConnected,
      notAvailable: sourceSummary.notAvailable,
    },
    dataFreshness: "unknown",
    limitations: [
      "Indicator observations are not connected — values are never invented.",
      "Political and democracy indicators require methodology and limitation access before display.",
      "Emblem assets ship only when license-verified.",
    ],
    disputedDataNotice:
      "Political measurements from third-party indices are contested in methodology. CBAI will show multiple interpretations when connected — never as unquestionable fact.",
    linkedUniversityIds: linkedUniversities.map((u) => u.id),
    linkedResearcherIds: [],
    linkedCompanyIds: linkedCompanies.map((c) => c.id),
    linkedInstitutionIds: [],
    linkedResearchIds: [],
    linkedEvidenceIds: [],
    linkedOperationalObjectIds: [],
    registry: country,
    domainSlots,
    thenNowNext: buildThenNowNext(country),
    causes: buildDefaultCauses(country),
  };
}

export function listCountryProfiles(countryList: readonly Country[]): readonly CountryProfile[] {
  return countryList.map(buildCountryProfile);
}

export function getCountryProfileById(
  countryList: readonly Country[],
  id: string,
): CountryProfile | null {
  const country = countryList.find((c) => c.id === id || c.code.toLowerCase() === id.toLowerCase());
  return country ? buildCountryProfile(country) : null;
}
