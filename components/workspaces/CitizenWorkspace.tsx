"use client";

import { useMemo } from "react";
import { buildCitizenWorkspace } from "@/lib/workspaces/citizen";
import WorkspaceHero from "@/components/workspaces/WorkspaceHero";
import WorkspaceCoverageGrid from "@/components/workspaces/WorkspaceCoverageGrid";
import WorkspaceSourceCoverage from "@/components/workspaces/WorkspaceSourceCoverage";
import RoleProjectEntry from "@/components/workspaces/RoleProjectEntry";

export default function CitizenWorkspace() {
  const model = useMemo(() => buildCitizenWorkspace(), []);

  return (
    <div className="space-y-10">
      <WorkspaceHero
        versionLabel="Citizen Workspace"
        title={model.hero.title}
        subtitle={model.hero.subtitle}
        description={model.hero.description}
        metrics={[
          {
            label: "Citizen topics",
            value: String(model.topics.length),
          },
          {
            label: "Topics with evidence",
            value: String(
              model.topics.filter(
                (t) =>
                  t.statusLabel === "Connected" ||
                  t.statusLabel === "Available Information",
              ).length,
            ),
          },
          {
            label: "Sources connected",
            value: String(model.summary.connectedSources),
            detail: `/ ${model.summary.totalSources}`,
          },
        ]}
      />

      <RoleProjectEntry
        projectType="evidence_review"
        description="Review a real public topic against the evidence below in plain language — save what you find, in your own words, to a project you can return to."
      />

      <WorkspaceCoverageGrid
        headingId="citizen-topics"
        heading="Citizen topics"
        description="Public topics and what official evidence is connected."
        items={model.topics}
      />

      <WorkspaceCoverageGrid
        headingId="citizen-evidence-coverage"
        heading="Available evidence"
        description="Topics supporting citizen-facing public information."
        items={model.evidenceCoverage}
      />

      <WorkspaceSourceCoverage
        heading="Official Sources"
        description="Registered sources and source status."
        sources={model.sources}
        headingId="citizen-source-coverage"
      />
    </div>
  );
}
