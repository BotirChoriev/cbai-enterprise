"use client";

import { useState } from "react";
import type { University } from "@/lib/universities";
import type { UniversityUserJourney } from "@/lib/university-user-journey";
import { buildEntityReport } from "@/lib/entity/entity-report";
import UniversityReportView from "@/components/universities/UniversityReportView";
import EvidenceComparisonPanel from "@/components/evidence-comparison/EvidenceComparisonPanel";
import EntityHeader from "@/components/shared/EntityHeader";
import IntelligenceContextPanel from "@/components/shared/IntelligenceContextPanel";
import UniversityIndicatorCoverage from "@/components/universities/UniversityIndicatorCoverage";
import UniversitySourceCoverage from "@/components/universities/UniversitySourceCoverage";
import UniversityMethodology from "@/components/universities/UniversityMethodology";
import UniversityRelatedResearch from "@/components/universities/UniversityRelatedResearch";
import EntityFutureSources from "@/components/shared/EntityFutureSources";
import UniversityTrustSection from "@/components/universities/UniversityTrustSection";
import EntityEvidenceSection from "@/components/shared/EntityEvidenceSection";
import GenerateReportToggleButton from "@/components/shared/GenerateReportToggleButton";
import EntityCompareSection from "@/components/shared/EntityCompareSection";
import EntityOptionalExploration from "@/components/shared/EntityOptionalExploration";
import EvidenceGapPanel from "@/components/evidence-gap/EvidenceGapPanel";
import { EntityReportsAvailable } from "@/components/shared/EntityDecisionPackagePreview";
import {
  countConnectedSources,
  getConnectedAvailableItems,
} from "@/components/shared/entity-profile-copy";
import { getUniversityRelationships } from "@/lib/universities.adapter";
import SaveToWorkspaceButton from "@/components/shared/SaveToWorkspaceButton";
import CreateProjectFromEntityButton from "@/components/project/CreateProjectFromEntityButton";
import { useTranslation } from "@/lib/i18n/use-translation";

type UniversityIntelligencePanelProps = {
  journey: UniversityUserJourney;
  university: University;
};

export function UniversityIntelligencePanel({
  journey,
  university,
}: UniversityIntelligencePanelProps) {
  const { t } = useTranslation();
  const [showReport, setShowReport] = useState(false);
  const { profile, evidenceGaps, evidenceComparison } = journey;
  const { registryFacts, coverage } = profile;
  const sourceConnectedCount = countConnectedSources(coverage);
  const relationships = getUniversityRelationships(university);
  const relatedEntityCount = (relationships.country ? 1 : 0) + relationships.companies.length;
  const openQuestionsCount = evidenceGaps.plannedCount + evidenceGaps.missingCount + evidenceGaps.blockedCount;

  return (
    <div className="space-y-6">
      <div className="flex justify-end gap-2">
        <CreateProjectFromEntityButton entity={{ kind: "university", id: university.id, name: university.name, code: university.icon, countryName: university.country }} />
        <SaveToWorkspaceButton
          entity={{
            kind: "university",
            id: university.id,
            name: university.name,
            code: university.icon,
            countryName: university.country,
          }}
        />
      </div>

      <EntityHeader
        name={registryFacts.name}
        entityType={t("entityIntelligence.entityTypeUniversity")}
        country={registryFacts.country}
        subtitle={`${registryFacts.icon} · ${registryFacts.type} · ${registryFacts.city}`}
        availableInformation={registryFacts.sourceLabel}
        facts={[{ label: t("entityIntelligence.factFounded"), value: String(registryFacts.founded) }]}
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

      <UniversityRelatedResearch university={university} />

      <EntityReportsAvailable reports={journey.reports} entityLabel="university" />

      <div className="space-y-4">
        <GenerateReportToggleButton showReport={showReport} onClick={() => setShowReport((current) => !current)} />
        {showReport
          ? (() => {
              const report = buildEntityReport("university", university.id);
              return report ? <UniversityReportView report={report} /> : null;
            })()
          : null}
      </div>

      <EntityOptionalExploration>
        <EntityCompareSection
          heading={t("entityIntelligence.comparables")}
          description={t("entityIntelligence.benchmarkUniversity")}
        >
          <EvidenceComparisonPanel
            entityType="university"
            leftLegacyId={university.id}
            initialModel={evidenceComparison}
          />
        </EntityCompareSection>

        <UniversityIndicatorCoverage indicatorsByDomain={coverage.indicatorsByDomain} />

        <UniversitySourceCoverage sources={coverage.sources} />

        <EntityFutureSources domainIds={coverage.indicatorsByDomain.map((d) => d.domainId)} />

        <UniversityMethodology />

        <UniversityTrustSection pillars={profile.trustPillars} neutralityNotice={profile.neutralityNotice} />
      </EntityOptionalExploration>
    </div>
  );
}

export default UniversityIntelligencePanel;
