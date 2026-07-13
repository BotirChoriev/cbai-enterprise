"use client";

import { useState } from "react";
import type { Company } from "@/lib/companies";
import type { CompanyUserJourney } from "@/lib/company-user-journey";
import { buildEntityReport } from "@/lib/entity/entity-report";
import CompanyReportView from "@/components/companies/CompanyReportView";
import EvidenceComparisonPanel from "@/components/evidence-comparison/EvidenceComparisonPanel";
import EntityHeader from "@/components/shared/EntityHeader";
import IntelligenceContextPanel from "@/components/shared/IntelligenceContextPanel";
import CompanyIndicatorCoverage from "@/components/companies/CompanyIndicatorCoverage";
import CompanySourceCoverage from "@/components/companies/CompanySourceCoverage";
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
import { getCompanyRelationships } from "@/lib/companies.adapter";
import CompanyRelatedResearch from "@/components/companies/CompanyRelatedResearch";
import CompanyMethodology from "@/components/companies/CompanyMethodology";
import EntityFutureSources from "@/components/shared/EntityFutureSources";
import CompanyTrustSection from "@/components/companies/CompanyTrustSection";
import SaveToWorkspaceButton from "@/components/shared/SaveToWorkspaceButton";
import CreateProjectFromEntityButton from "@/components/project/CreateProjectFromEntityButton";

type CompanyIntelligencePanelProps = {
  journey: CompanyUserJourney;
  company: Company;
};

export function CompanyIntelligencePanel({ journey, company }: CompanyIntelligencePanelProps) {
  const [showReport, setShowReport] = useState(false);
  const { profile, evidenceGaps, evidenceComparison } = journey;
  const { registryFacts, coverage } = profile;
  const sourceConnectedCount = countConnectedSources(coverage);
  const relationships = getCompanyRelationships(company);
  const relatedEntityCount =
    (relationships.headquartersCountry ? 1 : 0) + relationships.universities.length;
  const openQuestionsCount = evidenceGaps.plannedCount + evidenceGaps.missingCount + evidenceGaps.blockedCount;

  return (
    <div className="space-y-6">
      <div className="flex justify-end gap-2">
        <CreateProjectFromEntityButton entity={{ kind: "company", id: company.id, name: company.name, code: company.icon, countryName: company.country }} />
        <SaveToWorkspaceButton
          entity={{
            kind: "company",
            id: company.id,
            name: company.name,
            code: company.icon,
            countryName: company.country,
          }}
        />
      </div>

      <EntityHeader
        name={registryFacts.name}
        entityType="Company"
        country={registryFacts.country}
        subtitle={`${registryFacts.icon} · ${registryFacts.industry}`}
        availableInformation={registryFacts.sourceLabel}
        facts={[
          { label: "Founded", value: String(registryFacts.founded) },
          {
            label: "Official website",
            value: company.website ?? "No verified data available.",
            href: company.website,
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

      <CompanyRelatedResearch company={company} />

      <EntityReportsAvailable reports={journey.reports} entityLabel="company" />

      <div className="space-y-4">
        <GenerateReportToggleButton showReport={showReport} onClick={() => setShowReport((current) => !current)} />
        {showReport
          ? (() => {
              const report = buildEntityReport("company", company.id);
              return report ? <CompanyReportView report={report} /> : null;
            })()
          : null}
      </div>

      <EntityOptionalExploration>
        <EntityCompareSection>
          <EvidenceComparisonPanel
            entityType="company"
            leftLegacyId={company.id}
            initialModel={evidenceComparison}
          />
        </EntityCompareSection>

        <CompanyIndicatorCoverage indicatorsByDomain={coverage.indicatorsByDomain} />

        <CompanySourceCoverage sources={coverage.sources} />

        <EntityFutureSources domainIds={coverage.indicatorsByDomain.map((d) => d.domainId)} />

        <CompanyMethodology />

        <CompanyTrustSection pillars={profile.trustPillars} neutralityNotice={profile.neutralityNotice} />
      </EntityOptionalExploration>
    </div>
  );
}

export default CompanyIntelligencePanel;
