"use client";

import { useTranslation } from "@/lib/i18n/use-translation";
import {
  cbaiMineralPanelMd,
  cbaiSectionEyebrow,
  cbaiStatCell,
  cbaiTextCaption,
  cbaiTextMuted,
} from "@/components/brand/brand-classes";

type HumanDecisionBoundaryProps = {
  variant?: "full" | "compact";
};

export default function HumanDecisionBoundary({ variant = "full" }: HumanDecisionBoundaryProps) {
  const { t } = useTranslation();

  if (variant === "compact") {
    return (
      <section
        className="rounded-lg border border-[var(--gold)]/15 bg-[var(--gold)]/5 px-3 py-2"
        aria-label={t("missionCenter.humanDecisionBoundary")}
      >
        <p className="text-[10px] uppercase tracking-wider text-[var(--gold-soft)]">
          {t("missionCenter.humanDecisionBoundary")}
        </p>
        <p className={`mt-1 ${cbaiTextCaption}`}>{t("missionCenter.boundaryCompactNote")}</p>
      </section>
    );
  }

  return (
    <section className={cbaiMineralPanelMd} aria-labelledby="human-decision-boundary-heading">
      <p className={cbaiSectionEyebrow}>{t("missionCenter.humanDecisionBoundary")}</p>
      <h2 id="human-decision-boundary-heading" className="sr-only">
        {t("missionCenter.humanDecisionBoundary")}
      </h2>
      <dl className="grid gap-2 sm:grid-cols-2">
        <div className={`${cbaiStatCell} border-emerald-500/15 bg-emerald-500/5`}>
          <dt className="text-[10px] uppercase tracking-wider text-emerald-400/90">{t("missionCenter.systemKnows")}</dt>
          <dd className={`mt-1 ${cbaiTextCaption}`}>{t("missionCenter.boundaryKnowsBody")}</dd>
        </div>
        <div className={`${cbaiStatCell} border-teal-500/15 bg-teal-500/5`}>
          <dt className="text-[10px] uppercase tracking-wider text-teal-400/90">{t("missionCenter.systemInfers")}</dt>
          <dd className={`mt-1 ${cbaiTextCaption}`}>{t("missionCenter.boundaryInfersBody")}</dd>
        </div>
        <div className={cbaiStatCell}>
          <dt className="text-[10px] uppercase tracking-wider text-zinc-500">{t("missionCenter.systemUnknown")}</dt>
          <dd className={`mt-1 ${cbaiTextMuted}`}>{t("missionCenter.boundaryUnknownBody")}</dd>
        </div>
        <div className={`${cbaiStatCell} border-[var(--gold)]/20 bg-[var(--gold)]/5`}>
          <dt className="text-[10px] uppercase tracking-wider text-[var(--gold-soft)]">{t("missionCenter.humanJudgment")}</dt>
          <dd className={`mt-1 ${cbaiTextCaption}`}>{t("missionCenter.boundaryJudgmentBody")}</dd>
        </div>
      </dl>
    </section>
  );
}
