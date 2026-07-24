"use client";

import { useMemo } from "react";
import { useTranslation } from "@/lib/i18n/use-translation";
import { getDictionary } from "@/lib/i18n/translate";
import { translateGovernmentWorkspace } from "@/lib/i18n/government-translation";
import { buildGovernmentWorkspace } from "@/lib/workspaces/government";
import WorkspaceHero from "@/components/workspaces/WorkspaceHero";
import WorkspaceCoverageGrid from "@/components/workspaces/WorkspaceCoverageGrid";
import WorkspaceSourceCoverage from "@/components/workspaces/WorkspaceSourceCoverage";
import RoleProjectEntry from "@/components/workspaces/RoleProjectEntry";
import GovernmentGrid from "@/components/workspaces/GovernmentGrid";

export default function GovernmentWorkspace() {
  const { language } = useTranslation();
  const model = useMemo(() => {
    const base = buildGovernmentWorkspace();
    return translateGovernmentWorkspace(getDictionary(language), base);
  }, [language]);
  const copy = getDictionary(language).governmentWorkspace;

  return (
    <div className="space-y-10">
      <WorkspaceHero
        embedded
        versionLabel={copy.versionLabel}
        title={model.hero.title}
        subtitle={model.hero.subtitle}
        description={model.hero.description}
        accentClassName="text-teal-400"
        motif={<GovernmentGrid domains={model.governanceCoverage} />}
        metrics={[
          {
            label: copy.metricDomainsTracked,
            value: String(model.summary.domainsTracked),
          },
          {
            label: copy.metricDomainsWithEvidence,
            value: String(model.summary.domainsWithEvidence),
          },
          {
            label: copy.metricSourcesConnected,
            value: String(model.summary.connectedSources),
            detail: `/ ${model.summary.totalSources}`,
          },
        ]}
      />

      <RoleProjectEntry projectType="policy_analysis" description={copy.projectEntryDescription} />

      <WorkspaceCoverageGrid
        headingId="government-governance-coverage"
        heading={copy.sectionGovernanceHeading}
        description={copy.sectionGovernanceDescription}
        items={model.governanceCoverage}
      />

      <WorkspaceSourceCoverage sources={model.sources} />

      <WorkspaceCoverageGrid
        headingId="government-public-services"
        heading={copy.sectionPublicServicesHeading}
        description={copy.sectionPublicServicesDescription}
        items={model.publicServiceAreas}
      />
    </div>
  );
}
