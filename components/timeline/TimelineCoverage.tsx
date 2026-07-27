"use client";

import type { CountryTimelineModel, TimelineYearStatus } from "@/lib/timeline";
import { timelineYearStatusClass } from "@/lib/timeline";
import { useTranslation } from "@/lib/i18n/use-translation";

type TimelineCoverageProps = {
  model: CountryTimelineModel;
};

export default function TimelineCoverage({ model }: TimelineCoverageProps) {
  const { t } = useTranslation();

  function translateYearStatus(status: TimelineYearStatus): string {
    if (status === "verified") return t("timelineUi.yearVerified");
    if (status === "partial") return t("timelineUi.yearPartial");
    if (status === "future") return t("timelineUi.yearFuture");
    return t("timelineUi.yearMissing");
  }

  function translateYearLabel(status: TimelineYearStatus): string {
    if (status === "verified") return t("timelineUi.yearLabelVerified");
    if (status === "partial") return t("timelineUi.yearLabelPartial");
    if (status === "future") return t("timelineUi.yearLabelFuture");
    return t("timelineUi.yearLabelMissing");
  }

  return (
    <section className="space-y-4" aria-labelledby="timeline-coverage-heading">
      <div>
        <h4
          id="timeline-coverage-heading"
          className="text-sm font-semibold uppercase tracking-wider text-[var(--cbai-text-muted)]"
        >
          {t("timelineUi.coverageHeading")}
        </h4>
        <p className="mt-1 text-sm text-[var(--cbai-text-muted)]">{t("timelineUi.coverageDescription")}</p>
      </div>

      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-5 lg:grid-cols-10">
        {model.yearEntries.map((entry) => (
          <li
            key={entry.year}
            className="rounded-lg border border-[var(--cbai-border-default)] bg-[var(--cbai-surface-muted)] px-3 py-3 text-center"
          >
            <p className="font-mono text-sm font-semibold text-[var(--cbai-text-primary)]">{entry.year}</p>
            <span
              className={`mt-2 inline-block rounded-md border px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider ${timelineYearStatusClass(entry.status)}`}
            >
              {translateYearStatus(entry.status)}
            </span>
            <p className="mt-2 text-[10px] leading-snug text-[var(--cbai-text-muted)]">
              {translateYearLabel(entry.status)}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
