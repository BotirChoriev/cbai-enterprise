import type { SearchIntelligenceRecord } from "@/lib/search-intelligence";
import { entityTypeLabel } from "@/lib/search-intelligence";

type SearchResultOverviewProps = {
  record: SearchIntelligenceRecord;
};

export default function SearchResultOverview({ record }: SearchResultOverviewProps) {
  const availableEvidenceCount = record.availableEvidence.filter(
    (entry) => entry.gapStatus === "Available",
  ).length;

  return (
    <section className="space-y-4" aria-labelledby="search-result-overview-heading">
      <div>
        <h3
          id="search-result-overview-heading"
          className="text-sm font-semibold uppercase tracking-wider text-zinc-500"
        >
          Overview
        </h3>
        <p className="mt-1 text-sm text-zinc-500">
          Registry-backed navigation profile — not AI answers or recommendations.
        </p>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-5 py-4">
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
              Display name
            </dt>
            <dd className="mt-1 text-sm font-semibold text-zinc-100">{record.displayName}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
              Entity type
            </dt>
            <dd className="mt-1 text-sm text-zinc-300">{entityTypeLabel(record.entityType)}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
              Entity ID
            </dt>
            <dd className="mt-1 font-mono text-xs text-zinc-400">{record.entityId}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
              Evidence gaps available
            </dt>
            <dd className="mt-1 text-sm text-zinc-300">
              {availableEvidenceCount} / {record.availableEvidence.length}
            </dd>
          </div>
          <div>
            <dt className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
              Indicators
            </dt>
            <dd className="mt-1 text-sm text-zinc-300">{record.availableIndicators.length}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
              Comparison targets
            </dt>
            <dd className="mt-1 text-sm text-zinc-300">
              {record.availableComparisons.length}
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
