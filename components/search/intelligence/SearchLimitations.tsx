import type { SearchIntelligenceRecord } from "@/lib/search-intelligence";

type SearchLimitationsProps = {
  record: SearchIntelligenceRecord;
};

export default function SearchLimitations({ record }: SearchLimitationsProps) {
  return (
    <section className="space-y-6" aria-labelledby="search-limitations-heading">
      <div>
        <h3
          id="search-limitations-heading"
          className="text-sm font-semibold uppercase tracking-wider text-zinc-500"
        >
          Decision Readiness &amp; Limitations
        </h3>
        <p className="mt-1 text-sm text-zinc-500">
          Decision Intelligence templates and constitutional limits for this search result.
        </p>
      </div>

      {record.availableTimeline && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Timeline</p>
          <p className="mt-2 text-sm text-zinc-300">
            {record.availableTimeline.readinessLabel}
          </p>
          {record.availableTimeline.timelineId && (
            <p className="mt-1 font-mono text-[10px] text-zinc-600">
              {record.availableTimeline.timelineId}
            </p>
          )}
        </div>
      )}

      {record.availableDecisionContexts.length > 0 && (
        <ul className="divide-y divide-zinc-800 rounded-xl border border-zinc-800 bg-zinc-950">
          {record.availableDecisionContexts.map((context) => (
            <li key={context.templateSlug} className="px-5 py-4">
              <p className="text-sm font-medium text-zinc-200">{context.title}</p>
              <p className="mt-1 text-xs text-zinc-500">
                {context.templateSlug} · {context.readinessLabel}
              </p>
            </li>
          ))}
        </ul>
      )}

      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-amber-400/80">
          Human review required
        </p>
        <ul className="mt-3 space-y-2">
          {record.limitations.map((limitation) => (
            <li key={limitation} className="text-sm text-zinc-400">
              {limitation}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
