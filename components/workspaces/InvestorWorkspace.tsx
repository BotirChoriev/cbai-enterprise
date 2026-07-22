"use client";

import { useMemo } from "react";
import { useTranslation } from "@/lib/i18n/use-translation";
import { getDictionary } from "@/lib/i18n/translate";
import { translateInvestorWorkspace } from "@/lib/i18n/investor-translation";
import { buildInvestorWorkspace } from "@/lib/workspaces/investor";
import WorkspaceHero from "@/components/workspaces/WorkspaceHero";
import WorkspaceCoverageGrid from "@/components/workspaces/WorkspaceCoverageGrid";
import WorkspaceSourceCoverage from "@/components/workspaces/WorkspaceSourceCoverage";
import WorkspaceEntityLinks from "@/components/workspaces/WorkspaceEntityLinks";
import RoleProjectEntry from "@/components/workspaces/RoleProjectEntry";
import InvestorLedger from "@/components/workspaces/InvestorLedger";

export default function InvestorWorkspace() {
  const { language } = useTranslation();
  const model = useMemo(() => {
    const base = buildInvestorWorkspace();
    return translateInvestorWorkspace(getDictionary(language), base);
  }, [language]);
  const copy = getDictionary(language).investorWorkspace;

  return (
    <div className="space-y-10">
      <WorkspaceHero
        embedded
        versionLabel={copy.versionLabel}
        title={model.hero.title}
        subtitle={model.hero.subtitle}
        description={model.hero.description}
        accentClassName="text-indigo-400"
        motif={<InvestorLedger domains={model.investmentEvidenceMap} />}
        metrics={[
          {
            label: copy.metricEvidenceDomains,
            value: String(model.summary.domainsTracked),
          },
          {
            label: copy.metricAvailableInformation,
            value: String(model.summary.domainsWithEvidence),
          },
          {
            label: copy.metricSourcesConnected,
            value: String(model.summary.connectedSources),
            detail: `/ ${model.summary.totalSources}`,
          },
        ]}
      />

      <RoleProjectEntry projectType="investment_analysis" description={copy.projectEntryDescription} />

      <WorkspaceCoverageGrid
        headingId="investor-evidence-map"
        heading={copy.sectionInvestmentEvidenceHeading}
        description={copy.sectionInvestmentEvidenceDescription}
        items={model.investmentEvidenceMap}
      />

      <WorkspaceEntityLinks links={model.entityLinks} />

      <WorkspaceSourceCoverage
        heading={copy.sectionOfficialSourcesHeading}
        description={copy.sectionOfficialSourcesDescription}
        sources={model.sources}
        headingId="investor-source-coverage"
      />

      <WorkspaceCoverageGrid
        headingId="investor-opportunity-readiness"
        heading={copy.sectionOpportunityStatusHeading}
        description={copy.sectionOpportunityStatusDescription}
        items={model.opportunityReadiness}
      />
    </div>
  );
}
