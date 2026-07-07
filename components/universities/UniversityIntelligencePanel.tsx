import type { University } from "@/lib/universities";
import type { UniversityUserJourney } from "@/lib/university-user-journey";
import EvidenceComparisonPanel from "@/components/evidence-comparison/EvidenceComparisonPanel";
import EntityOverviewSection from "@/components/shared/EntityOverviewSection";
import EntityEvidenceSection from "@/components/shared/EntityEvidenceSection";
import EntityCompareSection from "@/components/shared/EntityCompareSection";
import EvidenceGapPanel from "@/components/evidence-gap/EvidenceGapPanel";
import EntityDecisionPackagePreview, {
  EntityReportsAvailable,
} from "@/components/shared/EntityDecisionPackagePreview";

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
  const sourceConnectedCount = coverage.sources.filter(
    (s) => s.statusLabel === "Connected",
  ).length;

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

      <EntityEvidenceSection
        connectedCount={coverage.evidenceCoverage.connected}
        sourceConnectedCount={sourceConnectedCount}
        totalSources={coverage.sources.length}
      />

      <EvidenceGapPanel
        profile={evidenceGaps}
        showSummary={false}
        showSources={false}
        showMethodology={false}
      />

      <EntityDecisionPackagePreview summary={journey.decisionSummary} />

      <EntityReportsAvailable reports={journey.reports} />

      <EntityCompareSection>
        <EvidenceComparisonPanel
          entityType="university"
          leftLegacyId={university.id}
          initialModel={evidenceComparison}
        />
      </EntityCompareSection>
    </div>
  );
}

export default UniversityIntelligencePanel;
