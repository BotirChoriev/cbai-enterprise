import type { SearchIntelligenceRecord } from "@/lib/search-intelligence";

type SearchRelatedEvidenceProps = {
  record: SearchIntelligenceRecord;
};

export default function SearchRelatedEvidence({ record }: SearchRelatedEvidenceProps) {
  const preview = record.availableEvidence.slice(0, 10);

  return (
    <section className="space-y-6" aria-labelledby="search-related-evidence-heading">
      <div>
        <h3
          id="search-related-evidence-heading"
          className="text-sm font-semibold uppercase tracking-wider text-zinc-500"
        >
          Evidence &amp; Indicators
        </h3>
        <p className="mt-1 text-sm text-zinc-500">
          Gap records and framework indicators for this entity — counts only, no evaluative metrics.
        </p>
      </div>

      <div className="space-y-4">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-600">
          Evidence gaps ({record.availableEvidence.length})
        </h4>
        {preview.length === 0 ? (
          <p className="text-sm text-zinc-500">No evidence gap records.</p>
        ) : (
          <ul className="divide-y divide-zinc-800 rounded-xl border border-zinc-800 bg-zinc-950">
            {preview.map((entry) => (
              <li key={entry.indicatorId} className="px-5 py-3">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm text-zinc-200">{entry.indicatorName}</p>
                    <p className="font-mono text-[10px] text-zinc-600">{entry.indicatorId}</p>
                    <p className="mt-1 text-xs text-zinc-500">Source: {entry.expectedSource}</p>
                  </div>
                  <span className="shrink-0 text-xs text-zinc-400">{entry.gapStatus}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
        {record.availableEvidence.length > preview.length && (
          <p className="text-xs text-zinc-600">
            {record.availableEvidence.length - preview.length} additional gap record(s) on entity
            profile.
          </p>
        )}
      </div>

      <div className="space-y-4">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-600">
          Indicators ({record.availableIndicators.length})
        </h4>
        <ul className="grid gap-2 sm:grid-cols-2">
          {record.availableIndicators.slice(0, 8).map((entry) => (
            <li
              key={entry.indicatorId}
              className="rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3"
            >
              <p className="text-sm text-zinc-200">{entry.indicatorName}</p>
              <p className="mt-1 text-xs text-zinc-500">
                {entry.domain} · Explorer {entry.explorerCoverageStatus}
              </p>
            </li>
          ))}
        </ul>
      </div>

      {record.availableReports.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-600">
            Reports ({record.availableReports.length})
          </h4>
          <ul className="grid gap-2 sm:grid-cols-2">
            {record.availableReports.slice(0, 6).map((report) => (
              <li
                key={report.reportId}
                className="rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3"
              >
                <p className="text-sm text-zinc-200">{report.reportTitle}</p>
                <p className="mt-1 text-xs text-zinc-500">{report.availabilityLabel}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
