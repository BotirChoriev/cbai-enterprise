import type { GlobalStatusModel } from "@/lib/enterprise/global-status";
import { cbaiGlassCard } from "@/components/brand/brand-classes";

type GlobalStatusStripProps = {
  status: GlobalStatusModel;
  compact?: boolean;
};

function Metric({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-zinc-100">{value}</p>
      {hint ? <p className="mt-0.5 truncate text-[11px] text-zinc-600">{hint}</p> : null}
    </div>
  );
}

/** Page-level honesty strip — connected/missing sources, coverage math, confidence, freshness. */
export default function GlobalStatusStrip({ status, compact = false }: GlobalStatusStripProps) {
  const coverageValue =
    status.coveragePercent === null ? "Not assessed" : `${status.coveragePercent}%`;

  return (
    <section
      aria-label="Evidence and source status"
      className={`${cbaiGlassCard} ${compact ? "px-4 py-3" : "px-5 py-4"}`}
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Metric label="Connected Sources" value={String(status.connectedSources)} />
        <Metric
          label="Missing Sources"
          value={String(status.missingSources)}
          hint={`${status.plannedSources} planned`}
        />
        <Metric label="Coverage %" value={coverageValue} hint={status.coverageBasis} />
        <Metric label="Confidence" value={status.confidence} />
        <Metric label="Last Updated" value={status.lastUpdated} />
        <Metric label="Evidence Health" value={status.evidenceHealth} />
      </div>
    </section>
  );
}
