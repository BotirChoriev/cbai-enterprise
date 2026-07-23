"use client";

import { useMemo } from "react";
import { buildTrustOperatingModel } from "@/lib/enterprise/trust-operating";
import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

function statusTone(status: string): string {
  if (status === "connected" || status === "verified" || status === "healthy") {
    return "border-teal-500/25 bg-teal-500/10 text-teal-300";
  }
  if (status === "planned" || status === "verification_pending") {
    return "border-amber-500/25 bg-amber-500/10 text-amber-300";
  }
  return "border-zinc-700 bg-zinc-900/70 text-zinc-400";
}

/** Trust module operating dashboard — sources, health, score basis, audit, freshness. */
export default function TrustOperatingDashboard() {
  const model = useMemo(() => buildTrustOperatingModel(), []);

  return (
    <div className="space-y-6">
      <section className={`${cbaiGlassCard} space-y-4 p-6`}>
        <div>
          <p className={cbaiSectionEyebrow}>Trust operations</p>
          <h2 className="mt-1 text-lg font-semibold text-zinc-50">Source integrity overview</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Derived from the registered official source catalog. No invented evidence or quality grades.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/80 px-4 py-3">
            <p className="text-[10px] uppercase tracking-wider text-zinc-500">Trust Score</p>
            <p className="mt-1 text-xl font-semibold text-zinc-100">{model.trustScoreLabel}</p>
            <p className="mt-1 text-xs text-zinc-600">{model.trustScoreBasis}</p>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/80 px-4 py-3">
            <p className="text-[10px] uppercase tracking-wider text-zinc-500">Evidence Freshness</p>
            <p className="mt-1 text-sm font-medium text-zinc-200">{model.evidenceFreshness}</p>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/80 px-4 py-3">
            <p className="text-[10px] uppercase tracking-wider text-zinc-500">Source Health</p>
            <p className="mt-1 text-sm text-zinc-300">
              {model.sourceHealth.healthy} healthy · {model.sourceHealth.unknown} unknown
            </p>
            <p className="mt-1 text-xs text-zinc-600">
              {model.sourceHealth.degraded} degraded · {model.sourceHealth.unavailable} unavailable
            </p>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/80 px-4 py-3">
            <p className="text-[10px] uppercase tracking-wider text-zinc-500">Platform</p>
            <p className="mt-1 text-sm font-medium text-zinc-200">v{model.platformVersion}</p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className={`${cbaiGlassCard} p-5`}>
          <h3 className="text-sm font-semibold text-zinc-100">Connected Official Sources</h3>
          <ul className="mt-4 space-y-3">
            {model.connectedOfficialSources.map((source) => (
              <li key={source.id} className="rounded-lg border border-zinc-800/80 bg-zinc-950/50 px-3 py-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium text-zinc-200">{source.name}</p>
                  <span className={`rounded-md border px-2 py-0.5 text-[10px] uppercase ${statusTone(source.connectionStatus)}`}>
                    {source.connectionStatus}
                  </span>
                </div>
                <p className="mt-1 text-xs text-zinc-500">{source.organization}</p>
                <p className="mt-2 text-xs text-zinc-600">
                  Last checked: {source.lastChecked} · {source.updateFrequency}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section className={`${cbaiGlassCard} p-5`}>
          <h3 className="text-sm font-semibold text-zinc-100">Missing Official Sources</h3>
          <ul className="mt-4 max-h-[28rem] space-y-3 overflow-y-auto pr-1">
            {model.missingOfficialSources.map((source) => (
              <li key={source.id} className="rounded-lg border border-zinc-800/80 bg-zinc-950/50 px-3 py-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium text-zinc-200">{source.name}</p>
                  <span className={`rounded-md border px-2 py-0.5 text-[10px] uppercase ${statusTone(source.connectionStatus)}`}>
                    {source.connectionStatus}
                  </span>
                </div>
                <p className="mt-1 text-xs text-zinc-500">{source.organization}</p>
                <p className="mt-2 text-xs text-zinc-600">
                  Verification: {source.verificationStatus} · Last checked: {source.lastChecked}
                </p>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className={`${cbaiGlassCard} p-5`}>
        <h3 className="text-sm font-semibold text-zinc-100">Verification Timeline</h3>
        <ol className="mt-4 space-y-3">
          {model.verificationTimeline.map((step, index) => (
            <li key={step.id} className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-teal-500/30 text-xs text-teal-300">
                {index + 1}
              </span>
              <div>
                <p className="text-sm text-zinc-200">{step.label}</p>
                <p className="text-xs text-zinc-500">{step.status}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className={`${cbaiGlassCard} p-5`}>
          <h3 className="text-sm font-semibold text-zinc-100">Audit Trail</h3>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-zinc-400">
            {model.auditTrail.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
        <section className={`${cbaiGlassCard} p-5`}>
          <h3 className="text-sm font-semibold text-zinc-100">Review History</h3>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-zinc-400">
            {model.reviewHistory.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
