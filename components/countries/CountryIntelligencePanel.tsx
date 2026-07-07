import type { Country } from "@/lib/countries";
import type { CountryUserJourney } from "@/lib/country-user-journey";
import EvidenceComparisonPanel from "@/components/evidence-comparison/EvidenceComparisonPanel";
import EntityOverviewSection from "@/components/shared/EntityOverviewSection";
import EntityEvidenceSection from "@/components/shared/EntityEvidenceSection";
import EntityCompareSection from "@/components/shared/EntityCompareSection";
import EvidenceGapPanel from "@/components/evidence-gap/EvidenceGapPanel";
import EntityDecisionPackagePreview, {
  EntityReportsAvailable,
} from "@/components/shared/EntityDecisionPackagePreview";

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
  const sourceConnectedCount = coverage.sources.filter(
    (source) => source.statusLabel === "Connected",
  ).length;

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
        country={registryFacts.region}
        subtitle={`${registryFacts.code} · ${registryFacts.capital}`}
        availableInformation={registryFacts.sourceLabel}
        facts={[{ label: "Government", value: registryFacts.government }]}
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
          entityType="country"
          leftLegacyId={country.id}
          initialModel={evidenceComparison}
        />
      </EntityCompareSection>
    </div>
  );
}

export default CountryIntelligencePanel;
