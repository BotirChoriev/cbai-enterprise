import type { KnowledgeTimelineStage, TimelineStageId, TimelineStageStatus } from "@/lib/research/timeline/timeline-types";
import { TIMELINE_STAGE_STATUS_LABELS } from "@/lib/research/timeline/timeline-types";
import { cbaiGlassCard } from "@/components/brand/brand-classes";

const STAGE_ICONS: Record<TimelineStageId, string> = {
  research_topic: "◎",
  current_knowledge: "◈",
  methods: "⚗",
  evidence: "▣",
  open_questions: "?",
  future_evidence: "◇",
  research_workspace: "⬡",
};

function statusBadgeClass(status: TimelineStageStatus): string {
  switch (status) {
    case "catalog_available":
      return "border-emerald-500/35 bg-emerald-500/10 text-emerald-300";
    case "future_workspace":
      return "border-cyan-500/25 bg-cyan-500/5 text-cyan-300";
    case "not_connected_yet":
      return "border-zinc-700 bg-zinc-900/60 text-zinc-400";
  }
}

type TimelineStageProps = {
  stage: KnowledgeTimelineStage;
};

export default function TimelineStage({ stage }: TimelineStageProps) {
  return (
    <article className={`${cbaiGlassCard} flex gap-3 p-4`}>
      <span
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-cyan-500/25 bg-cyan-500/10 text-sm text-cyan-300"
        aria-hidden="true"
      >
        {STAGE_ICONS[stage.stageId]}
      </span>
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
              Stage {stage.stageNumber}
            </p>
            <h3 className="text-sm font-semibold text-zinc-100">{stage.title}</h3>
          </div>
          <span
            className={`shrink-0 rounded-md border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${statusBadgeClass(stage.status)}`}
          >
            {TIMELINE_STAGE_STATUS_LABELS[stage.status]}
          </span>
        </div>
        <p className="text-xs text-cyan-400/80">{stage.purpose}</p>
        <p className="text-xs leading-relaxed text-zinc-500">{stage.description}</p>
        <p className="text-[11px] leading-relaxed text-zinc-600">{stage.explanation}</p>
      </div>
    </article>
  );
}
