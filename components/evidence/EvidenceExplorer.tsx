"use client";

import { useMemo } from "react";
import { buildEvidenceExplorerModel } from "@/lib/evidence-explorer";
import OperatingPageShell from "@/components/shared/OperatingPageShell";
import EvidenceSourceCoverage from "@/components/evidence/EvidenceSourceCoverage";
import EntityEvidenceCoverage from "@/components/evidence/EntityEvidenceCoverage";
import { useTranslation } from "@/lib/i18n/use-translation";

export default function EvidenceExplorer() {
  const { t } = useTranslation();
  const model = useMemo(() => buildEvidenceExplorerModel(), []);

  return (
    <OperatingPageShell title={t("evidence.title")} description={t("evidenceExplorer.description")}>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3">
          <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
            {t("evidenceExplorer.sourcesConnected")}
          </p>
          <p className="mt-1 text-xl font-semibold text-zinc-100">
            {model.summary.connectedSources}
            <span className="text-sm font-normal text-zinc-500">
              {" "}
              / {model.summary.totalSources}
            </span>
          </p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3">
          <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
            {t("evidenceExplorer.informationConnected")}
          </p>
          <p className="mt-1 text-xl font-semibold text-zinc-100">
            {model.summary.connectedIndicators}
            <span className="text-sm font-normal text-zinc-500">
              {" "}
              / {model.summary.totalIndicators}
            </span>
          </p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3">
          <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
            {t("evidenceExplorer.profilesAvailable")}
          </p>
          <p className="mt-1 text-xl font-semibold text-zinc-100">
            {model.summary.registryEntityCount}
          </p>
        </div>
      </div>

      <EvidenceSourceCoverage sources={model.sources} />
      <EntityEvidenceCoverage entityModules={model.entityModules} />
    </OperatingPageShell>
  );
}
