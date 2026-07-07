import type { CompanyEvidenceCoverageSummary } from "@/lib/companies.coverage";
import { coverageStatusClass } from "@/lib/companies.coverage";
import EntityProfileSection from "@/components/shared/EntityProfileSection";

type CompanyCoveragePanelProps = {
  summary: CompanyEvidenceCoverageSummary;
  sourceConnectedCount: number;
  totalSources: number;
  nextStep?: { label: string; href: string };
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

export default function CompanyCoveragePanel({
  summary,
  sourceConnectedCount,
  totalSources,
  nextStep,
}: CompanyCoveragePanelProps) {
  return (
    <EntityProfileSection id="evidence" title="Evidence" nextStep={nextStep}>
      <p className="text-sm text-zinc-500">Evidence and source status from available information.</p>

      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <CoverageStat label="Connected" value={summary.connected} status="Connected" />
        <CoverageStat label="Planned" value={summary.planned} status="Planned" />
        <CoverageStat label="Not connected" value={summary.notConnected} status="Not connected" />
        <CoverageStat
          label="Pending review"
          value={summary.verificationPending}
          status="Verification pending"
        />
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-4 sm:px-5">
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs uppercase tracking-wider text-zinc-600">Total indicators</dt>
            <dd className="mt-1 font-mono text-zinc-200">{summary.total}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-zinc-600">Sources connected</dt>
            <dd className="mt-1 font-mono text-zinc-200">
              {sourceConnectedCount} of {totalSources}
            </dd>
          </div>
        </dl>
      </div>
    </EntityProfileSection>
  );
}
