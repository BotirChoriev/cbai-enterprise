"use client";

import { useMemo } from "react";
import { buildGovernmentWorkspace } from "@/lib/workspaces/government";
import WorkspaceHero from "@/components/workspaces/WorkspaceHero";
import WorkspaceCoverageGrid from "@/components/workspaces/WorkspaceCoverageGrid";
import WorkspaceSourceCoverage from "@/components/workspaces/WorkspaceSourceCoverage";
import WorkspaceMethodology from "@/components/workspaces/WorkspaceMethodology";
import WorkspacePersonas from "@/components/workspaces/WorkspacePersonas";
import WorkspaceTrust from "@/components/workspaces/WorkspaceTrust";

export default function GovernmentWorkspace() {
  const model = useMemo(() => buildGovernmentWorkspace(), []);

  return (
    <div className="space-y-10">
      <WorkspaceHero
        versionLabel={`CBAI Government Workspace v${model.workspaceVersion}`}
        title={model.hero.title}
        subtitle={model.hero.subtitle}
        description={model.hero.description}
        metrics={[
          {
            label: "Domains tracked",
            value: String(model.summary.domainsTracked),
          },
          {
            label: "Domains with evidence",
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
        headingId="government-governance-coverage"
        heading="Governance Coverage"
        description="Indicator Framework domains for public institutions — evidence status only."
        items={model.governanceCoverage}
      />

      <WorkspaceSourceCoverage sources={model.sources} />

      <WorkspaceCoverageGrid
        headingId="government-public-services"
        heading="Public Service Areas"
        description="Citizen-facing service topics — status labels only, no performance claims."
        items={model.publicServiceAreas}
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
