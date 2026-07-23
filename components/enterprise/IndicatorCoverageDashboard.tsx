import {
  coverageStatusClass,
  resolveSourceDisplayName,
  type CoverageStatusLabel,
} from "@/lib/countries.coverage";
import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

type DashboardIndicator = {
  id: string;
  title: string;
  statusLabel: CoverageStatusLabel;
  requiredSources: readonly string[];
  evidenceValue?: string;
};

type DashboardDomainGroup = {
  domainId: string;
  domainTitle: string;
  indicators: readonly DashboardIndicator[];
};

type DashboardSource = {
  statusLabel: CoverageStatusLabel;
};

type IndicatorCoverageDashboardProps = {
  evidenceCoverage: {
    connected: number;
    planned: number;
    notConnected: number;
    verificationPending: number;
    total: number;
  };
  indicatorsByDomain: readonly DashboardDomainGroup[];
  sources?: readonly DashboardSource[];
  title?: string;
  description?: string;
};

function ProgressChip({
  label,
  count,
  tone,
}: {
  label: string;
  count: number;
  tone: string;
}) {
  return (
    <div className={`rounded-xl border px-4 py-3 ${tone}`}>
      <p className="text-[10px] font-medium uppercase tracking-wider opacity-80">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">{count}</p>
    </div>
  );
}

/** Professional indicator dashboard — available, missing, progress, source status. */
export default function IndicatorCoverageDashboard({
  evidenceCoverage,
  indicatorsByDomain,
  sources = [],
  title = "Indicator Dashboard",
  description = "Registered indicators for this entity — Connected, Planned, and Missing — without invented values.",
}: IndicatorCoverageDashboardProps) {
  const missing = evidenceCoverage.notConnected + evidenceCoverage.verificationPending;
  const coveragePercent =
    evidenceCoverage.total > 0
      ? Math.round((evidenceCoverage.connected / evidenceCoverage.total) * 100)
      : 0;

  const connectedSources = sources.filter((s) => s.statusLabel === "Connected").length;
  const plannedSources = sources.filter((s) => s.statusLabel === "Planned").length;
  const missingSources = sources.length - connectedSources;

  return (
    <section className="space-y-5" aria-labelledby="indicator-dashboard-heading">
      <div>
        <p className={cbaiSectionEyebrow}>Coverage</p>
        <h3 id="indicator-dashboard-heading" className="mt-1 text-base font-semibold text-zinc-100">
          {title}
        </h3>
        <p className="mt-1 text-sm text-zinc-500">{description}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <ProgressChip
          label="Connected"
          count={evidenceCoverage.connected}
          tone="border-teal-500/25 bg-teal-500/5 text-teal-200"
        />
        <ProgressChip
          label="Planned"
          count={evidenceCoverage.planned}
          tone="border-amber-500/25 bg-amber-500/5 text-amber-200"
        />
        <ProgressChip
          label="Missing"
          count={missing}
          tone="border-zinc-700 bg-zinc-900/70 text-zinc-300"
        />
        <div className="rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-zinc-100">
          <p className="text-[10px] font-medium uppercase tracking-wider opacity-80">Coverage %</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">{coveragePercent}%</p>
        </div>
      </div>

      <div className={`${cbaiGlassCard} grid gap-4 p-4 sm:grid-cols-3`}>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-zinc-600">Last Updated</p>
          <p className="mt-1 text-sm text-zinc-300">
            Not checked — awaiting official source integration
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-zinc-600">Source Status</p>
          <p className="mt-1 text-sm text-zinc-300">
            {connectedSources} connected · {plannedSources} planned · {Math.max(0, missingSources)} missing
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-zinc-600">Total Indicators</p>
          <p className="mt-1 text-sm text-zinc-300">{evidenceCoverage.total} registered</p>
        </div>
      </div>

      <div className="space-y-4">
        {indicatorsByDomain.map((group) => {
          const available = group.indicators.filter((i) => i.statusLabel === "Connected");
          const planned = group.indicators.filter((i) => i.statusLabel === "Planned");
          const absent = group.indicators.filter(
            (i) => i.statusLabel === "Not connected" || i.statusLabel === "Verification pending",
          );

          return (
            <div key={group.domainId} className={`${cbaiGlassCard} overflow-hidden`}>
              <div className="border-b border-zinc-800/80 px-5 py-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="text-sm font-semibold text-zinc-200">{group.domainTitle}</h4>
                  <p className="text-xs text-zinc-600">
                    {available.length} connected · {planned.length} planned · {absent.length} missing
                  </p>
                </div>
              </div>
              <ul className="divide-y divide-zinc-800/80">
                {group.indicators.map((indicator) => (
                  <li
                    key={indicator.id}
                    className="flex flex-col gap-2 px-5 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-zinc-200">{indicator.title}</p>
                      <p className="mt-0.5 text-xs text-zinc-600">
                        Required sources:{" "}
                        {indicator.requiredSources
                          .map((slug) => resolveSourceDisplayName(slug))
                          .join(", ")}
                      </p>
                      {indicator.statusLabel === "Connected" && indicator.evidenceValue ? (
                        <p className="mt-2 text-sm text-zinc-300">
                          Available information:{" "}
                          <span className="font-mono text-teal-400/90">{indicator.evidenceValue}</span>
                        </p>
                      ) : null}
                    </div>
                    <span
                      className={`shrink-0 self-start rounded-md border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider sm:self-center ${coverageStatusClass(indicator.statusLabel)}`}
                    >
                      {indicator.statusLabel === "Not connected" ? "Missing" : indicator.statusLabel}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}
