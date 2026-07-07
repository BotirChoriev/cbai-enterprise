import type { Country } from "@/lib/countries";
import type { CountryUserJourney } from "@/lib/country-user-journey";
import CountryCoveragePanel from "@/components/countries/CountryCoveragePanel";
import EvidenceGapPanel from "@/components/evidence-gap/EvidenceGapPanel";
import EvidenceComparisonPanel from "@/components/evidence-comparison/EvidenceComparisonPanel";
import CountryTimelineSection from "@/components/countries/CountryTimelineSection";
import EntityProfileFlow from "@/components/shared/EntityProfileFlow";
import EntitySupportingDetails from "@/components/shared/EntitySupportingDetails";
import EntityDecisionPackagePreview, {
  EntityReportsAvailable,
} from "@/components/shared/EntityDecisionPackagePreview";
import IndicatorExplorerPanel from "@/components/indicator-explorer/IndicatorExplorerPanel";
import { EntityPipelineReadinessSection } from "@/components/pipeline/PipelineReadinessPanel";

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
  const { profile, evidenceGaps, pipelineReadiness, evidenceComparison } = journey;
  const { registryFacts, coverage } = profile;
  const sourceConnectedCount = coverage.sources.filter(
    (source) => source.statusLabel === "Connected",
  ).length;

  return (
    <div className="space-y-8">
      <EntityProfileFlow entityName={country.name} searchQuery={searchQuery} />

      <section aria-labelledby="country-overview-heading">
        <h3
          id="country-overview-heading"
          className="text-sm font-semibold uppercase tracking-wider text-zinc-500"
        >
          Overview
        </h3>
        <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-950 px-6 py-5">
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-50">
            {registryFacts.name}
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            {registryFacts.code} · {registryFacts.capital} · {registryFacts.region}
          </p>
          <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs uppercase tracking-wider text-zinc-600">Government form</dt>
              <dd className="mt-1 text-zinc-300">{registryFacts.government}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-zinc-600">
                Available information
              </dt>
              <dd className="mt-1 text-zinc-300">{registryFacts.sourceLabel}</dd>
            </div>
          </dl>
        </div>
      </section>

      <CountryCoveragePanel
        summary={coverage.evidenceCoverage}
        sourceConnectedCount={sourceConnectedCount}
        totalSources={coverage.sources.length}
      />

      <EvidenceGapPanel
        profile={evidenceGaps}
        showSummary={false}
        showSources={false}
        showMethodology={false}
        heading="Missing Evidence"
      />

      <EntityDecisionPackagePreview summary={journey.decisionSummary} />

      <EntityReportsAvailable reports={journey.reports} />

      <EntitySupportingDetails>
        <EntityPipelineReadinessSection model={pipelineReadiness} />
        <IndicatorExplorerPanel variant="embedded" />
        <EvidenceComparisonPanel
          entityType="country"
          leftLegacyId={country.id}
          initialModel={evidenceComparison}
        />
        <CountryTimelineSection country={country} />
      </EntitySupportingDetails>
    </div>
  );
}

export default CountryIntelligencePanel;
