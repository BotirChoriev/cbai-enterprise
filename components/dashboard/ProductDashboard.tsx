import Link from "next/link";
import { buildEvidenceExplorerModel } from "@/lib/evidence-explorer";
import { buildReportsCenterModel } from "@/lib/reports-center";
import { getEntityCounts } from "@/lib/global-search";
import { cbaiBtnPrimary, cbaiGlassCard } from "@/components/brand/brand-classes";

const actionLink = `${cbaiGlassCard} flex flex-col px-5 py-4 transition-colors hover:border-teal-500/25`;

export default function ProductDashboard() {
  const evidence = buildEvidenceExplorerModel();
  const reports = buildReportsCenterModel();
  const counts = getEntityCounts();

  return (
    <div className="space-y-8">
      <div className={`${cbaiGlassCard} border-teal-500/15 px-6 py-5`}>
        <h2 className="text-lg font-semibold text-zinc-100">Where do I start?</h2>
        <p className="mt-1 max-w-2xl text-sm text-zinc-400">
          Search a name, open a profile, then review available information, missing information,
          and reports.
        </p>
        <Link href="/search" className={`${cbaiBtnPrimary} mt-4`}>
          Start with Search →
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/search" className={actionLink}>
          <span className="text-sm font-semibold text-teal-400">Search</span>
          <span className="mt-1 text-xs text-zinc-500">
            Find {counts.all} profiles and open a review
          </span>
        </Link>
        <Link href="/countries" className={actionLink}>
          <span className="text-sm font-semibold text-teal-400">Countries</span>
          <span className="mt-1 text-xs text-zinc-500">
            {counts.country} country profiles with official information and reports
          </span>
        </Link>
        <Link href="/companies" className={actionLink}>
          <span className="text-sm font-semibold text-teal-400">Companies</span>
          <span className="mt-1 text-xs text-zinc-500">
            {counts.company} company profiles with official information and reports
          </span>
        </Link>
        <Link href="/universities" className={actionLink}>
          <span className="text-sm font-semibold text-teal-400">Universities</span>
          <span className="mt-1 text-xs text-zinc-500">
            {counts.university} university profiles with official information and reports
          </span>
        </Link>
        <Link href="/knowledge" className={actionLink}>
          <span className="text-sm font-semibold text-teal-400">Evidence</span>
          <span className="mt-1 text-xs text-zinc-500">
            {evidence.summary.connectedSources}/{evidence.summary.totalSources} sources connected
          </span>
        </Link>
        <Link href="/analytics" className={actionLink}>
          <span className="text-sm font-semibold text-teal-400">Reports</span>
          <span className="mt-1 text-xs text-zinc-500">
            {reports.summary.availableTodayCount} report types available today
          </span>
        </Link>
      </div>

      <div className={`${cbaiGlassCard} px-6 py-5`}>
        <h2 className="text-base font-semibold text-zinc-200">Available today</h2>
        <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="text-xs uppercase tracking-wider text-zinc-600">Profiles</dt>
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
            <dt className="text-xs uppercase tracking-wider text-zinc-600">
              Information connected
            </dt>
            <dd className="mt-1 font-mono text-xl text-zinc-100">
              {evidence.summary.connectedIndicators}
              <span className="text-sm text-zinc-500">
                {" "}
                / {evidence.summary.totalIndicators}
              </span>
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
