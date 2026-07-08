import type { LandscapeCenterTopic } from "@/lib/research/landscape/landscape-types";
import { LANDSCAPE_STATUS_LABELS } from "@/lib/research/landscape/landscape-types";
import { cbaiGlassCard } from "@/components/brand/brand-classes";

type LandscapeCenterProps = {
  centerTopic: LandscapeCenterTopic;
  compact?: boolean;
};

function statusClass(status: LandscapeCenterTopic["status"]): string {
  switch (status) {
    case "catalog_available":
      return "border-emerald-500/40 bg-emerald-500/10 text-emerald-300";
    case "future_workspace":
      return "border-cyan-500/40 bg-cyan-500/10 text-cyan-300";
    case "not_connected_yet":
      return "border-zinc-700 bg-zinc-900/60 text-zinc-400";
  }
}

export default function LandscapeCenter({ centerTopic, compact = false }: LandscapeCenterProps) {
  return (
    <div className="relative flex flex-col items-center">
      <div
        className="pointer-events-none absolute inset-0 -z-10 rounded-full bg-cyan-500/10 blur-3xl"
        aria-hidden="true"
      />
      <div
        className={`${cbaiGlassCard} relative w-full max-w-md border-cyan-500/30 bg-gradient-to-b from-cyan-500/10 to-transparent text-center shadow-[0_0_40px_rgba(34,211,238,0.08)] ${compact ? "p-4" : "p-6"}`}
      >
        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-cyan-400/90">
          Research topic
        </p>
        <h3 className={`mt-2 font-semibold text-zinc-100 ${compact ? "text-lg" : "text-2xl"}`}>
          {centerTopic.topicName}
        </h3>
        <p className="mt-1 text-xs text-cyan-300/80">{centerTopic.domain}</p>
        {!compact ? (
          <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-zinc-500">
            {centerTopic.description}
          </p>
        ) : null}
        <span
          className={`mt-4 inline-flex rounded-full border px-3 py-1 text-[10px] font-medium uppercase tracking-wider ${statusClass(centerTopic.status)}`}
        >
          {LANDSCAPE_STATUS_LABELS[centerTopic.status]}
        </span>
      </div>
    </div>
  );
}
