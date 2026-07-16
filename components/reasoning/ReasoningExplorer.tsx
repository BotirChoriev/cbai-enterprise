"use client";

import Link from "next/link";
import { useMemo } from "react";
import { buildReasoningExplorerModel } from "@/lib/reasoning-explorer";
import ReasoningPipelineOverview from "@/components/reasoning/ReasoningPipelineOverview";
import ReasoningEvidenceIndicatorMap from "@/components/reasoning/ReasoningEvidenceIndicatorMap";
import OperatingPageShell from "@/components/shared/OperatingPageShell";
import { useTranslation } from "@/lib/i18n/use-translation";
import { useMissionContext } from "@/components/mission/MissionContextProvider";
import { useProgressiveDisclosure } from "@/lib/hooks/use-progressive-disclosure";
import { cbaiBtnPrimary, cbaiMineralSurface } from "@/components/brand/brand-classes";

export default function ReasoningExplorer() {
  const { t } = useTranslation();
  const { mission } = useMissionContext();
  const disclosure = useProgressiveDisclosure();
  const model = useMemo(() => buildReasoningExplorerModel(), []);
  const projectQuery = mission?.projectId ? `?project=${mission.projectId}` : "";
  const primaryHref = mission?.projectId
    ? `/my-work${projectQuery}#project-notes`
    : mission
      ? "/my-work"
      : "/?create=1";

  return (
    <OperatingPageShell
      title={t("navigation.reasoning")}
      description={t("zeroLearningCurve.reasoningPurpose")}
      missionContextVariant="full"
    >
      {!mission ? (
        <section className={`${cbaiMineralSurface} space-y-2 p-4`} role="status">
          <p className="text-sm text-zinc-400">{t("zeroLearningCurve.reasoningNoMission")}</p>
          <Link href="/?create=1" className="text-xs text-teal-400 hover:text-teal-300">
            {t("zeroLearningCurve.startMission")} →
          </Link>
        </section>
      ) : (
        <div className="flex flex-wrap items-center gap-3">
          <Link href={primaryHref} className={`${cbaiBtnPrimary} text-xs`}>
            {t("zeroLearningCurve.reasoningOpenNotes")} →
          </Link>
        </div>
      )}

      {disclosure.showReasoningStats ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3">
            <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
              {t("reasoningPage.reviewSteps")}
            </p>
            <p className="mt-1 text-xl font-semibold text-zinc-100">{model.summary.pipelineStages}</p>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3">
            <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
              {t("reasoningPage.topicAreas")}
            </p>
            <p className="mt-1 text-xl font-semibold text-zinc-100">{model.summary.indicatorDomains}</p>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3">
            <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
              {t("reasoningPage.informationConnected")}
            </p>
            <p className="mt-1 text-xl font-semibold text-zinc-100">
              {model.summary.connectedIndicators}
              <span className="text-sm font-normal text-zinc-500"> / {model.summary.totalIndicators}</span>
            </p>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3">
            <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
              {t("reasoningPage.sourcesConnected")}
            </p>
            <p className="mt-1 text-xl font-semibold text-zinc-100">{model.summary.connectedSources}</p>
          </div>
        </div>
      ) : null}

      <ReasoningPipelineOverview stages={model.pipeline} />
      {disclosure.showReasoningStats ? (
        <ReasoningEvidenceIndicatorMap domains={model.domainEvidenceMap} />
      ) : null}
    </OperatingPageShell>
  );
}
