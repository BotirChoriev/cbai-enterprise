"use client";

import type { IndicatorExplorerRecord } from "@/lib/indicator-explorer";
import { useTranslation } from "@/lib/i18n/use-translation";

function connectionClass(status: string): string {
  if (status === "connected") return "text-teal-400 bg-teal-500/10 border-teal-500/20";
  if (status === "planned") return "text-violet-400 bg-violet-500/10 border-violet-500/20";
  return "text-zinc-400 bg-zinc-800/50 border-zinc-700/50";
}

type IndicatorSourcesProps = {
  record: IndicatorExplorerRecord;
};

function connectionKey(status: string): "connectionConnected" | "connectionPlanned" | "connectionNotConnected" {
  if (status === "connected") return "connectionConnected";
  if (status === "planned") return "connectionPlanned";
  return "connectionNotConnected";
}

export default function IndicatorSources({ record }: IndicatorSourcesProps) {
  const { t } = useTranslation();

  return (
    <section className="space-y-4" aria-labelledby="indicator-sources-heading">
      <div>
        <h4
          id="indicator-sources-heading"
          className="text-sm font-semibold uppercase tracking-wider text-[var(--cbai-text-muted)]"
        >
          {t("indicatorExplorer.sourcesHeading")}
        </h4>
        <p className="mt-1 text-sm text-[var(--cbai-text-secondary)]">{t("indicatorExplorer.sourcesLead")}</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--cbai-text-muted)]">
            {t("indicatorExplorer.officialSources")}
          </p>
          {record.officialSources.length === 0 ? (
            <p className="text-sm text-[var(--cbai-text-secondary)]">{t("indicatorExplorer.noOfficialSources")}</p>
          ) : (
            <ul className="space-y-2">
              {record.officialSources.map((source) => {
                const labelKey = connectionKey(source.connectionStatus);
                const label = t(`indicatorExplorer.${labelKey}`);
                return (
                  <li
                    key={source.sourceId}
                    className="rounded-lg border border-[var(--cbai-border-subtle)] bg-[var(--cbai-surface-muted)] px-4 py-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-[var(--cbai-text-primary)]">{source.sourceName}</p>
                      <span
                        className={`shrink-0 rounded-md border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${connectionClass(source.connectionStatus)}`}
                      >
                        {label}
                      </span>
                    </div>
                    <p className="mt-1 font-mono text-[10px] text-[var(--cbai-text-muted)]">{source.sourceId}</p>
                    {source.required ? (
                      <p className="mt-1 text-[10px] text-[var(--cbai-text-muted)]">
                        {t("indicatorExplorer.requiredSource")}
                      </p>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--cbai-text-muted)]">
            {t("indicatorExplorer.plannedConnectors")}
          </p>
          {record.plannedConnectors.length === 0 ? (
            <p className="text-sm text-[var(--cbai-text-secondary)]">{t("indicatorExplorer.noConnectors")}</p>
          ) : (
            <ul className="space-y-2">
              {record.plannedConnectors.map((connector) => (
                <li
                  key={connector.connectorId}
                  className="rounded-lg border border-[var(--cbai-border-subtle)] bg-[var(--cbai-surface-muted)] px-4 py-3"
                >
                  <p className="text-sm font-medium text-[var(--cbai-text-primary)]">{connector.connectorName}</p>
                  <p className="mt-0.5 text-xs text-[var(--cbai-text-secondary)]">{connector.organization}</p>
                  <p className="mt-1 font-mono text-[10px] text-[var(--cbai-text-muted)]">{connector.connectorId}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-wider text-violet-400">{connector.status}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
