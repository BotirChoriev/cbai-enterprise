/**
 * Real University Report generator (Platform Relationship Activation mission). Compiles only
 * data already computed elsewhere in the real university journey/coverage pipeline — never
 * re-derives, never invents a missing section. Mirrors lib/country-report.ts and
 * lib/company-report.ts exactly, so all three Golden Rule entities produce a report the same way.
 */

import type { University } from "@/lib/universities";
import type { UniversityUserJourney } from "@/lib/university-user-journey";
import { UNIVERSITY_METHODOLOGY_POINTS } from "@/lib/universities.intelligence";
import { countConnectedSources } from "@/components/shared/entity-profile-copy";
import { countryHrefByName, companyHrefByName } from "@/components/shared/resolve-entity-link";
import type { IndicatorDomainId } from "@/lib/indicator-framework/types";
import { getProjectsLinkedToEntity } from "@/lib/project/project-store";

export type UniversityReportLimitation = string;

export type UniversityReportLink = { name: string; href: string | null };

export type UniversityReport = {
  university: University;
  overview: {
    name: string;
    city: string;
    country: string;
    type: string;
    founded: number;
    website: string | null;
  };
  evidence: {
    connectedSources: number;
    totalSources: number;
    connectedIndicators: number;
    openQuestions: number;
    connectedSourceNames: string[];
    missingSourceNames: string[];
  };
  futureDomainIds: readonly IndicatorDomainId[];
  research: string;
  relatedCountry: UniversityReportLink | null;
  relatedCompanies: UniversityReportLink[];
  /** Real Projects that link to this university, via the same Project Engine relationship every
   * entity type shares — never a separate, fabricated project summary. */
  linkedProjects: UniversityReportLink[];
  methodology: typeof UNIVERSITY_METHODOLOGY_POINTS;
  trustStatement: string;
  limitations: UniversityReportLimitation[];
};

export function buildUniversityReport(
  university: University,
  journey: UniversityUserJourney,
): UniversityReport {
  const { profile, evidenceGaps } = journey;
  const { coverage } = profile;
  const sourceConnectedCount = countConnectedSources(coverage);
  const openQuestions = evidenceGaps.plannedCount + evidenceGaps.missingCount + evidenceGaps.blockedCount;
  const connectedSourceNames = coverage.sources.filter((s) => s.statusLabel === "Connected").map((s) => s.name);
  const missingSourceNames = coverage.sources.filter((s) => s.statusLabel !== "Connected").map((s) => s.name);

  const countryName = profile.linkedEntities.country;
  const countryHref = countryName ? countryHrefByName(countryName) : null;

  const limitations: UniversityReportLimitation[] = [
    "No external evidence sources are connected yet — registry facts and coverage status only.",
    "No enrollment, ranking, or research output statistics are connected and none are shown.",
    "Research centers and industry partnerships are not inferred and are not shown.",
    "No verified link between universities and research topics exists yet in this catalog.",
  ];

  return {
    university,
    overview: {
      name: university.name,
      city: university.city,
      country: university.country,
      type: university.type,
      founded: university.founded,
      website: university.website,
    },
    evidence: {
      connectedSources: sourceConnectedCount,
      totalSources: coverage.sources.length,
      connectedIndicators: coverage.evidenceCoverage.connected,
      openQuestions,
      connectedSourceNames,
      missingSourceNames,
    },
    futureDomainIds: coverage.indicatorsByDomain.map((d) => d.domainId),
    research: "No research topics are connected to this university in the current catalog.",
    relatedCountry: countryName ? { name: countryName, href: countryHref } : null,
    relatedCompanies: profile.linkedEntities.companies.map((name) => ({
      name,
      href: companyHrefByName(name),
    })),
    linkedProjects: getProjectsLinkedToEntity("university", university.id).map((project) => ({
      name: project.title,
      href: `/my-work?project=${project.id}`,
    })),
    methodology: UNIVERSITY_METHODOLOGY_POINTS,
    trustStatement: profile.neutralityNotice,
    limitations,
  };
}
