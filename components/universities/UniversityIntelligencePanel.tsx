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
import UniversityTrustSection from "@/components/universities/UniversityTrustSection";
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
import SaveToWorkspaceButton from "@/components/shared/SaveToWorkspaceButton";
import CreateProjectFromEntityButton from "@/components/project/CreateProjectFromEntityButton";

type UniversityIntelligencePanelProps = {
  journey: UniversityUserJourney;
  university: University;
};

export function UniversityIntelligencePanel({
  journey,
  university,
}: UniversityIntelligencePanelProps) {
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
              const report = buildEntityReport("university", university.id);
              return report ? <UniversityReportView report={report} /> : null;
            })()
          : null}
      </div>

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

        <UniversityMethodology />

        <UniversityTrustSection pillars={profile.trustPillars} neutralityNotice={profile.neutralityNotice} />
      </EntityOptionalExploration>
    </div>
  );
}

export default UniversityIntelligencePanel;
