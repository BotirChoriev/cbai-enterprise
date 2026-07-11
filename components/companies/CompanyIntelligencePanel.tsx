import type { Company } from "@/lib/companies";
import type { CompanyUserJourney } from "@/lib/company-user-journey";
import EvidenceComparisonPanel from "@/components/evidence-comparison/EvidenceComparisonPanel";
import EntityOverviewSection from "@/components/shared/EntityOverviewSection";
import EntityDataStatus from "@/components/shared/EntityDataStatus";
import EntityEvidenceSection from "@/components/shared/EntityEvidenceSection";
import EntityCompareSection from "@/components/shared/EntityCompareSection";
import EntityOptionalExploration from "@/components/shared/EntityOptionalExploration";
import EvidenceGapPanel from "@/components/evidence-gap/EvidenceGapPanel";
import { EntityReportsAvailable } from "@/components/shared/EntityDecisionPackagePreview";
import {
  countConnectedSources,
  getConnectedAvailableItems,
} from "@/components/shared/entity-profile-copy";

type CompanyIntelligencePanelProps = {
  journey: CompanyUserJourney;
  company: Company;
};

export function CompanyIntelligencePanel({ journey, company }: CompanyIntelligencePanelProps) {
  const { profile, evidenceGaps, evidenceComparison } = journey;
  const { registryFacts, coverage } = profile;
  const sourceConnectedCount = countConnectedSources(coverage);

  return (
    <div className="space-y-6">
      <EntityOverviewSection
        name={registryFacts.name}
        entityType="Company"
        country={registryFacts.country}
        subtitle={`${registryFacts.icon} · ${registryFacts.industry}`}
        availableInformation={registryFacts.sourceLabel}
        facts={[{ label: "Founded", value: String(registryFacts.founded) }]}
      />

      <EntityDataStatus
        sourceConnectedCount={sourceConnectedCount}
        totalSources={coverage.sources.length}
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

      <EntityReportsAvailable reports={journey.reports} entityLabel="company" />

      <EntityOptionalExploration>
        <EntityCompareSection>
          <EvidenceComparisonPanel
            entityType="company"
            leftLegacyId={company.id}
            initialModel={evidenceComparison}
          />
        </EntityCompareSection>
      </EntityOptionalExploration>
    </div>
  );
}

export default CompanyIntelligencePanel;
