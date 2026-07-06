import StatusBadge from "@/components/platform/home/StatusBadge";
import {
  ROADMAP_TIMELINE,
  mapTimelineToBadgeStatus,
} from "@/lib/platform-home";

export default function HomeRoadmapTimeline() {
  return (
    <ol className="relative space-y-0 border-l border-zinc-800 pl-6 sm:pl-8">
      {ROADMAP_TIMELINE.map((phase, index) => (
        <li key={phase.id} className="relative pb-10 last:pb-0">
          <span
            className="absolute -left-[1.625rem] top-1.5 flex h-3 w-3 rounded-full border-2 border-zinc-700 bg-zinc-950 sm:-left-[2.125rem]"
            aria-hidden="true"
          />
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-zinc-600">
                  Phase {index + 1}
                </p>
                <h3 className="mt-1 text-base font-semibold text-zinc-100">
                  {phase.title}
                </h3>
              </div>
              <StatusBadge status={mapTimelineToBadgeStatus(phase.status)} />
            </div>
            <p className="mt-3 text-sm leading-relaxed text-zinc-500">
              {phase.note}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
