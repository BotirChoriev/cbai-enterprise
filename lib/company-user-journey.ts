import type { Company } from "@/lib/companies";
import type { CompanyLinkedEntities } from "@/lib/companies.adapter";
import { buildCompanyIntelligenceProfile } from "@/lib/companies.intelligence";
import type { CompanyIntelligenceProfile } from "@/lib/companies.intelligence";
import { getCompanyEvidenceGaps } from "@/lib/evidence-gap";
import type { EntityEvidenceGapProfile } from "@/lib/evidence-gap";
import { getCompanyEvidenceComparison } from "@/lib/evidence-comparison";
import type { EvidenceComparisonModel } from "@/lib/evidence-comparison";
import { getCompanyPipelineReadiness } from "@/lib/pipeline-readiness";
import type { EntityPipelineReadinessModel } from "@/lib/pipeline-readiness";
import { buildDecisionPackageFromTemplate } from "@/lib/decision-intelligence";
import type { DecisionSummary } from "@/lib/decision-intelligence";
import { buildReportsCenterModel, type ReportTypeDefinition } from "@/lib/reports-center";

export const COMPANY_JOURNEY_DECISION_TEMPLATE = "researcher-cross-entity" as const;

export type CompanyUserJourney = {
  profile: CompanyIntelligenceProfile;
  evidenceGaps: EntityEvidenceGapProfile;
  pipelineReadiness: EntityPipelineReadinessModel;
  evidenceComparison: EvidenceComparisonModel;
  decisionSummary: DecisionSummary | null;
  reports: readonly ReportTypeDefinition[];
};

export function buildCompanyUserJourney(
  company: Company,
  linked: CompanyLinkedEntities,
): CompanyUserJourney {
  const profile = buildCompanyIntelligenceProfile(company, linked);
  const evidenceGaps = getCompanyEvidenceGaps(company);
  const pipelineReadiness = getCompanyPipelineReadiness(company);
  const evidenceComparison = getCompanyEvidenceComparison(company);

  const decisionPackage = buildDecisionPackageFromTemplate(COMPANY_JOURNEY_DECISION_TEMPLATE, {
    companyId: company.id,
  });

  const reports = buildReportsCenterModel().reportTypes.filter(
    (report) => report.entityScope === "multi-entity" || report.entityScope === "company",
  );

  return {
    profile,
    evidenceGaps,
    pipelineReadiness,
    evidenceComparison,
    decisionSummary: decisionPackage?.summary ?? null,
    reports,
  };
}
