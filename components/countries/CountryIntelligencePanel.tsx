"use client";

import { useState } from "react";
import { usePlatformContext } from "@/components/platform/context/PlatformContextProvider";
import type { Country } from "@/lib/countries";
import type { CountryUserJourney } from "@/lib/country-user-journey";
import { getCountryTimelineModel } from "@/lib/timeline";
import { buildEntityReport } from "@/lib/entity/entity-report";
import CountryReportView from "@/components/countries/CountryReportView";
import EvidenceComparisonPanel from "@/components/evidence-comparison/EvidenceComparisonPanel";
import EntityHeader from "@/components/shared/EntityHeader";
import IntelligenceContextPanel from "@/components/shared/IntelligenceContextPanel";
import EntityEvidenceSection from "@/components/shared/EntityEvidenceSection";
import GenerateReportToggleButton from "@/components/shared/GenerateReportToggleButton";
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
import EntityFutureSources from "@/components/shared/EntityFutureSources";
import { EntityReportsAvailable } from "@/components/shared/EntityDecisionPackagePreview";
import {
  countConnectedSources,
  getConnectedAvailableItems,
} from "@/components/shared/entity-profile-copy";
import { getCountryRelationships } from "@/lib/countries.adapter";
import SaveToWorkspaceButton from "@/components/shared/SaveToWorkspaceButton";
import AddToMissionButton from "@/components/mission/MissionOperatingActions";
import CreateProjectFromEntityButton from "@/components/project/CreateProjectFromEntityButton";
import GlobalStatusStrip from "@/components/enterprise/GlobalStatusStrip";
import { buildGlobalStatus } from "@/lib/enterprise/global-status";
import { useTranslation } from "@/lib/i18n/use-translation";

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
  const { t } = useTranslation();
  const [showReport, setShowReport] = useState(false);
  const { context } = usePlatformContext();
  const { profile, evidenceGaps, evidenceComparison } = journey;
  const { registryFacts, coverage } = profile;
  const sourceConnectedCount = countConnectedSources(coverage);
  const timelineModel = getCountryTimelineModel(country);
  const relationships = getCountryRelationships(country);
  const relatedEntityCount = relationships.relatedCompanies.length + relationships.universities.length;
  const openQuestionsCount = evidenceGaps.plannedCount + evidenceGaps.missingCount + evidenceGaps.blockedCount;

  // Governance Intelligence and Economic Intelligence read the same country registry through two
  // different working orders — not different colors, a different sequence of the same real
  // sections. A government analyst opens the institutional timeline before anything else; an
  // economic analyst opens comparables and indicator coverage before anything else. Everyone
  // else (no workspace, or the Citizen lens) gets the original evidence-first order untouched.
  const lens = context.workspace === "government" || context.workspace === "investor" ? context.workspace : null;

  const institutionalRecord = (
    <div className="space-y-4">
      <TimelineReadinessPanel model={timelineModel} />
      <TimelineCoverage model={timelineModel} />
      <TimelineEvidenceGap model={timelineModel} />
    </div>
  );

  const comparablesAndCoverage = (
    <div className="space-y-6">
      <EntityCompareSection
        heading={t("entityIntelligence.comparables")}
        description={t("entityUi.benchmarkCountry")}
      >
        <EvidenceComparisonPanel
          entityType="country"
          leftLegacyId={country.id}
          initialModel={evidenceComparison}
        />
      </EntityCompareSection>
      <CountryIndicatorCoverage
        evidenceCoverage={coverage.evidenceCoverage}
        indicatorsByDomain={coverage.indicatorsByDomain}
        sources={coverage.sources}
      />
    </div>
  );

  return (
    <div className="space-y-6">
      {searchQuery ? (
        <p className="text-sm text-zinc-500">
          {t("entityIntelligence.fromSearch", { query: searchQuery })}
        </p>
      ) : null}

      <div className="flex flex-wrap justify-end gap-2">
        <AddToMissionButton
          entity={{ kind: "country", id: country.id, name: country.name, code: country.code }}
          compact
        />
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
        entityType={t("entityIntelligence.entityTypeCountry")}
        country={registryFacts.name}
        region={registryFacts.region}
        subtitle={`${registryFacts.code} · ${registryFacts.capital}`}
        availableInformation={registryFacts.sourceLabel}
        facts={[
          { label: t("entityIntelligence.factGovernment"), value: registryFacts.government },
          {
            label: t("entityIntelligence.factOfficialWebsite"),
            value: country.officialWebsite ?? t("entityUi.noVerifiedInfo"),
            href: country.officialWebsite,
          },
        ]}
      />

      <GlobalStatusStrip
        compact
        status={buildGlobalStatus({
          ...coverage.evidenceCoverage,
          connectedSources: sourceConnectedCount,
          totalSources: coverage.sources.length,
        })}
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

      {lens ? (
        <div
          className={`rounded-xl border px-5 py-4 ${
            lens === "government"
              ? "border-teal-500/25 bg-teal-500/5"
              : "border-indigo-500/25 bg-indigo-500/5"
          }`}
        >
          <p
            className={`text-[10px] font-semibold uppercase tracking-widest ${
              lens === "government" ? "text-teal-300" : "text-indigo-300"
            }`}
          >
            {lens === "government"
              ? t("entityIntelligence.governanceLensTitle")
              : t("entityIntelligence.investorLensTitle")}
          </p>
          <p className="mt-1 text-sm text-zinc-400">
            {lens === "government"
              ? t("entityIntelligence.governanceLensBody")
              : t("entityIntelligence.investorLensBody")}
          </p>
        </div>
      ) : null}

      {lens === "government" ? institutionalRecord : null}
      {lens === "investor" ? comparablesAndCoverage : null}
      {!lens ? <TimelineReadinessPanel model={timelineModel} /> : null}

      <CountryRelatedResearch country={country} />

      <EntityReportsAvailable reports={journey.reports} entityLabel="country" />

      <div className="space-y-4">
        <GenerateReportToggleButton showReport={showReport} onClick={() => setShowReport((current) => !current)} />
        {showReport
          ? (() => {
              const report = buildEntityReport("country", country.id);
              return report ? <CountryReportView report={report} /> : null;
            })()
          : null}
      </div>

      <EntityOptionalExploration>
        {lens !== "investor" ? comparablesAndCoverage : null}

        <CountrySourceCoverage sources={coverage.sources} />

        <EntityFutureSources domainIds={coverage.indicatorsByDomain.map((d) => d.domainId)} />

        <CountryMethodology />

        <CountryTrustSection pillars={profile.trustPillars} neutralityNotice={profile.neutralityNotice} />

        <div className="space-y-4">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-600">
            {t("entityIntelligence.timelineDetail")}
          </p>
          {lens === "investor" ? <TimelineReadinessPanel model={timelineModel} /> : null}
          {lens !== "government" ? <TimelineCoverage model={timelineModel} /> : null}
          {lens !== "government" ? <TimelineEvidenceGap model={timelineModel} /> : null}
          <TimelineSources model={timelineModel} />
          <TimelineMethodology model={timelineModel} />
          <TimelineHumanReview model={timelineModel} />
        </div>
      </EntityOptionalExploration>
    </div>
  );
}

export default CountryIntelligencePanel;
