import type { Country } from "@/lib/countries";
import type { CountryUserJourney } from "@/lib/country-user-journey";
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

type CountryIntelligencePanelProps = {
  journey: CountryUserJourney;
  country: Country;
  searchQuery?: string;
};

export function CountryIntelligencePanel({
  journey,
  country,
  searchQuery,
}: CountryIntelligencePanelProps) {
  const { profile, evidenceGaps, evidenceComparison } = journey;
  const { registryFacts, coverage } = profile;
  const sourceConnectedCount = countConnectedSources(coverage);

  return (
    <div className="space-y-6">
      {searchQuery ? (
        <p className="text-sm text-zinc-500">
          From search: &quot;{searchQuery}&quot;
        </p>
      ) : null}

      <EntityOverviewSection
        name={registryFacts.name}
        entityType="Country"
        country={registryFacts.name}
        region={registryFacts.region}
        subtitle={`${registryFacts.code} · ${registryFacts.capital}`}
        availableInformation={registryFacts.sourceLabel}
        facts={[{ label: "Government", value: registryFacts.government }]}
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

      <EntityReportsAvailable reports={journey.reports} entityLabel="country" />

      <EntityOptionalExploration>
        <EntityCompareSection>
          <EvidenceComparisonPanel
            entityType="country"
            leftLegacyId={country.id}
            initialModel={evidenceComparison}
          />
        </EntityCompareSection>
      </EntityOptionalExploration>
    </div>
  );
}

export default CountryIntelligencePanel;
