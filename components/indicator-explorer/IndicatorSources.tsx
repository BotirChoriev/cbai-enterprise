import type { IndicatorExplorerRecord } from "@/lib/indicator-explorer";
import { coverageStatusClass } from "@/lib/countries.coverage";

type IndicatorSourcesProps = {
  record: IndicatorExplorerRecord;
};

function mapConnectionLabel(status: string): "Connected" | "Planned" | "Not connected" {
  if (status === "connected") return "Connected";
  if (status === "planned") return "Planned";
  return "Not connected";
}

export default function IndicatorSources({ record }: IndicatorSourcesProps) {
  return (
    <section className="space-y-4" aria-labelledby="indicator-sources-heading">
      <div>
        <h4
          id="indicator-sources-heading"
          className="text-sm font-semibold uppercase tracking-wider text-zinc-500"
        >
          Official Sources &amp; Connectors
        </h4>
        <p className="mt-1 text-sm text-zinc-500">
          Evidence Infrastructure sources and planned connectors for this indicator.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
            Official sources
          </p>
          {record.officialSources.length === 0 ? (
            <p className="text-sm text-zinc-500">No official sources mapped.</p>
          ) : (
            <ul className="space-y-2">
              {record.officialSources.map((source) => (
                <li
                  key={source.sourceId}
                  className="rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-zinc-300">{source.sourceName}</p>
                    <span
                      className={`shrink-0 rounded-md border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${coverageStatusClass(mapConnectionLabel(source.connectionStatus))}`}
                    >
                      {mapConnectionLabel(source.connectionStatus)}
                    </span>
                  </div>
                  <p className="mt-1 font-mono text-[10px] text-zinc-600">{source.sourceId}</p>
                  {source.required && (
                    <p className="mt-1 text-[10px] text-zinc-500">Required source</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
            Planned connectors
          </p>
          {record.plannedConnectors.length === 0 ? (
            <p className="text-sm text-zinc-500">No connectors mapped.</p>
          ) : (
            <ul className="space-y-2">
              {record.plannedConnectors.map((connector) => (
                <li
                  key={connector.connectorId}
                  className="rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3"
                >
                  <p className="text-sm font-medium text-zinc-300">{connector.connectorName}</p>
                  <p className="mt-0.5 text-xs text-zinc-500">{connector.organization}</p>
                  <p className="mt-1 font-mono text-[10px] text-zinc-600">{connector.connectorId}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-wider text-violet-400">
                    {connector.status}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
