"use client";

import { useMemo } from "react";
import { buildReasoningExplorerModel } from "@/lib/reasoning-explorer";
import ReasoningPipelineOverview from "@/components/reasoning/ReasoningPipelineOverview";
import ReasoningEvidenceIndicatorMap from "@/components/reasoning/ReasoningEvidenceIndicatorMap";
import {
  ReasoningMethodologySection,
  ReasoningTracePrinciples,
} from "@/components/reasoning/ReasoningMethodologySection";
import {
  ReasoningPersonasSection,
  ReasoningTrustLimits,
} from "@/components/reasoning/ReasoningPersonasSection";

export default function ReasoningExplorer() {
  const model = useMemo(() => buildReasoningExplorerModel(), []);

  return (
    <div className="space-y-10">
      <div className="relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 px-6 py-5">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-sky-500/5 to-violet-500/5"
        />
        <div className="relative">
          <p className="text-[10px] font-medium uppercase tracking-widest text-cyan-400">
            CBAI Reasoning Explorer v{model.version}
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-50">
            Reasoning Explorer
          </h1>
          <p className="mt-1 max-w-3xl text-sm text-zinc-500">
            Reasoning Explorer shows how evidence can support transparent decision
            intelligence. It does not produce hidden AI conclusions — no fake reasoning chains,
            confidence meters, or agent narratives.
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
      <ReasoningMethodologySection methodology={model.methodology} />
      <ReasoningTracePrinciples principles={model.tracePrinciples} />
      <ReasoningPersonasSection personas={model.personas} />
      <ReasoningTrustLimits limits={model.trustLimits} />

      <footer className="border-t border-zinc-800 pt-6 text-xs text-zinc-600">
        Global Indicator Framework v{model.frameworkVersion} · Evidence Infrastructure v
        {model.infrastructureVersion} · Governance v{model.governanceVersion}
      </footer>
    </div>
  );
}
