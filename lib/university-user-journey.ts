import type { University } from "@/lib/universities";
import type { UniversityLinkedEntities } from "@/lib/universities.adapter";
import { buildUniversityIntelligenceProfile } from "@/lib/universities.intelligence";
import type { UniversityIntelligenceProfile } from "@/lib/universities.intelligence";
import { getUniversityEvidenceGaps } from "@/lib/evidence-gap";
import type { EntityEvidenceGapProfile } from "@/lib/evidence-gap";
import { getUniversityEvidenceComparison } from "@/lib/evidence-comparison";
import type { EvidenceComparisonModel } from "@/lib/evidence-comparison";
import { getUniversityPipelineReadiness } from "@/lib/pipeline-readiness";
import type { EntityPipelineReadinessModel } from "@/lib/pipeline-readiness";
import { buildDecisionPackageFromTemplate } from "@/lib/decision-intelligence";
import type { DecisionSummary } from "@/lib/decision-intelligence";
import { buildReportsCenterModel, type ReportTypeDefinition } from "@/lib/reports-center";

export const UNIVERSITY_JOURNEY_DECISION_TEMPLATE = "researcher-cross-entity" as const;

export type UniversityUserJourney = {
  profile: UniversityIntelligenceProfile;
  evidenceGaps: EntityEvidenceGapProfile;
  pipelineReadiness: EntityPipelineReadinessModel;
  evidenceComparison: EvidenceComparisonModel;
  decisionSummary: DecisionSummary | null;
  reports: readonly ReportTypeDefinition[];
};

export function buildUniversityUserJourney(
  university: University,
  linked: UniversityLinkedEntities,
): UniversityUserJourney {
  const profile = buildUniversityIntelligenceProfile(university, linked);
  const evidenceGaps = getUniversityEvidenceGaps(university);
  const pipelineReadiness = getUniversityPipelineReadiness(university);
  const evidenceComparison = getUniversityEvidenceComparison(university);

  const decisionPackage = buildDecisionPackageFromTemplate(
    UNIVERSITY_JOURNEY_DECISION_TEMPLATE,
    { universityId: university.id },
  );

  const reports = buildReportsCenterModel().reportTypes.filter(
    (report) =>
      report.entityScope === "multi-entity" || report.entityScope === "university",
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
