"use client";

import { useMemo } from "react";
import { buildInvestorWorkspace } from "@/lib/workspaces/investor";
import WorkspaceHero from "@/components/workspaces/WorkspaceHero";
import WorkspaceCoverageGrid from "@/components/workspaces/WorkspaceCoverageGrid";
import WorkspaceSourceCoverage from "@/components/workspaces/WorkspaceSourceCoverage";
import WorkspaceEntityLinks from "@/components/workspaces/WorkspaceEntityLinks";
import WorkspaceMethodology from "@/components/workspaces/WorkspaceMethodology";
import WorkspacePersonas from "@/components/workspaces/WorkspacePersonas";
import WorkspaceTrust from "@/components/workspaces/WorkspaceTrust";

export default function InvestorWorkspace() {
  const model = useMemo(() => buildInvestorWorkspace(), []);

  return (
    <div className="space-y-10">
      <WorkspaceHero
        versionLabel={`CBAI Investor Workspace v${model.workspaceVersion}`}
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
        heading="Investment Evidence Map"
        description="Macro, trade, procurement, and infrastructure domains — readiness only."
        items={model.investmentEvidenceMap}
      />

      <WorkspaceEntityLinks links={model.entityLinks} />

      <WorkspaceSourceCoverage
        heading="Source Coverage"
        description="Key official sources for investment due diligence scoping — status only."
        sources={model.sources}
        headingId="investor-source-coverage"
      />

      <WorkspaceCoverageGrid
        headingId="investor-opportunity-readiness"
        heading="Opportunity Readiness"
        description="Readiness labels only — no investment recommendations or opportunity scores."
        items={model.opportunityReadiness}
      />

      <WorkspaceMethodology points={model.methodology} />
      <WorkspacePersonas personas={model.personas} />
      <WorkspaceTrust pillars={model.trustPillars} />

      <footer className="border-t border-zinc-800 pt-6 text-xs text-zinc-600">
        Global Indicator Framework v{model.frameworkVersion} · Evidence Infrastructure v
        {model.infrastructureVersion} · Governance v{model.governanceVersion}
      </footer>
    </div>
  );
}
