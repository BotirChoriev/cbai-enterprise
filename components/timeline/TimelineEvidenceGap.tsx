"use client";

import type { CountryTimelineModel } from "@/lib/timeline";
import { useTranslation } from "@/lib/i18n/use-translation";

type TimelineEvidenceGapProps = {
  model: CountryTimelineModel;
};

export default function TimelineEvidenceGap({ model }: TimelineEvidenceGapProps) {
  const { t } = useTranslation();
  const gapYears = model.missingEvidenceYears;
  const futureYears = model.futureEvidenceYears;

  return (
    <section className="space-y-4" aria-labelledby="timeline-gaps-heading">
      <div>
        <h4
          id="timeline-gaps-heading"
          className="text-sm font-semibold uppercase tracking-wider text-[var(--cbai-text-muted)]"
        >
          {t("timelineUi.gapsHeading")}
        </h4>
        <p className="mt-1 text-sm text-[var(--cbai-text-muted)]">{t("timelineUi.gapsDescription")}</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-[var(--cbai-border-default)] bg-[var(--cbai-surface-muted)] px-5 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--cbai-text-muted)]">
            {t("timelineUi.missingYearsCount", { count: String(gapYears.length) })}
          </p>
          {gapYears.length === 0 ? (
            <p className="mt-3 text-sm text-[var(--cbai-text-secondary)]">{t("timelineUi.noMissingYears")}</p>
          ) : (
            <ul className="mt-3 space-y-1">
              {gapYears.map((year) => (
                <li key={year} className="font-mono text-sm text-[var(--cbai-text-secondary)]">
                  {year}: {t("timelineUi.notConnectedLabel")}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-[var(--cbai-border-default)] bg-[var(--cbai-surface-muted)] px-5 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--cbai-text-muted)]">
            {t("timelineUi.futureAvailabilityCount", { count: String(futureYears.length) })}
          </p>
          {futureYears.length === 0 ? (
            <p className="mt-3 text-sm text-[var(--cbai-text-secondary)]">{t("timelineUi.noFutureYears")}</p>
          ) : (
            <ul className="mt-3 space-y-1">
              {futureYears.map((year) => (
                <li key={year} className="font-mono text-sm text-[var(--cbai-text-secondary)]">
                  {year}: {t("timelineUi.awaitingSeries")}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
