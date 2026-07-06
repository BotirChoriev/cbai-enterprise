import type { EvidenceWatchRecord } from "@/lib/evidence-watch";

type EvidenceWatchLimitationsProps = {
  records: readonly EvidenceWatchRecord[];
};

export default function EvidenceWatchLimitations({ records }: EvidenceWatchLimitationsProps) {
  const limitations = records[0]?.limitations ?? [];

  return (
    <section className="space-y-4" aria-labelledby="evidence-watch-limitations-heading">
      <div>
        <h3
          id="evidence-watch-limitations-heading"
          className="text-sm font-semibold uppercase tracking-wider text-zinc-500"
        >
          Limitations
        </h3>
        <p className="mt-1 text-sm text-zinc-500">
          Constitutional boundaries — not notification delivery or live monitoring.
        </p>
      </div>

      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-amber-400/80">
          Human review required
        </p>
        <ul className="mt-3 space-y-2">
          {limitations.map((limitation) => (
            <li key={limitation} className="text-sm text-zinc-400">
              {limitation}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
