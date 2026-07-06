"use client";

import { useMemo } from "react";
import { buildInvestorWorkspace } from "@/lib/workspaces/investor";
import WorkspaceHero from "@/components/workspaces/WorkspaceHero";
import WorkspaceCoverageGrid from "@/components/workspaces/WorkspaceCoverageGrid";
import WorkspaceSourceCoverage from "@/components/workspaces/WorkspaceSourceCoverage";
import WorkspaceEntityLinks from "@/components/workspaces/WorkspaceEntityLinks";

export default function InvestorWorkspace() {
  const model = useMemo(() => buildInvestorWorkspace(), []);

  return (
    <div className="space-y-10">
      <WorkspaceHero
        versionLabel="Investor Workspace"
        title={model.hero.title}
        subtitle={model.hero.subtitle}
        description={model.hero.description}
        metrics={[
          {
            label: "Evidence domains",
            value: String(model.summary.domainsTracked),
          },
          {
            label: "Available information",
            value: String(model.summary.domainsWithEvidence),
          },
          {
            label: "Sources connected",
            value: String(model.summary.connectedSources),
            detail: `/ ${model.summary.totalSources}`,
          },
        ]}
      />

      <WorkspaceCoverageGrid
        headingId="investor-evidence-map"
        heading="Investment Evidence"
        description="Macro, trade, procurement, and infrastructure domains."
        items={model.investmentEvidenceMap}
      />

      <WorkspaceEntityLinks links={model.entityLinks} />

      <WorkspaceSourceCoverage
        heading="Source Coverage"
        description="Official sources for investment due diligence scoping."
        sources={model.sources}
        headingId="investor-source-coverage"
      />

      <WorkspaceCoverageGrid
        headingId="investor-opportunity-readiness"
        heading="Opportunity Readiness"
        description="Readiness labels by domain — no recommendations."
        items={model.opportunityReadiness}
      />
    </div>
  );
}
