"use client";

import { useMemo } from "react";
import { buildReasoningExplorerModel } from "@/lib/reasoning-explorer";
import ReasoningPipelineOverview from "@/components/reasoning/ReasoningPipelineOverview";
import ReasoningEvidenceIndicatorMap from "@/components/reasoning/ReasoningEvidenceIndicatorMap";
import MissionReasoningPanel from "@/components/reasoning/MissionReasoningPanel";
import OperatingPageShell from "@/components/shared/OperatingPageShell";
import { cbaiStatCell } from "@/components/brand/brand-classes";
import { useTranslation } from "@/lib/i18n/use-translation";
import { useProgressiveDisclosure } from "@/lib/hooks/use-progressive-disclosure";
import IntelligenceStatusRail from "@/components/shared/IntelligenceStatusRail";
import {
  cbaiMineralPanel,
  cbaiSectionEyebrow,
} from "@/components/brand/brand-classes";

export default function ReasoningExplorer() {
  const { t, language } = useTranslation();
  const disclosure = useProgressiveDisclosure();
  const model = useMemo(() => buildReasoningExplorerModel(), []);

  return (
    <OperatingPageShell
      title={t("navigation.reasoning")}
      showOperator={false}
      showMissionContext={false}
    >
      <section className={`${cbaiMineralPanel} space-y-4`} data-cbai-reasoning-status="">
        <div>
          <p className={cbaiSectionEyebrow}>Intelligence OS</p>
          <p className="mt-1 max-w-3xl text-sm text-[var(--cbai-text-secondary)]">
            {language === "uz"
              ? "Variantlarni dalil, qarama-qarshilik va noma’lumlar bilan taqqoslang. Yakuniy tanlovni inson qiladi."
              : "Compare options through evidence, contradictions, and unknowns. A human makes the final choice."}
          </p>
        </div>
        <IntelligenceStatusRail
          context={language === "uz" ? "Faol muammo uchun ssenariylar" : "Scenarios for the active problem"}
          evidence={`${model.summary.connectedIndicators} / ${model.summary.totalIndicators} ${
            language === "uz" ? "indikator ulangan" : "indicators connected"
          }`}
          unknown={
            model.summary.connectedSources > 0
              ? `${model.summary.connectedSources} ${language === "uz" ? "manba ulangan" : "sources connected"}`
              : language === "uz"
                ? "Tasdiqlangan manba hali ulanmagan"
                : "No verified source is connected yet"
          }
          humanBoundary={
            language === "uz"
              ? "CBAI taqqoslaydi; ssenariyni inson tanlaydi"
              : "CBAI compares; a human selects the scenario"
          }
          compact
        />
      </section>
      <MissionReasoningPanel />
      {disclosure.showReasoningStats ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className={`${cbaiStatCell} py-3`}>
            <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
              {t("reasoningPage.reviewSteps")}
            </p>
            <p className="mt-1 text-xl font-semibold text-zinc-100">{model.summary.pipelineStages}</p>
          </div>
          <div className={`${cbaiStatCell} py-3`}>
            <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
              {t("reasoningPage.topicAreas")}
            </p>
            <p className="mt-1 text-xl font-semibold text-zinc-100">{model.summary.indicatorDomains}</p>
          </div>
          <div className={`${cbaiStatCell} py-3`}>
            <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
              {t("reasoningPage.informationConnected")}
            </p>
            <p className="mt-1 text-xl font-semibold text-zinc-100">
              {model.summary.connectedIndicators}
              <span className="text-sm font-normal text-zinc-500"> / {model.summary.totalIndicators}</span>
            </p>
          </div>
          <div className={`${cbaiStatCell} py-3`}>
            <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
              {t("reasoningPage.sourcesConnected")}
            </p>
            <p className="mt-1 text-xl font-semibold text-zinc-100">{model.summary.connectedSources}</p>
          </div>
        </div>
      ) : null}

      <ReasoningPipelineOverview
        stages={model.pipeline}
        compact={!disclosure.showReasoningStats}
      />
      {disclosure.showReasoningStats ? (
        <ReasoningEvidenceIndicatorMap domains={model.domainEvidenceMap} />
      ) : null}
    </OperatingPageShell>
  );
}
