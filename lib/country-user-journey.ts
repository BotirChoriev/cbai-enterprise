import type { Country } from "@/lib/countries";
import type { CountryRelationships } from "@/lib/countries.adapter";
import { buildCountryIntelligenceProfile } from "@/lib/countries.intelligence";
import { getCountryEvidenceGaps } from "@/lib/evidence-gap";
import type { EntityEvidenceGapProfile } from "@/lib/evidence-gap";
import { getCountryEvidenceComparison } from "@/lib/evidence-comparison";
import type { EvidenceComparisonModel } from "@/lib/evidence-comparison";
import { getCountryPipelineReadiness } from "@/lib/pipeline-readiness";
import type { EntityPipelineReadinessModel } from "@/lib/pipeline-readiness";
import { buildDecisionPackageFromTemplate } from "@/lib/decision-intelligence";
import type { DecisionContextRecord, DecisionSummary } from "@/lib/decision-intelligence";
import { buildReportsCenterModel, type ReportTypeDefinition } from "@/lib/reports-center";
import type { CountryIntelligenceProfile } from "@/lib/countries.intelligence";

/** Primary decision template for country search-to-review workflow. */
export const COUNTRY_JOURNEY_DECISION_TEMPLATE = "investor-country-scope" as const;

export type CountryUserJourney = {
  profile: CountryIntelligenceProfile;
  evidenceGaps: EntityEvidenceGapProfile;
  pipelineReadiness: EntityPipelineReadinessModel;
  evidenceComparison: EvidenceComparisonModel;
  decisionContext: DecisionContextRecord | null;
  decisionSummary: DecisionSummary | null;
  reports: readonly ReportTypeDefinition[];
};

/**
 * Compose country intelligence journey from existing builders — single call site.
 */
export function buildCountryUserJourney(
  country: Country,
  relationships: CountryRelationships,
): CountryUserJourney {
  const profile = buildCountryIntelligenceProfile(country, relationships);
  const evidenceGaps = getCountryEvidenceGaps(country);
  const pipelineReadiness = getCountryPipelineReadiness(country);
  const evidenceComparison = getCountryEvidenceComparison(country);

  const decisionPackage = buildDecisionPackageFromTemplate(COUNTRY_JOURNEY_DECISION_TEMPLATE, {
    countryId: country.id,
  });

  const reports = buildReportsCenterModel().reportTypes.filter(
    (report) => report.entityScope === "multi-entity" || report.entityScope === "country",
  );

  return {
    profile,
    evidenceGaps,
    pipelineReadiness,
    evidenceComparison,
    decisionContext: decisionPackage?.context ?? null,
    decisionSummary: decisionPackage?.summary ?? null,
    reports,
  };
}
