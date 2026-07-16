"use client";

import type { ReasoningPipelineStage } from "@/lib/reasoning-explorer";
import { useTranslation } from "@/lib/i18n/use-translation";

type ReasoningPipelineOverviewProps = {
  stages: readonly ReasoningPipelineStage[];
  compact?: boolean;
};

export default function ReasoningPipelineOverview({
  stages,
  compact = false,
}: ReasoningPipelineOverviewProps) {
  const { t } = useTranslation();
  const visibleStages = compact ? stages.slice(0, 3) : stages;

  return (
    <section className="space-y-4" aria-labelledby="reasoning-pipeline-heading">
      <div>
        <h2 id="reasoning-pipeline-heading" className="text-sm font-semibold text-zinc-200">
          {t("zeroLearningCurve.reasoningPipelineTitle")}
        </h2>
        {!compact ? (
          <p className="mt-1 text-sm text-zinc-500">{t("zeroLearningCurve.reasoningPipelineLead")}</p>
        ) : null}
      </div>

      <ol className="relative space-y-0">
        {visibleStages.map((stage, index) => (
          <li key={stage.id} className="relative flex gap-4 pb-6 last:pb-0 sm:gap-6">
            {index < visibleStages.length - 1 ? (
              <span
                aria-hidden="true"
                className="absolute left-[11px] top-6 h-full w-px bg-zinc-800 sm:left-[15px]"
              />
            ) : null}
            <span className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-teal-500/30 bg-teal-500/10 text-[10px] font-semibold text-teal-400 sm:h-8 sm:w-8 sm:text-xs">
              {index + 1}
            </span>
            <div className="min-w-0 flex-1 rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 sm:px-5 sm:py-4">
              <p className="text-sm font-semibold text-zinc-100">{stage.title}</p>
              {!compact ? (
                <>
                  <p className="mt-1 text-sm text-zinc-400">{stage.description}</p>
                  <p className="mt-2 text-xs text-zinc-500">{stage.userFacingOutput}</p>
                </>
              ) : null}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
