"use client";

import { useMemo } from "react";
import { buildEvidenceExplorerModel } from "@/lib/evidence-explorer";
import { cbaiPageHeader } from "@/components/brand/brand-classes";
import EvidenceSourceCoverage from "@/components/evidence/EvidenceSourceCoverage";
import EntityEvidenceCoverage from "@/components/evidence/EntityEvidenceCoverage";

export default function EvidenceExplorer() {
  const model = useMemo(() => buildEvidenceExplorerModel(), []);

  return (
    <div className="space-y-10">
      <div className={cbaiPageHeader}>
        <h1 className="cbai-display text-2xl text-zinc-50">Evidence</h1>
        <p className="mt-1 max-w-3xl text-sm text-zinc-500">
          Official source status and available information across country, company, and university
          profiles.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3">
          <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
            Sources connected
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
            Information connected
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
            Profiles available
          </p>
          <p className="mt-1 text-xl font-semibold text-zinc-100">
            {model.summary.registryEntityCount}
          </p>
        </div>
      </div>

      <EvidenceSourceCoverage sources={model.sources} />
      <EntityEvidenceCoverage entityModules={model.entityModules} />
    </div>
  );
}
