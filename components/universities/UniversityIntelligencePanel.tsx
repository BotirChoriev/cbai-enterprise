import type { University } from "@/lib/universities";
import type { UniversityUserJourney } from "@/lib/university-user-journey";
import EvidenceComparisonPanel from "@/components/evidence-comparison/EvidenceComparisonPanel";
import EntityOverviewSection from "@/components/shared/EntityOverviewSection";
import IntelligenceContextPanel from "@/components/shared/IntelligenceContextPanel";
import UniversityIndicatorCoverage from "@/components/universities/UniversityIndicatorCoverage";
import UniversitySourceCoverage from "@/components/universities/UniversitySourceCoverage";
import EntityEvidenceSection from "@/components/shared/EntityEvidenceSection";
import EntityCompareSection from "@/components/shared/EntityCompareSection";
import EntityOptionalExploration from "@/components/shared/EntityOptionalExploration";
import EvidenceGapPanel from "@/components/evidence-gap/EvidenceGapPanel";
import { EntityReportsAvailable } from "@/components/shared/EntityDecisionPackagePreview";
import {
  countConnectedSources,
  getConnectedAvailableItems,
} from "@/components/shared/entity-profile-copy";
import { getUniversityRelationships } from "@/lib/universities.adapter";

type UniversityIntelligencePanelProps = {
  journey: UniversityUserJourney;
  university: University;
};

export function UniversityIntelligencePanel({
  journey,
  university,
}: UniversityIntelligencePanelProps) {
  const { profile, evidenceGaps, evidenceComparison } = journey;
  const { registryFacts, coverage } = profile;
  const sourceConnectedCount = countConnectedSources(coverage);
  const relationships = getUniversityRelationships(university);
  const relatedEntityCount = (relationships.country ? 1 : 0) + relationships.companies.length;
  const openQuestionsCount = evidenceGaps.plannedCount + evidenceGaps.missingCount + evidenceGaps.blockedCount;

  return (
    <div className="space-y-6">
      <EntityOverviewSection
        name={registryFacts.name}
        entityType="University"
        country={registryFacts.country}
        subtitle={`${registryFacts.icon} · ${registryFacts.type} · ${registryFacts.city}`}
        availableInformation={registryFacts.sourceLabel}
        facts={[{ label: "Founded", value: String(registryFacts.founded) }]}
      />

      <IntelligenceContextPanel
        relatedEntityCount={relatedEntityCount}
        evidenceConnectedCount={sourceConnectedCount}
        evidenceTotalCount={coverage.sources.length}
        reportsCount={journey.reports.length}
        openQuestionsCount={openQuestionsCount}
      />

      <EntityEvidenceSection
        connectedCount={coverage.evidenceCoverage.connected}
        sourceConnectedCount={sourceConnectedCount}
        totalSources={coverage.sources.length}
        availableItems={getConnectedAvailableItems(coverage)}
      />

      <EvidenceGapPanel
        profile={evidenceGaps}
        showSummary={false}
        showSources={false}
        showMethodology={false}
      />

      <EntityReportsAvailable reports={journey.reports} entityLabel="university" />

      <EntityOptionalExploration>
        <EntityCompareSection>
          <EvidenceComparisonPanel
            entityType="university"
            leftLegacyId={university.id}
            initialModel={evidenceComparison}
          />
        </EntityCompareSection>

        <UniversityIndicatorCoverage indicatorsByDomain={coverage.indicatorsByDomain} />

        <UniversitySourceCoverage sources={coverage.sources} />
      </EntityOptionalExploration>
    </div>
  );
}

export default UniversityIntelligencePanel;
