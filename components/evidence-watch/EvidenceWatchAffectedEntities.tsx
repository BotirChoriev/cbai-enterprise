import type { EvidenceWatchRecord } from "@/lib/evidence-watch";

type EvidenceWatchAffectedEntitiesProps = {
  record: EvidenceWatchRecord;
};

export default function EvidenceWatchAffectedEntities({
  record,
}: EvidenceWatchAffectedEntitiesProps) {
  return (
    <section className="space-y-4" aria-labelledby="evidence-watch-entities-heading">
      <div>
        <h4
          id="evidence-watch-entities-heading"
          className="text-xs font-semibold uppercase tracking-wider text-zinc-600"
        >
          Affected Entities ({record.entityIds.length})
        </h4>
        <p className="mt-1 text-sm text-zinc-500">
          Registry entities linked to affected indicators — no impact interpretation.
        </p>
      </div>

      {record.entityIds.length === 0 ? (
        <p className="text-sm text-zinc-500">No entities mapped.</p>
      ) : (
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {record.entityIds.slice(0, 12).map((entityId) => (
            <li
              key={entityId}
              className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 font-mono text-[11px] text-zinc-400"
            >
              {entityId}
            </li>
          ))}
        </ul>
      )}
      {record.entityIds.length > 12 && (
        <p className="text-xs text-zinc-600">
          {record.entityIds.length - 12} additional entity ID(s) in catalog.
        </p>
      )}
    </section>
  );
}
