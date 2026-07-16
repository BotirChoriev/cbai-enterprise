import { TIMELINE_STAGE_STATUS_LABELS, type TimelineStageStatus } from "@/lib/research/timeline/timeline-types";

const STATUSES: TimelineStageStatus[] = [
  "catalog_available",
  "future_workspace",
  "not_connected_yet",
];

function statusDotClass(status: TimelineStageStatus): string {
  switch (status) {
    case "catalog_available":
      return "bg-emerald-400";
    case "future_workspace":
      return "bg-teal-400";
    case "not_connected_yet":
      return "bg-zinc-500";
  }
}

export default function TimelineLegend() {
  return (
    <div>
      <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
        Timeline legend
      </p>
      <ul className="mt-2 flex flex-wrap gap-4">
        {STATUSES.map((status) => (
          <li key={status} className="flex items-center gap-2 text-xs text-zinc-500">
            <span className={`h-1.5 w-1.5 rounded-full ${statusDotClass(status)}`} />
            {TIMELINE_STAGE_STATUS_LABELS[status]}
          </li>
        ))}
      </ul>
    </div>
  );
}
