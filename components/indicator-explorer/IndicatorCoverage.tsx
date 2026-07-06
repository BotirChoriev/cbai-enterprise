import type { IndicatorExplorerRecord } from "@/lib/indicator-explorer";
import { coverageStatusLabel } from "@/lib/indicator-explorer";

type IndicatorCoverageProps = {
  record: IndicatorExplorerRecord;
};

export default function IndicatorCoverage({ record }: IndicatorCoverageProps) {
  const connectedSources = record.officialSources.filter(
    (s) => s.connectionStatus === "connected",
  ).length;

  return (
    <section className="space-y-4" aria-labelledby="indicator-coverage-heading">
      <div>
        <h4
          id="indicator-coverage-heading"
          className="text-sm font-semibold uppercase tracking-wider text-zinc-500"
        >
          Coverage Status
        </h4>
        <p className="mt-1 text-sm text-zinc-500">
          Connection posture from Evidence Infrastructure — not evaluative metrics.
        </p>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-5 py-4">
        <dl className="grid gap-3 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-xs uppercase tracking-wider text-zinc-600">Coverage status</dt>
            <dd className="mt-1 text-zinc-300">{coverageStatusLabel(record.coverageStatus)}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-zinc-600">Connected sources</dt>
            <dd className="mt-1 font-mono text-zinc-200">
              {connectedSources} / {record.officialSources.length}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-zinc-600">Planned connectors</dt>
            <dd className="mt-1 font-mono text-zinc-200">{record.plannedConnectors.length}</dd>
          </div>
        </dl>
      </div>

      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-5 py-4">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-400/80">
          Human review required
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-zinc-400">
          {record.limitations.map((limitation) => (
            <li key={limitation}>{limitation}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
