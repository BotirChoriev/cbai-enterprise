import type { EvidenceWatchRecord } from "@/lib/evidence-watch";

type EvidenceWatchMethodologyProps = {
  record: EvidenceWatchRecord;
};

export default function EvidenceWatchMethodology({ record }: EvidenceWatchMethodologyProps) {
  const methodology = record.methodologyReference;

  return (
    <section className="space-y-4" aria-labelledby="evidence-watch-methodology-heading">
      <div>
        <h4
          id="evidence-watch-methodology-heading"
          className="text-xs font-semibold uppercase tracking-wider text-zinc-600"
        >
          Methodology Reference
        </h4>
        <p className="mt-1 text-sm text-zinc-500">
          Standard reference for this change — not an interpretation of meaning.
        </p>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-5 py-4">
        <dl className="space-y-3">
          <div>
            <dt className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
              Standard reference
            </dt>
            <dd className="mt-1 font-mono text-xs text-zinc-400">
              {methodology.standardReference}
            </dd>
          </div>
          <div>
            <dt className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
              Description
            </dt>
            <dd className="mt-1 text-sm text-zinc-300">{methodology.description}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
              Registry version
            </dt>
            <dd className="mt-1 text-sm text-zinc-300">{methodology.registryVersion}</dd>
          </div>
        </dl>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
            Affected indicators
          </p>
          <p className="mt-1 text-sm text-zinc-300">{record.indicatorIds.length}</p>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
            Affected missions
          </p>
          <p className="mt-1 text-sm text-zinc-300">{record.affectedMissions.length}</p>
        </div>
      </div>
    </section>
  );
}
