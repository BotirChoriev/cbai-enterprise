/**
 * Real Country Report generator (Countries Intelligence mission). Compiles only data already
 * computed elsewhere in the real country journey/coverage pipeline — never re-derives, never
 * invents a missing section. "Generate Report" produces this compiled view on demand; there is
 * no export/PDF pipeline (Reports Center already declares that Planned, honestly, elsewhere).
 */

import type { Country } from "@/lib/countries";
import type { CountryUserJourney } from "@/lib/country-user-journey";
import { COUNTRY_METHODOLOGY_POINTS } from "@/lib/countries.intelligence";
import { countConnectedSources } from "@/components/shared/entity-profile-copy";
import { companyHrefByName, universityHrefByName } from "@/components/shared/resolve-entity-link";

export type CountryReportLimitation = string;

export type CountryReportLink = { name: string; href: string | null };

export type CountryReport = {
  country: Country;
  overview: {
    name: string;
    code: string;
    capital: string;
    region: string;
    government: string;
    officialWebsite: string | null;
  };
  evidence: {
    connectedSources: number;
    totalSources: number;
    connectedIndicators: number;
    openQuestions: number;
  };
  research: string;
  relatedCompanies: CountryReportLink[];
  relatedUniversities: CountryReportLink[];
  methodology: typeof COUNTRY_METHODOLOGY_POINTS;
  trustStatement: string;
  limitations: CountryReportLimitation[];
};

export function buildCountryReport(country: Country, journey: CountryUserJourney): CountryReport {
  const { profile, evidenceGaps } = journey;
  const { coverage } = profile;
  const sourceConnectedCount = countConnectedSources(coverage);
  const openQuestions = evidenceGaps.plannedCount + evidenceGaps.missingCount + evidenceGaps.blockedCount;

  const limitations: CountryReportLimitation[] = [
    "No external evidence sources are connected yet — registry facts and coverage status only.",
    "No governance, economic, or population statistics are connected and none are shown.",
    "No historical timeline events are connected for this country.",
    "No verified link between countries and research topics exists yet in this catalog.",
  ];

  return {
    country,
    overview: {
      name: country.name,
      code: country.code,
      capital: country.capital,
      region: country.region,
      government: country.government,
      officialWebsite: country.officialWebsite ?? null,
    },
    evidence: {
      connectedSources: sourceConnectedCount,
      totalSources: coverage.sources.length,
      connectedIndicators: coverage.evidenceCoverage.connected,
      openQuestions,
    },
    research: "No research topics are connected to this country in the current catalog.",
    relatedCompanies: profile.linkedEntities.relatedCompanies.map((name) => ({
      name,
      href: companyHrefByName(name),
    })),
    relatedUniversities: profile.linkedEntities.universities.map((name) => ({
      name,
      href: universityHrefByName(name),
    })),
    methodology: COUNTRY_METHODOLOGY_POINTS,
    trustStatement: profile.neutralityNotice,
    limitations,
  };
}
