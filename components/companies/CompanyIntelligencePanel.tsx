"use client";

import { useState } from "react";
import { usePlatformContext } from "@/components/platform/context/PlatformContextProvider";
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
import AddToMissionButton from "@/components/mission/MissionOperatingActions";
import CreateProjectFromEntityButton from "@/components/project/CreateProjectFromEntityButton";
import GlobalStatusStrip from "@/components/enterprise/GlobalStatusStrip";
import EntityArchitecturePanel from "@/components/enterprise/EntityArchitecturePanel";
import { buildGlobalStatus } from "@/lib/enterprise/global-status";
import { COMPANY_ARCHITECTURE_FIELDS } from "@/lib/enterprise/entity-architecture";
import { useTranslation } from "@/lib/i18n/use-translation";

type CompanyIntelligencePanelProps = {
  journey: CompanyUserJourney;
  company: Company;
};

export function CompanyIntelligencePanel({ journey, company }: CompanyIntelligencePanelProps) {
  const { t } = useTranslation();
  const [showReport, setShowReport] = useState(false);
  const { context } = usePlatformContext();
  const { profile, evidenceGaps, evidenceComparison } = journey;
  const { registryFacts, coverage } = profile;
  const sourceConnectedCount = countConnectedSources(coverage);
  const relationships = getCompanyRelationships(company);
  const relatedEntityCount =
    (relationships.headquartersCountry ? 1 : 0) + relationships.universities.length;
  const openQuestionsCount = evidenceGaps.plannedCount + evidenceGaps.missingCount + evidenceGaps.blockedCount;

  // Economic Intelligence reads this same company registry with comparables and indicator
  // coverage promoted before the narrative profile — the same real sections as the default
  // order, just sequenced the way an economic analyst actually works: benchmark first, read
  // the profile second. No workspace (or the Citizen lens) keeps the original order untouched.
  const isEconomicLens = context.workspace === "investor";

  const comparablesAndCoverage = (
    <div className="space-y-6">
      <EntityCompareSection
        heading={t("entityIntelligence.comparables")}
        description={t("entityUi.benchmarkCompany")}
      >
        <EvidenceComparisonPanel
          entityType="company"
          leftLegacyId={company.id}
          initialModel={evidenceComparison}
        />
      </EntityCompareSection>
      <CompanyIndicatorCoverage
        evidenceCoverage={coverage.evidenceCoverage}
        indicatorsByDomain={coverage.indicatorsByDomain}
        sources={coverage.sources}
      />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-end gap-2">
        <AddToMissionButton
          entity={{ kind: "company", id: company.id, name: company.name, code: company.icon, countryName: company.country }}
          compact
        />
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
        entityType={t("entityIntelligence.entityTypeCompany")}
        country={registryFacts.country}
        subtitle={`${registryFacts.icon} · ${registryFacts.industry}`}
        availableInformation={registryFacts.sourceLabel}
        facts={[
          { label: t("entityIntelligence.factFounded"), value: String(registryFacts.founded) },
          {
            label: t("entityIntelligence.factOfficialWebsite"),
            value: company.website ?? t("entityUi.noVerifiedData"),
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

      <GlobalStatusStrip
        compact
        status={buildGlobalStatus({
          ...coverage.evidenceCoverage,
          connectedSources: sourceConnectedCount,
          totalSources: coverage.sources.length,
        })}
      />

      <EntityArchitecturePanel
        title="Company intelligence fields"
        description="Enterprise profile architecture. Values appear only when an official source is connected — otherwise status is Missing, Planned, or Awaiting official source."
        fields={COMPANY_ARCHITECTURE_FIELDS}
      />

      <EvidenceGapPanel
        profile={evidenceGaps}
        showSummary={false}
        showSources={false}
        showMethodology={false}
      />

      {isEconomicLens ? (
        <>
          <div className="rounded-xl border border-indigo-500/25 bg-indigo-500/5 px-5 py-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-indigo-300">
              {t("entityIntelligence.investorLensTitle")}
            </p>
            <p className="mt-1 text-sm text-zinc-400">{t("entityIntelligence.investorLensBody")}</p>
          </div>
          {comparablesAndCoverage}
        </>
      ) : null}

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
        {!isEconomicLens ? comparablesAndCoverage : null}

        <CompanySourceCoverage sources={coverage.sources} />

        <EntityFutureSources domainIds={coverage.indicatorsByDomain.map((d) => d.domainId)} />

        <CompanyMethodology />

        <CompanyTrustSection pillars={profile.trustPillars} neutralityNotice={profile.neutralityNotice} />
      </EntityOptionalExploration>
    </div>
  );
}

export default CompanyIntelligencePanel;
