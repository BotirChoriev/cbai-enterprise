"use client";

import { useMemo } from "react";
import { buildCitizenWorkspace } from "@/lib/workspaces/citizen";
import WorkspaceHero from "@/components/workspaces/WorkspaceHero";
import WorkspaceCoverageGrid from "@/components/workspaces/WorkspaceCoverageGrid";
import WorkspaceSourceCoverage from "@/components/workspaces/WorkspaceSourceCoverage";
import WorkspaceFeedbackNotice from "@/components/workspaces/WorkspaceFeedbackNotice";
import WorkspaceMethodology from "@/components/workspaces/WorkspaceMethodology";
import WorkspacePersonas from "@/components/workspaces/WorkspacePersonas";
import WorkspaceTrust from "@/components/workspaces/WorkspaceTrust";

export default function CitizenWorkspace() {
  const model = useMemo(() => buildCitizenWorkspace(), []);

  return (
    <div className="space-y-10">
      <WorkspaceHero
        versionLabel={`CBAI Citizen Workspace v${model.workspaceVersion}`}
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

      <WorkspaceCoverageGrid
        headingId="citizen-topics"
        heading="Citizen Topics"
        description="Public topics in plain language — what official evidence is connected or missing."
        items={model.topics}
      />

      <WorkspaceFeedbackNotice notice={model.feedbackNotice} />

      <WorkspaceCoverageGrid
        headingId="citizen-evidence-coverage"
        heading="Evidence Coverage"
        description="Indicator domains supporting citizen-facing public information."
        items={model.evidenceCoverage}
      />

      <WorkspaceSourceCoverage
        heading="Official Sources"
        description="Registered sources and honest connection status."
        sources={model.sources}
        headingId="citizen-source-coverage"
      />

      <WorkspaceMethodology
        points={model.methodology}
        heading="Methodology"
        description="How CBAI presents public information without judging institutions."
      />
      <WorkspacePersonas
        personas={model.personas}
        question="What can I learn here?"
      />
      <WorkspaceTrust pillars={model.trustPillars} />

      <footer className="border-t border-zinc-800 pt-6 text-xs text-zinc-600">
        Global Indicator Framework v{model.frameworkVersion} · Evidence Infrastructure v
        {model.infrastructureVersion} · Governance v{model.governanceVersion}
      </footer>
    </div>
  );
}
