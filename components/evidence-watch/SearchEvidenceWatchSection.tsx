"use client";

import { useMemo } from "react";
import { getEvidenceWatchCatalog } from "@/lib/evidence-watch";
import EvidenceWatchSummary from "@/components/evidence-watch/EvidenceWatchSummary";
import EvidenceWatchLimitations from "@/components/evidence-watch/EvidenceWatchLimitations";

export default function SearchEvidenceWatchSection() {
  const catalog = useMemo(() => getEvidenceWatchCatalog(), []);

  return (
    <section className="space-y-6" aria-labelledby="search-evidence-watch-heading">
      <div>
        <h3
          id="search-evidence-watch-heading"
          className="text-sm font-semibold uppercase tracking-wider text-zinc-500"
        >
          Evidence Watch
        </h3>
        <p className="mt-1 text-sm text-zinc-500">
          Official evidence change records from platform registries — factual descriptions only.
        </p>
      </div>
      <EvidenceWatchSummary records={catalog.records} />
      <EvidenceWatchLimitations records={catalog.records} />
    </section>
  );
}
