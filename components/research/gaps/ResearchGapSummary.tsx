import type { ResearchGapStatus } from "@/lib/research/gaps/research-gap-types";
import { RESEARCH_GAP_STATUS_LABELS } from "@/lib/research/gaps/research-gap-types";

type ResearchGapSummaryProps = {
  catalogOnlyCount: number;
  notConnectedCount: number;
  futureWorkspaceCount: number;
  catalogAvailable: readonly string[];
  compact?: boolean;
};

function statusClass(status: ResearchGapStatus): string {
  switch (status) {
    case "available_catalog_only":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
    case "future_workspace":
      return "border-teal-500/25 bg-teal-500/5 text-teal-300";
    case "not_connected_yet":
      return "border-zinc-700 bg-zinc-900/60 text-zinc-400";
  }
}

export default function ResearchGapSummary({
  catalogOnlyCount,
  notConnectedCount,
  futureWorkspaceCount,
  catalogAvailable,
  compact = false,
}: ResearchGapSummaryProps) {
  const statusEntries: { status: ResearchGapStatus; count: number }[] = [
    { status: "available_catalog_only", count: catalogOnlyCount },
    { status: "not_connected_yet", count: notConnectedCount },
    { status: "future_workspace", count: futureWorkspaceCount },
  ];

  return (
    <div className={`space-y-3 ${compact ? "text-xs" : "text-sm"}`}>
      <div className="flex flex-wrap gap-2">
        {statusEntries.map((entry) => (
          <span
            key={entry.status}
            className={`rounded border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${statusClass(entry.status)}`}
          >
            {RESEARCH_GAP_STATUS_LABELS[entry.status]} · {entry.count}
          </span>
        ))}
      </div>

      <div>
        <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
          Catalog information available
        </p>
        <ul className="mt-2 space-y-1">
          {catalogAvailable.map((item) => (
            <li key={item} className="flex items-start gap-2 text-xs text-zinc-400">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-400/80" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
