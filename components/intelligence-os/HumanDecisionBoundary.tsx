"use client";

import { useTranslation } from "@/lib/i18n/use-translation";
import { cbaiMineralSurface, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

type HumanDecisionBoundaryProps = {
  variant?: "full" | "compact";
};

export default function HumanDecisionBoundary({ variant = "full" }: HumanDecisionBoundaryProps) {
  const { t } = useTranslation();

  if (variant === "compact") {
    return (
      <section
        className="rounded-md border border-[var(--gold)]/15 bg-[var(--gold)]/5 px-3 py-2"
        aria-label={t("missionCenter.humanDecisionBoundary")}
      >
        <p className="text-[10px] uppercase tracking-wider text-[var(--gold-soft)]">
          {t("missionCenter.humanDecisionBoundary")}
        </p>
        <p className="mt-1 text-xs text-zinc-400">
          {t("missionCenter.humanJudgment")} — suggested routes never replace your conclusions.
        </p>
      </section>
    );
  }

  return (
    <section className={`${cbaiMineralSurface} space-y-3 p-5`} aria-labelledby="human-decision-boundary-heading">
      <p className={cbaiSectionEyebrow}>{t("missionCenter.humanDecisionBoundary")}</p>
      <h2 id="human-decision-boundary-heading" className="sr-only">
        {t("missionCenter.humanDecisionBoundary")}
      </h2>
      <dl className="grid gap-2 sm:grid-cols-2">
        <div className="rounded-lg border border-emerald-500/15 bg-emerald-500/5 px-3 py-2">
          <dt className="text-[10px] uppercase tracking-wider text-emerald-400/90">{t("missionCenter.systemKnows")}</dt>
          <dd className="mt-1 text-xs text-zinc-400">Local projects, evidence refs, and catalog entities you linked.</dd>
        </div>
        <div className="rounded-lg border border-teal-500/15 bg-teal-500/5 px-3 py-2">
          <dt className="text-[10px] uppercase tracking-wider text-teal-400/90">{t("missionCenter.systemInfers")}</dt>
          <dd className="mt-1 text-xs text-zinc-400">Suggested routes from demonstrated capability — never conclusions.</dd>
        </div>
        <div className="rounded-lg border border-zinc-700/60 bg-zinc-900/40 px-3 py-2">
          <dt className="text-[10px] uppercase tracking-wider text-zinc-500">{t("missionCenter.systemUnknown")}</dt>
          <dd className="mt-1 text-xs text-zinc-500">Live APIs, external researchers, and unlinked evidence gaps.</dd>
        </div>
        <div className="rounded-lg border border-[var(--gold)]/20 bg-[var(--gold)]/5 px-3 py-2">
          <dt className="text-[10px] uppercase tracking-wider text-[var(--gold-soft)]">{t("missionCenter.humanJudgment")}</dt>
          <dd className="mt-1 text-xs text-zinc-400">All scientific claims, reports, and decisions remain yours.</dd>
        </div>
      </dl>
    </section>
  );
}
