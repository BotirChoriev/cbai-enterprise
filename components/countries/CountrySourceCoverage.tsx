import type { CountrySourceCoverageItem } from "@/lib/countries.coverage";
import { coverageStatusClass } from "@/lib/countries.coverage";
import { cbaiGlassCard } from "@/components/brand/brand-classes";

type CountrySourceCoverageProps = {
  sources: readonly CountrySourceCoverageItem[];
};

const NOT_ASSESSED = "Not assessed";
const NOT_AVAILABLE = "Not available";

function EvidenceField({ label, value, href }: { label: string; value: string; href?: string | null }) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-wider text-zinc-600">{label}</dt>
      <dd className="mt-0.5 text-xs text-zinc-300">
        {href ? (
          <a href={href} target="_blank" rel="noopener noreferrer" className="text-teal-400 underline-offset-2 hover:underline">
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
 * Evidence detail per official source — the full field set the mission asks for (Source,
 * Publisher, Publication date, Confidence, Citation, Open source link). Publication date,
 * citation, and confidence do not exist as real data anywhere in this platform today — shown
 * honestly as "Not assessed"/"Not available" rather than invented.
 */
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

      <div className={`${cbaiGlassCard} overflow-hidden`}>
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
