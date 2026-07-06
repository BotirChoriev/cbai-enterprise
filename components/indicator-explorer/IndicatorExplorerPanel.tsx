"use client";

import { useMemo, useState } from "react";
import { getIndicatorExplorerCatalog } from "@/lib/indicator-explorer";
import type { IndicatorExplorerRecord } from "@/lib/indicator-explorer";
import IndicatorDefinitionCard from "@/components/indicator-explorer/IndicatorDefinitionCard";
import IndicatorMethodology from "@/components/indicator-explorer/IndicatorMethodology";
import IndicatorSources from "@/components/indicator-explorer/IndicatorSources";
import IndicatorDependencies from "@/components/indicator-explorer/IndicatorDependencies";
import IndicatorCoverage from "@/components/indicator-explorer/IndicatorCoverage";

type IndicatorExplorerPanelProps = {
  /** Pre-selected indicator ID */
  initialIndicatorId?: string | null;
  /** Compact mode hides domain selector header */
  variant?: "full" | "embedded";
};

export default function IndicatorExplorerPanel({
  initialIndicatorId = null,
  variant = "full",
}: IndicatorExplorerPanelProps) {
  const catalog = useMemo(() => getIndicatorExplorerCatalog(), []);
  const defaultId = catalog.indicators[0]?.indicatorId ?? "";
  const [manualId, setManualId] = useState<string | null>(null);
  const [trackedExternalId, setTrackedExternalId] = useState(initialIndicatorId);

  if (initialIndicatorId !== trackedExternalId) {
    setTrackedExternalId(initialIndicatorId);
    setManualId(null);
  }

  const selectedId = manualId ?? initialIndicatorId ?? defaultId;

  const record: IndicatorExplorerRecord | null =
    catalog.indicators.find((item) => item.indicatorId === selectedId) ?? null;

  return (
    <section className="space-y-6" aria-labelledby="indicator-explorer-heading">
      {variant === "full" && (
        <div>
          <h3
            id="indicator-explorer-heading"
            className="text-sm font-semibold uppercase tracking-wider text-zinc-500"
          >
            Indicator Explorer
          </h3>
          <p className="mt-1 text-sm text-zinc-500">
            Every indicator explains itself — definition, methodology, sources, connectors, and
            dependencies. Not analytics, scoring, or prediction.
          </p>
        </div>
      )}

      <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-5 py-4">
        <label htmlFor="indicator-explorer-select" className="block text-sm font-medium text-zinc-300">
          Select indicator
        </label>
        <select
          id="indicator-explorer-select"
          value={selectedId}
          onChange={(e) => setManualId(e.target.value)}
          className="mt-3 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 outline-none focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/20"
        >
          {catalog.indicators.map((indicator) => (
            <option key={indicator.indicatorId} value={indicator.indicatorId}>
              {indicator.indicatorName} · {indicator.domain}
            </option>
          ))}
        </select>
      </div>

      {record ? (
        <>
          <IndicatorDefinitionCard record={record} />
          <IndicatorMethodology record={record} />
          <IndicatorSources record={record} />
          <IndicatorDependencies record={record} />
          <IndicatorCoverage record={record} />
        </>
      ) : (
        <p className="text-sm text-zinc-500">Indicator not found in catalog.</p>
      )}
    </section>
  );
}

type IndicatorExploreLinkProps = {
  indicatorId: string;
  indicatorName: string;
  onExplore?: (indicatorId: string) => void;
};

export function IndicatorExploreLink({
  indicatorId,
  indicatorName,
  onExplore,
}: IndicatorExploreLinkProps) {
  return (
    <button
      type="button"
      onClick={() => onExplore?.(indicatorId)}
      className="text-xs text-cyan-400 underline-offset-2 hover:underline"
      aria-label={`Explore indicator ${indicatorName}`}
    >
      Explore indicator
    </button>
  );
}
