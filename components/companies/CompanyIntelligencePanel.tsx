import type { Company } from "@/lib/companies";
import type { CompanyUserJourney } from "@/lib/company-user-journey";
import CompanyCoveragePanel from "@/components/companies/CompanyCoveragePanel";
import EvidenceGapPanel from "@/components/evidence-gap/EvidenceGapPanel";
import EvidenceComparisonPanel from "@/components/evidence-comparison/EvidenceComparisonPanel";
import EntityProfileFlow from "@/components/shared/EntityProfileFlow";
import EntityProfileSection from "@/components/shared/EntityProfileSection";
import EntitySupportingDetails from "@/components/shared/EntitySupportingDetails";
import EntityDecisionPackagePreview, {
  EntityReportsAvailable,
} from "@/components/shared/EntityDecisionPackagePreview";
import IndicatorExplorerPanel from "@/components/indicator-explorer/IndicatorExplorerPanel";
import { EntityPipelineReadinessSection } from "@/components/pipeline/PipelineReadinessPanel";

type CompanyIntelligencePanelProps = {
  journey: CompanyUserJourney;
  company: Company;
};

export function CompanyIntelligencePanel({ journey, company }: CompanyIntelligencePanelProps) {
  const { profile, evidenceGaps, pipelineReadiness, evidenceComparison } = journey;
  const { registryFacts, coverage } = profile;
  const sourceConnectedCount = coverage.sources.filter(
    (s) => s.statusLabel === "Connected",
  ).length;

  return (
    <div className="space-y-8">
      <EntityProfileFlow entityName={company.name} />

      <EntityProfileSection
        id="overview"
        title="Overview"
        nextStep={{ label: "Next: Evidence →", href: "#evidence" }}
      >
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-5 sm:px-6">
          <h2 className="text-xl font-semibold tracking-tight text-zinc-50 sm:text-2xl">
            {registryFacts.name}
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            {registryFacts.icon} · {registryFacts.industry} · {registryFacts.country}
          </p>
          <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs uppercase tracking-wider text-zinc-600">Founded</dt>
              <dd className="mt-1 font-mono text-zinc-300">{registryFacts.founded}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-zinc-600">
                Available information
              </dt>
              <dd className="mt-1 text-zinc-300">{registryFacts.sourceLabel}</dd>
            </div>
          </dl>
        </div>
      </EntityProfileSection>

      <CompanyCoveragePanel
        summary={coverage.evidenceCoverage}
        sourceConnectedCount={sourceConnectedCount}
        totalSources={coverage.sources.length}
        nextStep={{ label: "Next: Missing evidence →", href: "#missing-evidence" }}
      />

      <EvidenceGapPanel
        profile={evidenceGaps}
        showSummary={false}
        showSources={false}
        showMethodology={false}
        nextStep={{ label: "Next: Decision package →", href: "#decision-package" }}
      />

      <EntityDecisionPackagePreview summary={journey.decisionSummary} />

      <EntityReportsAvailable reports={journey.reports} />

      <EntitySupportingDetails>
        <EvidenceComparisonPanel
          entityType="company"
          leftLegacyId={company.id}
          initialModel={evidenceComparison}
        />
        <EntityPipelineReadinessSection model={pipelineReadiness} />
        <IndicatorExplorerPanel variant="embedded" />
      </EntitySupportingDetails>
    </div>
  );
}

export default CompanyIntelligencePanel;
