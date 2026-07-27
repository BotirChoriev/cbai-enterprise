"use client";

import type { CountryTimelineModel } from "@/lib/timeline";
import { coverageStatusClass } from "@/lib/countries.coverage";
import { useTranslation } from "@/lib/i18n/use-translation";

type TimelineSourcesProps = {
  model: CountryTimelineModel;
};

export default function TimelineSources({ model }: TimelineSourcesProps) {
  const { t } = useTranslation();

  function mapConnectionToLabel(status: "connected" | "planned" | "deprecated"): string {
    if (status === "connected") return t("timelineUi.statusConnected");
    if (status === "planned") return t("timelineUi.statusPlanned");
    return t("timelineUi.statusNotConnected");
  }

  function coverageClassKey(status: "connected" | "planned" | "deprecated"): "Connected" | "Planned" | "Not connected" {
    if (status === "connected") return "Connected";
    if (status === "planned") return "Planned";
    return "Not connected";
  }

  return (
    <section className="space-y-4" aria-labelledby="timeline-sources-heading">
      <div>
        <h4
          id="timeline-sources-heading"
          className="text-sm font-semibold uppercase tracking-wider text-[var(--cbai-text-muted)]"
        >
          {t("timelineUi.sourcesHeading")}
        </h4>
        <p className="mt-1 text-sm text-[var(--cbai-text-muted)]">{t("timelineUi.sourcesDescription")}</p>
      </div>

      <ul className="grid gap-2 sm:grid-cols-2">
        {model.officialSources.map((source) => {
          const statusLabel = mapConnectionToLabel(source.connectionStatus);
          return (
            <li
              key={source.sourceId}
              className="rounded-lg border border-[var(--cbai-border-default)] bg-[var(--cbai-surface-muted)] px-4 py-3"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium text-[var(--cbai-text-secondary)]">{source.sourceName}</p>
                <span
                  className={`shrink-0 rounded-md border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${coverageStatusClass(coverageClassKey(source.connectionStatus))}`}
                >
                  {statusLabel}
                </span>
              </div>
              <p className="mt-1 font-mono text-[10px] text-[var(--cbai-text-muted)]">{source.sourceId}</p>
              <p className="mt-1 text-xs text-[var(--cbai-text-muted)]">
                {t("timelineUi.verificationPrefix")} {source.verificationStatus.replace(/_/g, " ")}
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
