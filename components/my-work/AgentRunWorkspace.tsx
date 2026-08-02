"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AGENT_RUNS_CHANGED_EVENT, getAgentRun } from "@/lib/agentic-workspace/agent-run-store";
import { useHydrated } from "@/lib/hooks/use-hydrated";
import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";
import { buildOperationalHumanContext } from "@/lib/human-centered-workspace/operational-context-adapter";
import { OPERATIONAL_REFERENCE_CAPABILITIES } from "@/lib/human-centered-workspace/operational-capabilities";
import { composeWorkspace } from "@/lib/human-centered-workspace/workspace-composer";

export default function AgentRunWorkspace() {
  const searchParams = useSearchParams();
  const hydrated = useHydrated();
  const [, setRevision] = useState(0);
  useEffect(() => {
    const refresh = () => setRevision((value) => value + 1);
    window.addEventListener(AGENT_RUNS_CHANGED_EVENT, refresh);
    return () => window.removeEventListener(AGENT_RUNS_CHANGED_EVENT, refresh);
  }, []);
  const runId = searchParams.get("agentRun");
  if (!runId) return null;
  if (!hydrated) return <section className={`${cbaiGlassCard} p-5 text-sm text-zinc-500`}>Agent workspace loading…</section>;
  const run = getAgentRun(runId);
  if (!run) return <section role="alert" className={`${cbaiGlassCard} p-5 text-sm text-amber-300`}>Agent run was not found. No success was recorded.</section>;

  const process = run.artifacts.find((artifact) => artifact.type === "process_map");
  const liveNarration = run.artifacts.find((artifact) => artifact.type === "research_brief");
  const humanContext = buildOperationalHumanContext({
    contextId: `agent-run-context:${run.id}`,
    workspaceId: `agent-run:${run.id}`,
    outcome: run.goal,
    knownFacts: run.knownFacts,
    missingInformation: run.missingInformation,
  });
  const workspaceManifest = composeWorkspace(humanContext, OPERATIONAL_REFERENCE_CAPABILITIES, {
    workspaceId: `operational-environment:${run.id}`,
    title: "Adaptive operational environment",
  });
  return (
    <section data-cbai-agent-run={run.id} className={`${cbaiGlassCard} space-y-5 border-teal-500/25 p-6`}>
      <div>
        <p className={cbaiSectionEyebrow}>LIVE AGENT RUN · DRAFT</p>
        <h2 className="mt-1 text-xl font-semibold text-zinc-100">{run.goal}</h2>
        <p className="mt-2 text-sm text-zinc-400">{run.originalRequest}</p>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-lg border border-zinc-800 p-3"><p className="text-xs text-zinc-500">Known facts</p><p className="mt-1 text-lg text-zinc-100">{run.knownFacts.length}</p></div>
        <div className="rounded-lg border border-amber-900/50 p-3"><p className="text-xs text-zinc-500">Missing</p><p className="mt-1 text-lg text-amber-300">{run.missingInformation.length}</p></div>
        <div className="rounded-lg border border-zinc-800 p-3"><p className="text-xs text-zinc-500">Assumptions</p><p className="mt-1 text-lg text-zinc-100">{run.assumptions.length}</p></div>
      </div>
      {process ? (
        <div>
          <h3 className="text-sm font-semibold text-zinc-200">{process.title}</h3>
          <ol className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            {process.items.map((item, index) => <li key={item} className="flex items-center gap-2"><span className="rounded-md border border-teal-800/60 bg-teal-950/30 px-3 py-2 text-teal-100">{item}</span>{index < process.items.length - 1 ? <span aria-hidden="true" className="text-zinc-600">→</span> : null}</li>)}
          </ol>
          <p className="mt-2 text-xs text-zinc-500">Draft proposal from the user’s stated goal; not verified operating fact.</p>
        </div>
      ) : null}
      {liveNarration ? (
        <div className="rounded-lg border border-sky-800/50 bg-sky-950/20 p-4" data-cbai-agent-live-output="true">
          <h3 className="text-sm font-semibold text-sky-200">Operator bilan birga yaratilmoqda</h3>
          <ol className="mt-2 space-y-2">
            {liveNarration.items.map((item, index) => (
              <li key={`${index}-${item}`} className="flex gap-2 text-sm text-zinc-200">
                <span className="text-sky-300">{index + 1}.</span><span>{item}</span>
              </li>
            ))}
          </ol>
          <p className="mt-3 text-xs text-zinc-500">Bu jonli draft. Dalil va inson tasdig‘isiz yakuniy xulosa hisoblanmaydi.</p>
        </div>
      ) : null}
      <div className="space-y-3 border-t border-zinc-800 pt-4">
        <div>
          <p className={cbaiSectionEyebrow}>Adaptive operational environment</p>
          <p className="mt-1 text-xs text-zinc-500">
            The same workspace kernel selects reusable capabilities from this request’s confirmed context. No occupation or industry persona controls this surface.
          </p>
        </div>
        <ul className="grid gap-2 md:grid-cols-2" aria-label="Composed operational capabilities">
          {workspaceManifest.modules.map((module) => {
            const reason = workspaceManifest.compositionReasons.find(
              (item) => item.capabilityId === module.capabilityId,
            );
            const active = module.state === "active";
            return (
              <li key={module.moduleId} className="rounded-lg border border-zinc-800 bg-zinc-950/30 p-3">
                <div className="flex items-start justify-between gap-3">
                  <span className="text-xs font-semibold text-zinc-200">{module.capabilityId}</span>
                  <span className={active ? "text-[10px] uppercase text-teal-300" : "text-[10px] uppercase text-amber-300"}>
                    {active ? "Active" : "Waiting for context"}
                  </span>
                </div>
                <p className="mt-1 text-xs text-zinc-500">{reason?.statement}</p>
              </li>
            );
          })}
        </ul>
        {workspaceManifest.missingItems.length > 0 ? (
          <div className="rounded-lg border border-amber-800/50 bg-amber-950/15 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-300">Context still required</p>
            <ul className="mt-2 space-y-1 text-xs text-zinc-400">
              {workspaceManifest.missingItems.map((item) => <li key={item.id}>• {item.label}</li>)}
            </ul>
          </div>
        ) : null}
      </div>
      <div>
        <h3 className="text-sm font-semibold text-zinc-200">Execution plan</h3>
        <ol className="mt-2 space-y-2">
          {run.steps.map((step) => <li key={step.id} className="rounded-lg border border-zinc-800 p-3"><div className="flex justify-between gap-3"><span className="text-sm text-zinc-200">{step.title}</span><span className="text-[10px] uppercase text-zinc-500">{step.status.replaceAll("_", " ")}</span></div><p className="mt-1 text-xs text-zinc-500">{step.purpose}</p>{step.requiresHumanConfirmation ? <p className="mt-1 text-[10px] text-amber-300">Human confirmation required</p> : null}</li>)}
        </ol>
      </div>
      <div role="status" className="rounded-lg border border-amber-800/50 bg-amber-950/20 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-amber-300">Next missing item</p>
        <p className="mt-1 text-sm text-zinc-200">{run.nextQuestion}</p>
      </div>
    </section>
  );
}
