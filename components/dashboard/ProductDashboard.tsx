import Link from "next/link";
import { buildEvidenceExplorerModel } from "@/lib/evidence-explorer";
import { buildReportsCenterModel } from "@/lib/reports-center";
import { getEntityCounts } from "@/lib/global-search";

const actionLink =
  "flex flex-col rounded-xl border border-zinc-800 bg-zinc-950 px-5 py-4 transition-colors hover:border-cyan-500/30 hover:bg-zinc-900/60";

export default function ProductDashboard() {
  const evidence = buildEvidenceExplorerModel();
  const reports = buildReportsCenterModel();
  const counts = getEntityCounts();

  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-6 py-5">
        <h2 className="text-lg font-semibold text-zinc-100">What you can do now</h2>
        <p className="mt-1 max-w-2xl text-sm text-zinc-500">
          Search a country, company, or university and follow one review from evidence through
          decision package to reports.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/search" className={actionLink}>
          <span className="text-sm font-semibold text-cyan-400">Search</span>
          <span className="mt-1 text-xs text-zinc-500">
            Find {counts.all} registry records and open an integrated profile
          </span>
        </Link>
        <Link href="/countries" className={actionLink}>
          <span className="text-sm font-semibold text-cyan-400">Countries</span>
          <span className="mt-1 text-xs text-zinc-500">
            {counts.country} country profiles with evidence and decision package
          </span>
        </Link>
        <Link href="/companies" className={actionLink}>
          <span className="text-sm font-semibold text-cyan-400">Companies</span>
          <span className="mt-1 text-xs text-zinc-500">
            {counts.company} company profiles from the local registry
          </span>
        </Link>
        <Link href="/universities" className={actionLink}>
          <span className="text-sm font-semibold text-cyan-400">Universities</span>
          <span className="mt-1 text-xs text-zinc-500">
            {counts.university} university profiles from the local registry
          </span>
        </Link>
        <Link href="/knowledge" className={actionLink}>
          <span className="text-sm font-semibold text-cyan-400">Evidence Explorer</span>
          <span className="mt-1 text-xs text-zinc-500">
            {evidence.summary.connectedSources}/{evidence.summary.totalSources} sources connected
          </span>
        </Link>
        <Link href="/analytics" className={actionLink}>
          <span className="text-sm font-semibold text-cyan-400">Reports</span>
          <span className="mt-1 text-xs text-zinc-500">
            {reports.summary.availableTodayCount} report types with partial scope today
          </span>
        </Link>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-6 py-5">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
          Available today
        </h2>
        <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="text-xs uppercase tracking-wider text-zinc-600">Registry entities</dt>
            <dd className="mt-1 font-mono text-xl text-zinc-100">{counts.all}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-zinc-600">Sources connected</dt>
            <dd className="mt-1 font-mono text-xl text-zinc-100">
              {evidence.summary.connectedSources}
              <span className="text-sm text-zinc-500"> / {evidence.summary.totalSources}</span>
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-zinc-600">Indicators connected</dt>
            <dd className="mt-1 font-mono text-xl text-zinc-100">
              {evidence.summary.connectedIndicators}
              <span className="text-sm text-zinc-500"> / {evidence.summary.totalIndicators}</span>
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-zinc-600">Report types</dt>
            <dd className="mt-1 font-mono text-xl text-zinc-100">{reports.summary.reportTypes}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
