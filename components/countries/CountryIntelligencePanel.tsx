"use client";

import { useState } from "react";
import type { Country } from "@/lib/countries";
import type { CountryUserJourney } from "@/lib/country-user-journey";
import { getCountryTimelineModel } from "@/lib/timeline";
import { buildEntityReport } from "@/lib/entity/entity-report";
import CountryReportView from "@/components/countries/CountryReportView";
import EvidenceComparisonPanel from "@/components/evidence-comparison/EvidenceComparisonPanel";
import EntityHeader from "@/components/shared/EntityHeader";
import IntelligenceContextPanel from "@/components/shared/IntelligenceContextPanel";
import EntityEvidenceSection from "@/components/shared/EntityEvidenceSection";
import EntityCompareSection from "@/components/shared/EntityCompareSection";
import EntityOptionalExploration from "@/components/shared/EntityOptionalExploration";
import EvidenceGapPanel from "@/components/evidence-gap/EvidenceGapPanel";
import TimelineReadinessPanel from "@/components/timeline/TimelineReadinessPanel";
import TimelineCoverage from "@/components/timeline/TimelineCoverage";
import TimelineEvidenceGap from "@/components/timeline/TimelineEvidenceGap";
import TimelineSources from "@/components/timeline/TimelineSources";
import TimelineMethodology from "@/components/timeline/TimelineMethodology";
import TimelineHumanReview from "@/components/timeline/TimelineHumanReview";
import CountryIndicatorCoverage from "@/components/countries/CountryIndicatorCoverage";
import CountrySourceCoverage from "@/components/countries/CountrySourceCoverage";
import CountryRelatedResearch from "@/components/countries/CountryRelatedResearch";
import CountryMethodology from "@/components/countries/CountryMethodology";
import CountryTrustSection from "@/components/countries/CountryTrustSection";
import { EntityReportsAvailable } from "@/components/shared/EntityDecisionPackagePreview";
import {
  countConnectedSources,
  getConnectedAvailableItems,
} from "@/components/shared/entity-profile-copy";
import { getCountryRelationships } from "@/lib/countries.adapter";
import SaveToWorkspaceButton from "@/components/shared/SaveToWorkspaceButton";
import CreateProjectFromEntityButton from "@/components/project/CreateProjectFromEntityButton";

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
  const [showReport, setShowReport] = useState(false);
  const { profile, evidenceGaps, evidenceComparison } = journey;
  const { registryFacts, coverage } = profile;
  const sourceConnectedCount = countConnectedSources(coverage);
  const timelineModel = getCountryTimelineModel(country);
  const relationships = getCountryRelationships(country);
  const relatedEntityCount = relationships.relatedCompanies.length + relationships.universities.length;
  const openQuestionsCount = evidenceGaps.plannedCount + evidenceGaps.missingCount + evidenceGaps.blockedCount;

  return (
    <div className="space-y-6">
      {searchQuery ? (
        <p className="text-sm text-zinc-500">
          From search: &quot;{searchQuery}&quot;
        </p>
      ) : null}

      <div className="flex justify-end gap-2">
        <CreateProjectFromEntityButton entity={{ kind: "country", id: country.id, name: country.name, code: country.code }} />
        <SaveToWorkspaceButton
          entity={{
            kind: "country",
            id: country.id,
            name: country.name,
            code: country.code,
          }}
        />
      </div>

      <EntityHeader
        name={registryFacts.name}
        entityType="Country"
        country={registryFacts.name}
        region={registryFacts.region}
        subtitle={`${registryFacts.code} · ${registryFacts.capital}`}
        availableInformation={registryFacts.sourceLabel}
        facts={[
          { label: "Government", value: registryFacts.government },
          {
            label: "Official website",
            value: country.officialWebsite ?? "No verified information available.",
            href: country.officialWebsite,
          },
        ]}
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

      <TimelineReadinessPanel model={timelineModel} />

      <CountryRelatedResearch country={country} />

      <EntityReportsAvailable reports={journey.reports} entityLabel="country" />

      <div className="space-y-4">
        <button
          type="button"
          onClick={() => setShowReport((current) => !current)}
          className="inline-flex items-center gap-2 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-300 transition-colors hover:border-cyan-500/50"
        >
          {showReport ? "Hide report" : "Generate report"}
        </button>
        {showReport
          ? (() => {
              const report = buildEntityReport("country", country.id);
              return report ? <CountryReportView report={report} /> : null;
            })()
          : null}
      </div>

      <EntityOptionalExploration>
        <EntityCompareSection>
          <EvidenceComparisonPanel
            entityType="country"
            leftLegacyId={country.id}
            initialModel={evidenceComparison}
          />
        </EntityCompareSection>

        <CountryIndicatorCoverage indicatorsByDomain={coverage.indicatorsByDomain} />

        <CountrySourceCoverage sources={coverage.sources} />

        <CountryMethodology />

        <CountryTrustSection pillars={profile.trustPillars} neutralityNotice={profile.neutralityNotice} />

        <div className="space-y-4">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-600">
            Timeline detail
          </p>
          <TimelineCoverage model={timelineModel} />
          <TimelineEvidenceGap model={timelineModel} />
          <TimelineSources model={timelineModel} />
          <TimelineMethodology model={timelineModel} />
          <TimelineHumanReview model={timelineModel} />
        </div>
      </EntityOptionalExploration>
    </div>
  );
}

export default CountryIntelligencePanel;
