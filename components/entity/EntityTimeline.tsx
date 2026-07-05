import type { EntityComponentProps } from "@/lib/entity/entity.types";
import {
  timelineTypeColors,
  timelineTypeIconPaths,
} from "@/lib/entity/entity.icons";
import EntityIcon from "@/components/entity/EntityIcon";

export default function EntityTimeline({ entity }: EntityComponentProps) {
  if (entity.timeline.length === 0) return null;

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950">
      <div className="border-b border-zinc-800 px-6 py-4">
        <h3 className="text-sm font-semibold text-zinc-50">Timeline</h3>
        <p className="text-xs text-zinc-500">Activity & event history</p>
      </div>

      <div className="relative px-6 py-5">
        <div
          aria-hidden="true"
          className="absolute left-[2.375rem] top-8 bottom-8 w-px bg-zinc-800"
        />

        <ul className="space-y-4">
          {entity.timeline.map((event) => {
            const type = event.type ?? "update";
            const colorClass =
              timelineTypeColors[type] ?? timelineTypeColors.update;

            return (
              <li key={event.id} className="relative flex gap-4">
                <div
                  className={`relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border ${colorClass}`}
                >
                  <EntityIcon
                    path={
                      timelineTypeIconPaths[type] ??
                      timelineTypeIconPaths.update
                    }
                    className="h-3.5 w-3.5"
                  />
                </div>
                <div className="min-w-0 flex-1 pb-1">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-medium text-zinc-200">
                      {event.title}
                    </p>
                    <span className="shrink-0 font-mono text-[10px] text-zinc-600">
                      {event.date}
                    </span>
                  </div>
                  {event.description && (
                    <p className="mt-0.5 text-xs text-zinc-500">
                      {event.description}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
