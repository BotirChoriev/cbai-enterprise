import type { CompanyCoverageProfile } from "@/lib/companies.coverage";
import {
  coverageStatusClass,
  resolveSourceDisplayName,
} from "@/lib/companies.coverage";

type CompanyIndicatorCoverageProps = {
  indicatorsByDomain: CompanyCoverageProfile["indicatorsByDomain"];
};

export default function CompanyIndicatorCoverage({
  indicatorsByDomain,
}: CompanyIndicatorCoverageProps) {
  return (
    <section className="space-y-4" aria-labelledby="company-indicator-coverage-heading">
      <div>
        <h3
          id="company-indicator-coverage-heading"
          className="text-sm font-semibold uppercase tracking-wider text-zinc-500"
        >
          Indicator Coverage
        </h3>
        <p className="mt-1 text-sm text-zinc-500">
          Global Indicator Framework — applicable company indicators grouped by domain.
          Only connected indicators show available evidence.
        </p>
      </div>

      <div className="space-y-4">
        {indicatorsByDomain.map((group) => (
          <div
            key={group.domainId}
            className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950"
          >
            <div className="border-b border-zinc-800 px-5 py-3">
              <h4 className="text-sm font-semibold text-zinc-200">{group.domainTitle}</h4>
              <p className="text-xs text-zinc-600">
                {group.indicators.length} indicator
                {group.indicators.length === 1 ? "" : "s"}
              </p>
            </div>
            <ul className="divide-y divide-zinc-800/80">
              {group.indicators.map((indicator) => (
                <li
                  key={indicator.id}
                  className="flex flex-col gap-2 px-5 py-3 sm:flex-row sm:items-start sm:justify-between"
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
                        <span className="font-mono text-cyan-400/90">
                          {indicator.evidenceValue}
                        </span>
                      </p>
                    ) : null}
                  </div>
                  <span
                    className={`shrink-0 self-start rounded-md border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider sm:self-center ${coverageStatusClass(indicator.statusLabel)}`}
                  >
                    {indicator.statusLabel}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
