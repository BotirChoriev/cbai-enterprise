import type { UniversityEvidenceCoverageSummary } from "@/lib/universities.coverage";
import { coverageStatusClass } from "@/lib/universities.coverage";

type UniversityCoveragePanelProps = {
  summary: UniversityEvidenceCoverageSummary;
  sourceConnectedCount: number;
  totalSources: number;
};

function CoverageStat({
  label,
  value,
  status,
}: {
  label: string;
  value: number;
  status: "Connected" | "Planned" | "Not connected" | "Verification pending";
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-4">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
        {label}
      </p>
      <p className="mt-2 font-mono text-2xl font-semibold text-zinc-100">{value}</p>
      <span
        className={`mt-2 inline-flex rounded-md border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${coverageStatusClass(status)}`}
      >
        {status}
      </span>
    </div>
  );
}

export default function UniversityCoveragePanel({
  summary,
  sourceConnectedCount,
  totalSources,
}: UniversityCoveragePanelProps) {
  return (
    <section className="space-y-4" aria-labelledby="university-evidence-coverage-heading">
      <div>
        <h3
          id="university-evidence-coverage-heading"
          className="text-sm font-semibold uppercase tracking-wider text-zinc-500"
        >
          Evidence Coverage
        </h3>
        <p className="mt-1 text-sm text-zinc-500">
          Indicator and source connectivity across official evidence infrastructure — no
          external API connected today except CBAI Local Registry.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <CoverageStat label="Connected indicators" value={summary.connected} status="Connected" />
        <CoverageStat label="Planned indicators" value={summary.planned} status="Planned" />
        <CoverageStat
          label="Not connected indicators"
          value={summary.notConnected}
          status="Not connected"
        />
        <CoverageStat
          label="Verification pending"
          value={summary.verificationPending}
          status="Verification pending"
        />
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-5 py-4">
        <dl className="grid gap-3 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-xs uppercase tracking-wider text-zinc-600">
              Total applicable indicators
            </dt>
            <dd className="mt-1 font-mono text-zinc-200">{summary.total}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-zinc-600">
              Connected evidence sources
            </dt>
            <dd className="mt-1 font-mono text-zinc-200">
              {sourceConnectedCount} of {totalSources}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-zinc-600">
              Coverage policy
            </dt>
            <dd className="mt-1 text-zinc-400">Evidence First — no rankings without sources</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
