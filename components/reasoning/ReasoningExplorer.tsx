"use client";

import { useMemo } from "react";
import { buildReasoningExplorerModel } from "@/lib/reasoning-explorer";
import ReasoningPipelineOverview from "@/components/reasoning/ReasoningPipelineOverview";
import ReasoningEvidenceIndicatorMap from "@/components/reasoning/ReasoningEvidenceIndicatorMap";

export default function ReasoningExplorer() {
  const model = useMemo(() => buildReasoningExplorerModel(), []);

  return (
    <div className="space-y-10">
      <div className="relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 px-6 py-5">
        <div className="relative">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-50">
            Reasoning Explorer
          </h1>
          <p className="mt-1 max-w-3xl text-sm text-zinc-500">
            How evidence supports transparent decision intelligence — pipeline stages and indicator
            domains only.
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3">
          <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
            Pipeline stages
          </p>
          <p className="mt-1 text-xl font-semibold text-zinc-100">
            {model.summary.pipelineStages}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3">
          <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
            Indicator domains
          </p>
          <p className="mt-1 text-xl font-semibold text-zinc-100">
            {model.summary.indicatorDomains}
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
            Sources connected
          </p>
          <p className="mt-1 text-xl font-semibold text-zinc-100">
            {model.summary.connectedSources}
          </p>
        </div>
      </div>

      <ReasoningPipelineOverview stages={model.pipeline} />
      <ReasoningEvidenceIndicatorMap domains={model.domainEvidenceMap} />
    </div>
  );
}
