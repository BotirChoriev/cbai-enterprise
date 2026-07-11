import type { CompanySourceCoverageItem } from "@/lib/companies.coverage";
import { coverageStatusClass } from "@/lib/companies.coverage";

type CompanySourceCoverageProps = {
  sources: readonly CompanySourceCoverageItem[];
};

const NOT_ASSESSED = "Not assessed";
const NOT_AVAILABLE = "Not available";

function EvidenceField({ label, value, href }: { label: string; value: string; href?: string | null }) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-wider text-zinc-600">{label}</dt>
      <dd className="mt-0.5 text-xs text-zinc-300">
        {href ? (
          <a href={href} target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline-offset-2 hover:underline">
            {value}
          </a>
        ) : (
          value
        )}
      </dd>
    </div>
  );
}

/**
 * Evidence detail per official source — the full field set the Companies Intelligence mission
 * asks for (Source, Publisher, Publication date, Evidence summary, Citation, Confidence, Open
 * source link). Publication date, citation, and confidence do not exist as real data anywhere in
 * this platform today — shown honestly as "Not assessed"/"Not available" rather than invented.
 */
export default function CompanySourceCoverage({ sources }: CompanySourceCoverageProps) {
  return (
    <section className="space-y-4" aria-labelledby="company-source-coverage-heading">
      <div>
        <h3
          id="company-source-coverage-heading"
          className="text-sm font-semibold uppercase tracking-wider text-zinc-500"
        >
          Official Source Coverage
        </h3>
        <p className="mt-1 text-sm text-zinc-500">
          Official evidence sources for company intelligence — connection status only, no
          live API integration.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950">
        <ul className="divide-y divide-zinc-800">
          {sources.map((source) => (
            <li key={source.id} className="space-y-3 px-5 py-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-zinc-100">{source.name}</p>
                  {source.supportedIndicatorCount > 0 ? (
                    <p className="mt-1 text-xs text-zinc-600">
                      {source.supportedIndicatorCount} supported indicator
                      {source.supportedIndicatorCount === 1 ? "" : "s"}
                    </p>
                  ) : null}
                </div>
                <span
                  className={`shrink-0 self-start rounded-md border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${coverageStatusClass(source.statusLabel)}`}
                >
                  {source.statusLabel}
                </span>
              </div>

              <dl className="grid grid-cols-2 gap-3 border-t border-zinc-800/80 pt-3 sm:grid-cols-3">
                <EvidenceField label="Publisher" value={source.organization} />
                <EvidenceField label="Publication date" value={NOT_AVAILABLE} />
                <EvidenceField label="Confidence" value={NOT_ASSESSED} />
                <EvidenceField label="Citation" value={NOT_AVAILABLE} />
                <EvidenceField
                  label="Open source link"
                  value={source.officialWebsite ? "Official website" : "Not connected"}
                  href={source.officialWebsite}
                />
              </dl>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
