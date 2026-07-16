"use client";

import Link from "next/link";
import { useMemo } from "react";
import { buildReasoningExplorerModel } from "@/lib/reasoning-explorer";
import ReasoningPipelineOverview from "@/components/reasoning/ReasoningPipelineOverview";
import ReasoningEvidenceIndicatorMap from "@/components/reasoning/ReasoningEvidenceIndicatorMap";
import OperatingPageShell from "@/components/shared/OperatingPageShell";
import { useTranslation } from "@/lib/i18n/use-translation";
import { useProgressiveDisclosure } from "@/lib/hooks/use-progressive-disclosure";
import { cbaiBtnPrimary } from "@/components/brand/brand-classes";

/** One thought: Think — pipeline first, stats progressive. */
export default function ReasoningExplorer() {
  const { t } = useTranslation();
  const disclosure = useProgressiveDisclosure();
  const model = useMemo(() => buildReasoningExplorerModel(), []);

  return (
    <OperatingPageShell
      title={t("navigation.reasoning")}
      description={t("zeroLearningCurve.reasoningPurpose")}
      missionContextVariant="full"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/reasoning" className={`${cbaiBtnPrimary} text-xs`}>
          {t("zeroLearningCurve.nextAction")}: {t("reasoningPage.reviewSteps")} →
        </Link>
      </div>

      {disclosure.showReasoningStats ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3">
            <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
              {t("reasoningPage.reviewSteps")}
            </p>
            <p className="mt-1 text-xl font-semibold text-zinc-100">
              {model.summary.pipelineStages}
            </p>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3">
            <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
              {t("reasoningPage.topicAreas")}
            </p>
            <p className="mt-1 text-xl font-semibold text-zinc-100">
              {model.summary.indicatorDomains}
            </p>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3">
            <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
              {t("reasoningPage.informationConnected")}
            </p>
            <p className="mt-1 text-xl font-semibold text-zinc-100">
              {model.summary.connectedIndicators}
              <span className="text-sm font-normal text-zinc-500">
                {" "}
                / {model.summary.totalIndicators}
              </span>
            </p>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3">
            <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
              {t("reasoningPage.sourcesConnected")}
            </p>
            <p className="mt-1 text-xl font-semibold text-zinc-100">
              {model.summary.connectedSources}
            </p>
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
