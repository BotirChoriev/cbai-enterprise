/**
 * Real Company Report generator (Companies Intelligence mission). Compiles only data already
 * computed elsewhere in the real company journey/coverage pipeline — never re-derives, never
 * invents a missing section. "Generate Report" produces this compiled view on demand; there is
 * no export/PDF pipeline (Reports Center already declares that Planned, honestly, elsewhere).
 */

import type { Company } from "@/lib/companies";
import type { CompanyUserJourney } from "@/lib/company-user-journey";
import { COMPANY_METHODOLOGY_POINTS } from "@/lib/companies.intelligence";
import { countConnectedSources } from "@/components/shared/entity-profile-copy";
import { getRelatedResearchTopics, type CompanyResearchMatch } from "@/lib/company-research";
import { countryHrefByName } from "@/components/shared/resolve-entity-link";

export type CompanyReportLimitation = string;

export type CompanyReport = {
  company: Company;
  overview: {
    name: string;
    industry: string;
    country: string;
    founded: number;
    website: string | null;
  };
  evidence: {
    connectedSources: number;
    totalSources: number;
    connectedIndicators: number;
    openQuestions: number;
  };
  research: CompanyResearchMatch[];
  country: { name: string; href: string } | null;
  methodology: typeof COMPANY_METHODOLOGY_POINTS;
  trustStatement: string;
  limitations: CompanyReportLimitation[];
};

export function buildCompanyReport(company: Company, journey: CompanyUserJourney): CompanyReport {
  const { profile, evidenceGaps } = journey;
  const { coverage } = profile;
  const sourceConnectedCount = countConnectedSources(coverage);
  const openQuestions = evidenceGaps.plannedCount + evidenceGaps.missingCount + evidenceGaps.blockedCount;

  const countryName = profile.linkedEntities.relatedCountry;
  const countryHref = countryName ? countryHrefByName(countryName) : null;

  const limitations: CompanyReportLimitation[] = [
    "No external evidence sources are connected yet — registry facts and coverage status only.",
    "Financial, market, ESG, and workforce data are not connected and are not shown.",
    "Partner and competitor relationships are not inferred and are not shown.",
    "Related research topics are matched by industry keyword, not a confirmed institutional link.",
  ];

  return {
    company,
    overview: {
      name: company.name,
      industry: company.industry,
      country: company.country,
      founded: company.founded,
      website: company.website ?? null,
    },
    evidence: {
      connectedSources: sourceConnectedCount,
      totalSources: coverage.sources.length,
      connectedIndicators: coverage.evidenceCoverage.connected,
      openQuestions,
    },
    research: getRelatedResearchTopics(company),
    country: countryName && countryHref ? { name: countryName, href: countryHref } : null,
    methodology: COMPANY_METHODOLOGY_POINTS,
    trustStatement: profile.neutralityNotice,
    limitations,
  };
}
