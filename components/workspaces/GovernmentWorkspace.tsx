"use client";

import { useMemo } from "react";
import { buildGovernmentWorkspace } from "@/lib/workspaces/government";
import WorkspaceHero from "@/components/workspaces/WorkspaceHero";
import WorkspaceCoverageGrid from "@/components/workspaces/WorkspaceCoverageGrid";
import WorkspaceSourceCoverage from "@/components/workspaces/WorkspaceSourceCoverage";
import RoleProjectEntry from "@/components/workspaces/RoleProjectEntry";

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

      <RoleProjectEntry
        projectType="policy_analysis"
        description="Track a real policy question against the governance, public-services, and budget-transparency coverage below — evidence, notes, and a report all stay attached to one project you can return to."
      />

      <WorkspaceCoverageGrid
        headingId="government-governance-coverage"
        heading="Public governance"
        description="Topics for public institutions and source status."
        items={model.governanceCoverage}
      />

      <WorkspaceSourceCoverage sources={model.sources} />

      <WorkspaceCoverageGrid
        headingId="government-public-services"
        heading="Public services"
        description="Citizen-facing service topics and evidence status."
        items={model.publicServiceAreas}
      />
    </div>
  );
}
