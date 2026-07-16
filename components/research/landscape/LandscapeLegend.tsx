import type { LandscapeObjectStatus } from "@/lib/research/landscape/landscape-types";
import { LANDSCAPE_STATUS_LABELS } from "@/lib/research/landscape/landscape-types";

function statusDotClass(status: LandscapeObjectStatus): string {
  switch (status) {
    case "catalog_available":
      return "bg-emerald-400";
    case "future_workspace":
      return "bg-teal-400";
    case "not_connected_yet":
      return "bg-zinc-500";
  }
}

export default function LandscapeLegend() {
  const entries: LandscapeObjectStatus[] = [
    "catalog_available",
    "not_connected_yet",
    "future_workspace",
  ];

  return (
    <div className="flex flex-wrap justify-center gap-3">
      {entries.map((status) => (
        <div key={status} className="flex items-center gap-2 text-[10px] text-zinc-500">
          <span className={`h-2 w-2 rounded-full ${statusDotClass(status)}`} aria-hidden="true" />
          {LANDSCAPE_STATUS_LABELS[status]}
        </div>
      ))}
    </div>
  );
}
