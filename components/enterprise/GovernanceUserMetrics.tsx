"use client";

import { useMemo } from "react";
import { buildGovernanceUserMetrics } from "@/lib/enterprise/governance-user-metrics";
import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

/** User-focused governance metrics — Evidence Coverage, Confidence, Verification, etc. */
export default function GovernanceUserMetrics() {
  const metrics = useMemo(() => buildGovernanceUserMetrics(), []);

  return (
    <section className="space-y-4" aria-labelledby="governance-user-metrics-heading">
      <div>
        <p className={cbaiSectionEyebrow}>Operating integrity</p>
        <h2 id="governance-user-metrics-heading" className="mt-1 text-lg font-semibold text-zinc-50">
          Evidence & verification posture
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          User-facing integrity metrics derived from registered sources and published governance rules.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {metrics.map((metric) => (
          <article key={metric.id} className={`${cbaiGlassCard} px-4 py-4`}>
            <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
              {metric.label}
            </p>
            <p className="mt-2 text-xl font-semibold text-zinc-100">{metric.value}</p>
            <p className="mt-2 text-xs leading-relaxed text-zinc-500">{metric.detail}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
