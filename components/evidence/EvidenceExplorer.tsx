"use client";

import { Suspense, useMemo, useSyncExternalStore } from "react";
import Link from "next/link";
import { buildEvidenceExplorerModel } from "@/lib/evidence-explorer";
import EvidenceSourceCoverage from "@/components/evidence/EvidenceSourceCoverage";
import EntityEvidenceCoverage from "@/components/evidence/EntityEvidenceCoverage";
import EvidenceOperatingStatus from "@/components/evidence/EvidenceOperatingStatus";
import EvidenceLifecycle from "@/components/evidence/EvidenceLifecycle";
import EvidenceTrust from "@/components/evidence/EvidenceTrust";
import EvidenceMethodology from "@/components/evidence/EvidenceMethodology";
import EvidenceIndicatorMap from "@/components/evidence/EvidenceIndicatorMap";
import EvidenceTrustSurfacePanel from "@/components/evidence/EvidenceTrustSurfacePanel";
import EngineRouteEntryStrip from "@/components/forward-deployed/EngineRouteEntryStrip";
import EvidencePrimaryStatesPanel from "@/components/evidence/EvidencePrimaryStatesPanel";
import KnowledgeBrainPanel from "@/components/knowledge/KnowledgeBrainPanel";
import KnowledgeSourceSearchPanel from "@/components/knowledge/KnowledgeSourceSearchPanel";
import EvidenceCreationComposer from "@/components/evidence/EvidenceCreationComposer";
import ScientificDeliberationHome from "@/components/evidence/ScientificDeliberationHome";
import EvidencePassportPanel from "@/components/evidence-to-action/EvidencePassportPanel";
import IntelligencePageFrame from "@/components/shared/IntelligencePageFrame";
import ExpertDetailDisclosure from "@/components/shared/ExpertDetailDisclosure";
import EntityOptionalExploration from "@/components/shared/EntityOptionalExploration";
import { useMissionContext } from "@/components/mission/MissionContextProvider";
import { useProgressiveDisclosure } from "@/lib/hooks/use-progressive-disclosure";
import { useTranslation } from "@/lib/i18n/use-translation";
import { getSdnCopy } from "@/lib/i18n/platform-copy-scientific-deliberation";
import {
  getEmptyLocalEvidenceSnapshot,
  getLocalEvidenceSnapshot,
  subscribeLocalEvidence,
} from "@/lib/evidence/local-evidence-store";
import { cbaiBtnPrimary, cbaiFocusRing } from "@/components/brand/brand-classes";

export default function EvidenceExplorer() {
  const { t, language } = useTranslation();
  const copy = getSdnCopy(language);
  const { mission } = useMissionContext();
  const disclosure = useProgressiveDisclosure();
  const model = useMemo(() => buildEvidenceExplorerModel(), []);
  const localRecords = useSyncExternalStore(
    subscribeLocalEvidence,
    getLocalEvidenceSnapshot,
    getEmptyLocalEvidenceSnapshot,
  );
  const confirmedCount = localRecords.filter((r) => r.confirmed).length;

  return (
    <IntelligencePageFrame
      title={copy.title}
      purpose={copy.oneSentence}
      contextLabel={mission?.problem ? mission.problem : t("operationalObject.evidencePageContext")}
      nextStep={copy.primaryAction}
      evidenceStatus={copy.honestyBanner}
      knownUnknown={copy.unknown}
      confirmationBoundary={copy.voiceClearance}
      showOperator={false}
      primaryAction={
        <Link
          href="/evidence?view=create"
          className={`${cbaiBtnPrimary} ${cbaiFocusRing} inline-flex min-h-11 items-center px-4`}
          data-cbai-primary-action=""
        >
          {copy.primaryAction}
        </Link>
      }
    >
      <div className="mt-4 space-y-6">
        <Suspense fallback={<p className="text-sm text-[var(--cbai-text-muted)]">{copy.title}…</p>}>
          <ScientificDeliberationHome />
        </Suspense>

        <EvidencePassportPanel />

        <EntityOptionalExploration>
          <EngineRouteEntryStrip />
          <EvidencePrimaryStatesPanel />
          {confirmedCount > 0 ? (
            <ul className="space-y-2" data-cbai-local-evidence-list="">
              {localRecords
                .filter((r) => r.confirmed)
                .slice(0, 8)
                .map((record) => (
                  <li
                    key={record.id}
                    className="rounded-md border border-[var(--cbai-border-default)] px-3 py-2 text-sm text-[var(--cbai-text-primary)]"
                  >
                    <span className="font-medium">{record.title}</span>
                    <span className="ml-2 text-xs text-[var(--cbai-text-muted)]">{record.reviewStatus}</span>
                    <span className="mt-1 block text-xs text-[var(--cbai-text-secondary)]">{record.sourceLabel}</span>
                  </li>
                ))}
            </ul>
          ) : null}
          <details className="rounded-lg border border-[var(--cbai-border)] p-3">
            <summary className={`${cbaiFocusRing} cursor-pointer text-sm font-medium`}>{copy.legacyEvidence}</summary>
            <div className="mt-3 space-y-4">
              <EvidenceCreationComposer />
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
                </>
              ) : (
                <ExpertDetailDisclosure>
                  <EvidenceOperatingStatus summary={model.summary} />
                  <EvidenceSourceCoverage sources={model.sources} />
                  <EvidenceMethodology points={model.methodology} />
                  <EvidenceTrust pillars={model.trustPillars} />
                </ExpertDetailDisclosure>
              )}
            </div>
          </details>
        </EntityOptionalExploration>
      </div>
    </IntelligencePageFrame>
  );
}
