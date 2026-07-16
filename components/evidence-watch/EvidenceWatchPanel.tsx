"use client";

import { useMemo, useState } from "react";
import { changeTypeLabel, getEvidenceWatchCatalog } from "@/lib/evidence-watch";
import EvidenceWatchSummary from "@/components/evidence-watch/EvidenceWatchSummary";
import EvidenceWatchAffectedEntities from "@/components/evidence-watch/EvidenceWatchAffectedEntities";
import EvidenceWatchMethodology from "@/components/evidence-watch/EvidenceWatchMethodology";
import EvidenceWatchLimitations from "@/components/evidence-watch/EvidenceWatchLimitations";

export default function EvidenceWatchPanel() {
  const catalog = useMemo(() => getEvidenceWatchCatalog(), []);
  const [selectedWatchId, setSelectedWatchId] = useState<string>(
    catalog.records[0]?.watchId ?? "",
  );

  const selectedRecord =
    catalog.records.find((record) => record.watchId === selectedWatchId) ?? null;

  return (
    <div className="space-y-10">
      <section className="space-y-4" aria-labelledby="evidence-watch-heading">
        <div>
          <h3
            id="evidence-watch-heading"
            className="text-sm font-semibold uppercase tracking-wider text-zinc-500"
          >
            Evidence Watch
          </h3>
          <p className="mt-1 text-sm text-zinc-500">
            Track official evidence availability changes from registries — not predictions,
            user activity monitoring, or notification delivery.
          </p>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-5 py-4">
          <label htmlFor="evidence-watch-select" className="block text-sm font-medium text-zinc-300">
            Select watch record
          </label>
          <select
            id="evidence-watch-select"
            value={selectedWatchId}
            onChange={(event) => setSelectedWatchId(event.target.value)}
            className="mt-3 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 outline-none focus:border-teal-500/40 focus:ring-1 focus:ring-teal-500/20"
          >
            {catalog.records.map((record) => (
              <option key={record.watchId} value={record.watchId}>
                {changeTypeLabel(record.changeType)} · {record.sourceId}
              </option>
            ))}
          </select>
        </div>
      </section>

      <EvidenceWatchSummary records={catalog.records} />

      {selectedRecord && (
        <div className="space-y-8 rounded-xl border border-zinc-800 bg-zinc-950/40 px-6 py-6">
          <EvidenceWatchMethodology record={selectedRecord} />
          <EvidenceWatchAffectedEntities record={selectedRecord} />
        </div>
      )}

      <EvidenceWatchLimitations records={catalog.records} />
    </div>
  );
}
