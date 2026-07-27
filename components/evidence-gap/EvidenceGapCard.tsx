"use client";

import type { EvidenceGapRecord } from "@/lib/evidence-gap";
import { gapStatusClass } from "@/lib/evidence-gap";
import { missingReasonKey, gapNextStepKey, gapStatusKey } from "@/components/shared/plain-gap-copy";
import { useTranslation } from "@/lib/i18n/use-translation";

type EvidenceGapCardProps = {
  gap: EvidenceGapRecord;
};

export default function EvidenceGapCard({ gap }: EvidenceGapCardProps) {
  const { t } = useTranslation();
  const reasonKey = missingReasonKey(gap.missingReason);
  const nextStep = gapNextStepKey(gap);

  return (
    <article className="rounded-lg bg-zinc-900/50 px-4 py-3">
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-sm font-medium text-zinc-200">{gap.indicatorTitle}</h4>
        <span
          className={`shrink-0 rounded px-2 py-0.5 text-[10px] font-medium uppercase ${gapStatusClass(gap.currentStatus)}`}
        >
          {t(gapStatusKey(gap.currentStatus))}
        </span>
      </div>

      <dl className="mt-3 space-y-2 text-sm">
        {reasonKey ? (
          <div>
            <dt className="text-xs text-zinc-600">{t("entityIntelligence.gapWhyMissing")}</dt>
            <dd className="mt-0.5 text-zinc-400">{t(reasonKey)}</dd>
          </div>
        ) : null}
        <div>
          <dt className="text-xs text-zinc-600">{t("entityIntelligence.gapExpectedSource")}</dt>
          <dd className="mt-0.5 text-zinc-400">{gap.expectedSource}</dd>
        </div>
        <div>
          <dt className="text-xs text-zinc-600">{t("entityIntelligence.gapNextStep")}</dt>
          <dd className="mt-0.5 text-xs text-zinc-500">
            {nextStep.source ? t(nextStep.key, { source: nextStep.source }) : t(nextStep.key)}
          </dd>
        </div>
      </dl>
    </article>
  );
}
