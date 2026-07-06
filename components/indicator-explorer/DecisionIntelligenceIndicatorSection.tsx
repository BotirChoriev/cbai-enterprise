"use client";

import { useState } from "react";
import { getDecisionIntelligenceIndicatorRecords } from "@/lib/indicator-explorer";
import IndicatorExplorerPanel, {
  IndicatorExploreLink,
} from "@/components/indicator-explorer/IndicatorExplorerPanel";

export default function DecisionIntelligenceIndicatorSection() {
  const records = getDecisionIntelligenceIndicatorRecords();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <section className="space-y-4" aria-labelledby="decision-intelligence-indicators-heading">
        <div>
          <h3
            id="decision-intelligence-indicators-heading"
            className="text-sm font-semibold uppercase tracking-wider text-zinc-500"
          >
            Decision Intelligence Indicators
          </h3>
          <p className="mt-1 text-sm text-zinc-500">
            Indicators referenced by Decision Intelligence templates — explore methodology and
            evidence dependencies before human review.
          </p>
        </div>

        <ul className="grid gap-2 sm:grid-cols-2">
          {records.map((record) => (
            <li
              key={record.indicatorId}
              className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3"
            >
              <div>
                <p className="text-sm font-medium text-zinc-300">{record.indicatorName}</p>
                <p className="font-mono text-[10px] text-zinc-600">{record.indicatorId}</p>
              </div>
              <IndicatorExploreLink
                indicatorId={record.indicatorId}
                indicatorName={record.indicatorName}
                onExplore={setSelectedId}
              />
            </li>
          ))}
        </ul>
      </section>

      <IndicatorExplorerPanel initialIndicatorId={selectedId} variant="embedded" />
    </div>
  );
}
