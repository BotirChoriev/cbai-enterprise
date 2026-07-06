"use client";

import { useState } from "react";
import { getIndicatorExplorerCatalog } from "@/lib/indicator-explorer";
import IndicatorExplorerPanel, {
  IndicatorExploreLink,
} from "@/components/indicator-explorer/IndicatorExplorerPanel";

export default function ReportsIndicatorExplorerSection() {
  const catalog = getIndicatorExplorerCatalog();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const reportLinked = catalog.indicators.filter(
    (indicator) => indicator.supportedReports.length > 0,
  );

  return (
    <div className="space-y-6">
      <section className="space-y-4" aria-labelledby="reports-indicator-explorer-heading">
        <div>
          <h3
            id="reports-indicator-explorer-heading"
            className="text-sm font-semibold uppercase tracking-wider text-zinc-500"
          >
            Report Indicator Dependencies
          </h3>
          <p className="mt-1 text-sm text-zinc-500">
            Indicators consumed by report types — explore definitions and evidence requirements.
          </p>
        </div>

        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {reportLinked.slice(0, 12).map((record) => (
            <li
              key={record.indicatorId}
              className="rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3"
            >
              <p className="text-sm font-medium text-zinc-300">{record.indicatorName}</p>
              <p className="mt-1 text-[10px] text-zinc-600">
                {record.supportedReports.length} report type(s)
              </p>
              <div className="mt-2">
                <IndicatorExploreLink
                  indicatorId={record.indicatorId}
                  indicatorName={record.indicatorName}
                  onExplore={setSelectedId}
                />
              </div>
            </li>
          ))}
        </ul>
      </section>

      <IndicatorExplorerPanel initialIndicatorId={selectedId} variant="embedded" />
    </div>
  );
}
