import type { CountryTimelineModel } from "@/lib/timeline";
import { coverageStatusClass } from "@/lib/countries.coverage";

type TimelineSourcesProps = {
  model: CountryTimelineModel;
};

function mapConnectionToLabel(
  status: "connected" | "planned" | "deprecated",
): "Connected" | "Planned" | "Not connected" {
  if (status === "connected") return "Connected";
  if (status === "planned") return "Planned";
  return "Not connected";
}

export default function TimelineSources({ model }: TimelineSourcesProps) {
  return (
    <section className="space-y-4" aria-labelledby="timeline-sources-heading">
      <div>
        <h4
          id="timeline-sources-heading"
          className="text-sm font-semibold uppercase tracking-wider text-zinc-500"
        >
          Official Source Coverage
        </h4>
        <p className="mt-1 text-sm text-zinc-500">
          Official evidence sources referenced for time-series coverage — connection status only.
        </p>
      </div>

      <ul className="grid gap-2 sm:grid-cols-2">
        {model.officialSources.map((source) => {
          const statusLabel = mapConnectionToLabel(source.connectionStatus);
          return (
            <li
              key={source.sourceId}
              className="rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium text-zinc-300">{source.sourceName}</p>
                <span
                  className={`shrink-0 rounded-md border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${coverageStatusClass(statusLabel)}`}
                >
                  {statusLabel}
                </span>
              </div>
              <p className="mt-1 font-mono text-[10px] text-zinc-600">{source.sourceId}</p>
              <p className="mt-1 text-xs text-zinc-500">
                Verification: {source.verificationStatus.replace(/_/g, " ")}
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
