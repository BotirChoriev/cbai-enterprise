"use client";

import { useMemo } from "react";
import { buildInvestorWorkspace } from "@/lib/workspaces/investor";
import WorkspaceHero from "@/components/workspaces/WorkspaceHero";
import WorkspaceCoverageGrid from "@/components/workspaces/WorkspaceCoverageGrid";
import WorkspaceSourceCoverage from "@/components/workspaces/WorkspaceSourceCoverage";
import WorkspaceEntityLinks from "@/components/workspaces/WorkspaceEntityLinks";
import RoleProjectEntry from "@/components/workspaces/RoleProjectEntry";
import InvestorLedger from "@/components/workspaces/InvestorLedger";

export default function InvestorWorkspace() {
  const model = useMemo(() => buildInvestorWorkspace(), []);

  return (
    <div className="space-y-10">
      <WorkspaceHero
        embedded
        versionLabel="Investor Workspace"
        title={model.hero.title}
        subtitle={model.hero.subtitle}
        description={model.hero.description}
        accentClassName="text-indigo-400"
        motif={<InvestorLedger domains={model.investmentEvidenceMap} />}
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

      <RoleProjectEntry
        projectType="investment_analysis"
        description="Track a real investment question against the macro, trade, and infrastructure evidence below — no scores or recommendations, just your own evidence, notes, and a report attached to one project."
      />

      <WorkspaceCoverageGrid
        headingId="investor-evidence-map"
        heading="Investment evidence"
        description="Macro, trade, procurement, and infrastructure topics."
        items={model.investmentEvidenceMap}
      />

      <WorkspaceEntityLinks links={model.entityLinks} />

      <WorkspaceSourceCoverage
        heading="Official sources"
        description="Official sources for investment review."
        sources={model.sources}
        headingId="investor-source-coverage"
      />

      <WorkspaceCoverageGrid
        headingId="investor-opportunity-readiness"
        heading="Opportunity status"
        description="Status by topic — information only, not recommendations."
        items={model.opportunityReadiness}
      />
    </div>
  );
}
