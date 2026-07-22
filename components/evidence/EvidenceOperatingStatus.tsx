"use client";

import type { EvidenceExplorerModel } from "@/lib/evidence-explorer";
import { useTranslation } from "@/lib/i18n/use-translation";
import { cbaiMineralSurface, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

type EvidenceOperatingStatusProps = {
  summary: EvidenceExplorerModel["summary"];
};

/** Operational infrastructure counts — real architecture state, not decorative KPIs. */
export default function EvidenceOperatingStatus({ summary }: EvidenceOperatingStatusProps) {
  const { t } = useTranslation();

  const rows = [
    {
      label: t("evidenceExplorer.sourcesConnected"),
      value: `${summary.connectedSources} / ${summary.totalSources}`,
    },
    {
      label: t("evidenceExplorer.informationConnected"),
      value: `${summary.connectedIndicators} / ${summary.totalIndicators}`,
    },
    {
      label: t("evidenceExplorer.profilesAvailable"),
      value: String(summary.registryEntityCount),
    },
    {
      label: t("evidenceExplorer.graphEdges"),
      value: t("evidenceExplorer.graphEdgesVerified", {
        verified: String(summary.verifiedGraphEdges),
        total: String(summary.graphEdges),
      }),
    },
  ];

  return (
    <section className={`${cbaiMineralSurface} space-y-3 p-5`} aria-labelledby="evidence-operating-status-heading">
      <p className={cbaiSectionEyebrow}>{t("evidenceRuntime.operatingEyebrow")}</p>
      <h2 id="evidence-operating-status-heading" className="sr-only">
        {t("evidenceRuntime.operatingEyebrow")}
      </h2>
      <dl className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {rows.map((row) => (
          <div key={row.label} className="border-l-2 border-l-teal-500/30 pl-3">
            <dt className="text-[10px] uppercase tracking-wider text-zinc-600">{row.label}</dt>
            <dd className="mt-0.5 text-sm font-medium text-zinc-200">{row.value}</dd>
          </div>
        ))}
      </dl>
      <p className="text-[10px] text-zinc-600">{t("evidenceRuntime.infrastructureNote")}</p>
    </section>
  );
}
