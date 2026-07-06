"use client";

import { useMemo, useState } from "react";
import { buildEvidenceExplorerModel } from "@/lib/evidence-explorer";
import EvidenceSourceCoverage from "@/components/evidence/EvidenceSourceCoverage";
import EvidenceIndicatorMap from "@/components/evidence/EvidenceIndicatorMap";
import EntityEvidenceCoverage from "@/components/evidence/EntityEvidenceCoverage";
import IndicatorExplorerPanel from "@/components/indicator-explorer/IndicatorExplorerPanel";

export default function EvidenceExplorer() {
  const model = useMemo(() => buildEvidenceExplorerModel(), []);
  const [exploreIndicatorId, setExploreIndicatorId] = useState<string | null>(null);

  return (
    <div className="space-y-10">
      <div className="relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 px-6 py-5">
        <div className="relative">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-50">
            Evidence Explorer
          </h1>
          <p className="mt-1 max-w-3xl text-sm text-zinc-500">
            Platform evidence architecture — connected sources, indicators, and coverage by entity.
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
            Indicators connected
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
            Registry entities
          </p>
          <p className="mt-1 text-xl font-semibold text-zinc-100">
            {model.summary.registryEntityCount}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3">
          <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
            Knowledge graph edges
          </p>
          <p className="mt-1 text-xl font-semibold text-zinc-100">
            {model.summary.graphEdges}
          </p>
        </div>
      </div>

      <EvidenceSourceCoverage sources={model.sources} />
      <EvidenceIndicatorMap
        indicatorsByDomain={model.indicatorsByDomain}
        onExploreIndicator={setExploreIndicatorId}
      />
      <IndicatorExplorerPanel initialIndicatorId={exploreIndicatorId} />
      <EntityEvidenceCoverage entityModules={model.entityModules} />
    </div>
  );
}
