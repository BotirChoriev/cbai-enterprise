"use client";

import { useMemo } from "react";
import { buildGovernmentWorkspace } from "@/lib/workspaces/government";
import WorkspaceHero from "@/components/workspaces/WorkspaceHero";
import WorkspaceCoverageGrid from "@/components/workspaces/WorkspaceCoverageGrid";
import WorkspaceSourceCoverage from "@/components/workspaces/WorkspaceSourceCoverage";

export default function GovernmentWorkspace() {
  const model = useMemo(() => buildGovernmentWorkspace(), []);

  return (
    <div className="space-y-10">
      <WorkspaceHero
        versionLabel={`Government Workspace`}
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
        description="Indicator domains for public institutions."
        items={model.governanceCoverage}
      />

      <WorkspaceSourceCoverage sources={model.sources} />

      <WorkspaceCoverageGrid
        headingId="government-public-services"
        heading="Public Service Areas"
        description="Citizen-facing service topics and evidence status."
        items={model.publicServiceAreas}
      />
    </div>
  );
}
