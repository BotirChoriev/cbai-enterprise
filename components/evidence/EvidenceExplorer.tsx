"use client";

import { useMemo } from "react";
import { buildEvidenceExplorerModel } from "@/lib/evidence-explorer";
import { getPlatformPipelineReadiness } from "@/lib/pipeline-readiness";
import EvidenceSourceCoverage from "@/components/evidence/EvidenceSourceCoverage";
import EvidenceIndicatorMap from "@/components/evidence/EvidenceIndicatorMap";
import EntityEvidenceCoverage from "@/components/evidence/EntityEvidenceCoverage";
import EvidenceLifecycle from "@/components/evidence/EvidenceLifecycle";
import EvidenceMethodology from "@/components/evidence/EvidenceMethodology";
import EvidencePersonas from "@/components/evidence/EvidencePersonas";
import EvidenceTrust from "@/components/evidence/EvidenceTrust";
import PipelineReadinessPanel from "@/components/pipeline/PipelineReadinessPanel";

export default function EvidenceExplorer() {
  const model = useMemo(() => buildEvidenceExplorerModel(), []);
  const pipelineReadiness = useMemo(() => getPlatformPipelineReadiness(), []);

  return (
    <div className="space-y-10">
      <div className="relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 px-6 py-5">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-sky-500/5 to-violet-500/5"
        />
        <div className="relative">
          <p className="text-[10px] font-medium uppercase tracking-widest text-cyan-400">
            CBAI Evidence Explorer v{model.version}
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-50">
            Evidence Explorer
          </h1>
          <p className="mt-1 max-w-3xl text-sm text-zinc-500">
            Evidence Explorer shows what CBAI knows, what sources are connected, and what
            evidence is still missing. This is the platform evidence architecture — not a
            document database, fake source list, or AI analysis page.
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
            <span className="text-sm font-normal text-zinc-500">
              {" "}
              ({model.summary.verifiedGraphEdges} verified)
            </span>
          </p>
        </div>
      </div>

      <EvidenceSourceCoverage sources={model.sources} />
      <PipelineReadinessPanel model={pipelineReadiness} />
      <EvidenceIndicatorMap indicatorsByDomain={model.indicatorsByDomain} />
      <EntityEvidenceCoverage entityModules={model.entityModules} />
      <EvidenceLifecycle stages={model.lifecycleStages} />
      <EvidenceMethodology points={model.methodology} />
      <EvidencePersonas personas={model.personas} />
      <EvidenceTrust pillars={model.trustPillars} />

      <footer className="border-t border-zinc-800 pt-6 text-xs text-zinc-600">
        Evidence Infrastructure v{model.infrastructureVersion} · Global Indicator Framework
        v{model.frameworkVersion}
      </footer>
    </div>
  );
}
