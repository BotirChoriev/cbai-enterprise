import {
  changeTypeClass,
  changeTypeLabel,
  getEvidenceWatchCatalog,
} from "@/lib/evidence-watch";
import type { EvidenceWatchRecord } from "@/lib/evidence-watch";

type EvidenceWatchSummaryProps = {
  records: readonly EvidenceWatchRecord[];
};

export default function EvidenceWatchSummary({ records }: EvidenceWatchSummaryProps) {
  const catalog = getEvidenceWatchCatalog();
  const byType = catalog.byChangeType;

  const counts = [
    { label: "Total watch records", value: records.length },
    {
      label: "Source connected",
      value: byType.new_source_connected.length,
    },
    {
      label: "Connector verified",
      value: byType.connector_verified.length,
    },
    {
      label: "Methodology updated",
      value: byType.methodology_updated.length,
    },
  ];

  return (
    <section className="space-y-4" aria-labelledby="evidence-watch-summary-heading">
      <div>
        <h3
          id="evidence-watch-summary-heading"
          className="text-sm font-semibold uppercase tracking-wider text-zinc-500"
        >
          Evidence Watch Summary
        </h3>
        <p className="mt-1 text-sm text-zinc-500">
          Registry-derived change records — snapshot at {catalog.registrySnapshotAt}.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {counts.map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3"
          >
            <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
              {item.label}
            </p>
            <p className="mt-1 text-xl font-semibold text-zinc-100">{item.value}</p>
          </div>
        ))}
      </div>

      <ul className="divide-y divide-zinc-800 rounded-xl border border-zinc-800 bg-zinc-950">
        {records.slice(0, 8).map((record) => (
          <li key={record.watchId} className="px-5 py-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-200">
                  {record.methodologyReference.description}
                </p>
                <p className="mt-1 font-mono text-[10px] text-zinc-600">{record.watchId}</p>
                <p className="mt-1 text-xs text-zinc-500">
                  Source {record.sourceId} · {record.changeTimestamp}
                </p>
              </div>
              <span
                className={`shrink-0 rounded-md border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${changeTypeClass(record.changeType)}`}
              >
                {changeTypeLabel(record.changeType)}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
