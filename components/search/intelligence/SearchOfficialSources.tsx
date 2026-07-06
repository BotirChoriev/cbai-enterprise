import type { SearchIntelligenceRecord } from "@/lib/search-intelligence";

type SearchOfficialSourcesProps = {
  record: SearchIntelligenceRecord;
};

export default function SearchOfficialSources({ record }: SearchOfficialSourcesProps) {
  return (
    <section className="space-y-4" aria-labelledby="search-official-sources-heading">
      <div>
        <h3
          id="search-official-sources-heading"
          className="text-sm font-semibold uppercase tracking-wider text-zinc-500"
        >
          Official Sources
        </h3>
        <p className="mt-1 text-sm text-zinc-500">
          Evidence Infrastructure sources linked to applicable indicators.
        </p>
      </div>

      {record.officialSources.length === 0 ? (
        <p className="text-sm text-zinc-500">No official sources mapped.</p>
      ) : (
        <ul className="divide-y divide-zinc-800 rounded-xl border border-zinc-800 bg-zinc-950">
          {record.officialSources.map((source) => (
            <li key={source.sourceId} className="px-5 py-4">
              <p className="text-sm font-medium text-zinc-200">{source.sourceName}</p>
              <p className="mt-1 font-mono text-[10px] text-zinc-600">{source.sourceId}</p>
              <div className="mt-2 flex flex-wrap gap-3 text-xs text-zinc-500">
                <span>Connection: {source.connectionStatus}</span>
                <span>Verification: {source.verificationStatus}</span>
                <span>{source.indicatorCount} indicator link(s)</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
