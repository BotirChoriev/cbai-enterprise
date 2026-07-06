import type { CountrySourceCoverageItem } from "@/lib/countries.coverage";
import { coverageStatusClass } from "@/lib/countries.coverage";

type CountrySourceCoverageProps = {
  sources: readonly CountrySourceCoverageItem[];
};

export default function CountrySourceCoverage({ sources }: CountrySourceCoverageProps) {
  return (
    <section className="space-y-4" aria-labelledby="country-source-coverage-heading">
      <div>
        <h3
          id="country-source-coverage-heading"
          className="text-sm font-semibold uppercase tracking-wider text-zinc-500"
        >
          Source Coverage
        </h3>
        <p className="mt-1 text-sm text-zinc-500">
          Official evidence sources from CBAI Evidence Infrastructure — connection status only,
          no live API integration.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950">
        <ul className="divide-y divide-zinc-800">
          {sources.map((source) => (
            <li
              key={source.id}
              className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-zinc-100">{source.name}</p>
                <p className="mt-0.5 text-xs text-zinc-500">{source.organization}</p>
                <p className="mt-1 text-xs text-zinc-600">
                  {source.supportedIndicatorCount} supported indicator
                  {source.supportedIndicatorCount === 1 ? "" : "s"}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
                <span
                  className={`rounded-md border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${coverageStatusClass(source.statusLabel)}`}
                >
                  {source.statusLabel}
                </span>
                <a
                  href={source.officialWebsite}
                  className="text-xs text-cyan-400 underline-offset-2 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Official website
                </a>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
