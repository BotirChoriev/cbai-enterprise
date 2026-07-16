"use client";

import StatusBadge from "@/components/shared/StatusBadge";
import { resolveEntityDataStatus } from "@/components/shared/entity-profile-copy";
import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";
import { useTranslation } from "@/lib/i18n/use-translation";

type IntelligenceContextPanelProps = {
  relatedEntityCount: number;
  evidenceConnectedCount: number;
  evidenceTotalCount: number;
  reportsCount: number;
  openQuestionsCount: number;
};

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-zinc-800/80 bg-slate-950/50 px-3 py-2">
      <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">{label}</p>
      <p className="mt-0.5 font-mono text-lg text-zinc-100">{value}</p>
    </div>
  );
}

export default function IntelligenceContextPanel({
  relatedEntityCount,
  evidenceConnectedCount,
  evidenceTotalCount,
  reportsCount,
  openQuestionsCount,
}: IntelligenceContextPanelProps) {
  const { t } = useTranslation();
  const status = resolveEntityDataStatus(evidenceConnectedCount, evidenceTotalCount);

  return (
    <section aria-labelledby="intelligence-context-heading" className={`${cbaiGlassCard} space-y-3 p-4`}>
      <div className="flex items-center justify-between gap-3">
        <p className={cbaiSectionEyebrow} id="intelligence-context-heading">
          {t("entityIntelligence.intelligenceContext")}
        </p>
        <StatusBadge status={status} />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Stat label={t("entityIntelligence.relatedEntities")} value={relatedEntityCount} />
        <Stat label={t("entityIntelligence.reports")} value={reportsCount} />
        <Stat label={t("entityIntelligence.openQuestions")} value={openQuestionsCount} />
      </div>
    </section>
  );
}
