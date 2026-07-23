"use client";

import { useMemo } from "react";
import Link from "next/link";
import { buildEvidenceExplorerModel } from "@/lib/evidence-explorer";
import OperatingPageShell from "@/components/shared/OperatingPageShell";
import EvidenceSourceCoverage from "@/components/evidence/EvidenceSourceCoverage";
import EntityEvidenceCoverage from "@/components/evidence/EntityEvidenceCoverage";
import EvidenceOperatingStatus from "@/components/evidence/EvidenceOperatingStatus";
import EvidenceLifecycle from "@/components/evidence/EvidenceLifecycle";
import EvidenceTrust from "@/components/evidence/EvidenceTrust";
import EvidenceMethodology from "@/components/evidence/EvidenceMethodology";
import EvidenceIndicatorMap from "@/components/evidence/EvidenceIndicatorMap";
import EvidenceTrustSurfacePanel from "@/components/evidence/EvidenceTrustSurfacePanel";
import EvidencePrimaryStatesPanel from "@/components/evidence/EvidencePrimaryStatesPanel";
import KnowledgeBrainPanel from "@/components/knowledge/KnowledgeBrainPanel";
import KnowledgeSourceSearchPanel from "@/components/knowledge/KnowledgeSourceSearchPanel";
import { useMissionContext } from "@/components/mission/MissionContextProvider";
import { useProgressiveDisclosure } from "@/lib/hooks/use-progressive-disclosure";
import { useTranslation } from "@/lib/i18n/use-translation";

export default function EvidenceExplorer() {
  const { t } = useTranslation();
  const { mission } = useMissionContext();
  const disclosure = useProgressiveDisclosure();
  const model = useMemo(() => buildEvidenceExplorerModel(), []);

  return (
    <OperatingPageShell
      title={t("evidence.title")}
      showOperator={false}
      missionContextVariant="compact"
    >
      <EvidencePrimaryStatesPanel />
      <KnowledgeBrainPanel compact />
      <KnowledgeSourceSearchPanel />

      {disclosure.showEvidenceAdvanced ? (
        <>
          <EvidenceOperatingStatus summary={model.summary} />
          {mission ? <EvidenceTrustSurfacePanel mission={mission} variant="full" /> : null}
          <EvidenceSourceCoverage sources={model.sources} />
          <EntityEvidenceCoverage entityModules={model.entityModules} />
          <EvidenceLifecycle stages={model.lifecycleStages} />
          <EvidenceIndicatorMap indicatorsByDomain={model.indicatorsByDomain} />
          <EvidenceMethodology points={model.methodology} />
          <EvidenceTrust pillars={model.trustPillars} />
          <p className="text-xs text-zinc-500">
            Device-local evidence lifecycle workspace (planned drafts, no fabricated live sources):{" "}
            <Link href="/evidence/workspace" className="text-teal-400 hover:text-teal-300">
              /evidence/workspace
            </Link>
          </p>
        </>
      ) : null}
    </OperatingPageShell>
  );
}
