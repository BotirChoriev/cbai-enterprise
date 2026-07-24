"use client";

import type { IndicatorExplorerRecord } from "@/lib/indicator-explorer";
import { coverageStatusLabel } from "@/lib/indicator-explorer";
import { useTranslation } from "@/lib/i18n/use-translation";

type IndicatorCoverageProps = {
  record: IndicatorExplorerRecord;
};

export default function IndicatorCoverage({ record }: IndicatorCoverageProps) {
  const { t } = useTranslation();
  const connectedSources = record.officialSources.filter(
    (s) => s.connectionStatus === "connected",
  ).length;

  return (
    <section className="space-y-4" aria-labelledby="indicator-coverage-heading">
      <div>
        <h4
          id="indicator-coverage-heading"
          className="text-sm font-semibold uppercase tracking-wider text-[var(--cbai-text-muted)]"
        >
          {t("indicatorExplorer.coverageHeading")}
        </h4>
        <p className="mt-1 text-sm text-[var(--cbai-text-secondary)]">{t("indicatorExplorer.coverageLead")}</p>
      </div>

      <div className="rounded-xl border border-[var(--cbai-border-subtle)] bg-[var(--cbai-surface-muted)] px-5 py-4">
        <dl className="grid gap-3 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-xs uppercase tracking-wider text-[var(--cbai-text-muted)]">
              {t("indicatorExplorer.coverageStatus")}
            </dt>
            <dd className="mt-1 text-[var(--cbai-text-primary)]">{coverageStatusLabel(record.coverageStatus)}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-[var(--cbai-text-muted)]">
              {t("indicatorExplorer.connectedSources")}
            </dt>
            <dd className="mt-1 font-mono text-[var(--cbai-text-primary)]">
              {connectedSources} / {record.officialSources.length}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-[var(--cbai-text-muted)]">
              {t("indicatorExplorer.plannedConnectors")}
            </dt>
            <dd className="mt-1 font-mono text-[var(--cbai-text-primary)]">{record.plannedConnectors.length}</dd>
          </div>
        </dl>
      </div>

      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-5 py-4">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-400/80">
          {t("indicatorExplorer.humanReviewRequired")}
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-[var(--cbai-text-secondary)]">
          {record.limitations.map((limitation) => (
            <li key={limitation}>{limitation}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
