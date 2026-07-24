"use client";

import Link from "next/link";
import { useTranslation } from "@/lib/i18n/use-translation";
import { useHydrated } from "@/lib/hooks/use-hydrated";
import { deriveMissionLifecycle } from "@/lib/intelligence-os/mission-lifecycle";
import type { Mission } from "@/lib/intelligence-os/mission.types";
import { translateMissionLifecycleNext } from "@/lib/i18n/mission-lifecycle-translation";
import { cbaiSectionEyebrow } from "@/components/brand/brand-classes";

type TimelineStage = "question" | "evidence" | "analysis" | "validation" | "impact" | "report";

const STAGE_LABEL: Record<TimelineStage, keyof typeof import("@/lib/i18n/platform-copy-build013-en").INTELLIGENCE_CANVAS_EN> = {
  question: "timelineQuestion",
  evidence: "timelineEvidence",
  analysis: "timelineAnalysis",
  validation: "timelineValidation",
  impact: "timelineImpact",
  report: "timelineReport",
};

const THREAD_MAP: Record<TimelineStage, "question" | "evidence" | "reasoning" | "collaborators" | "impact" | "report"> = {
  question: "question",
  evidence: "evidence",
  analysis: "reasoning",
  validation: "collaborators",
  impact: "impact",
  report: "report",
};

function stageHref(stage: TimelineStage, mission: Mission | null): string {
  if (!mission) return stage === "question" ? "/" : "/my-work";
  const q = mission.projectId ? `?project=${mission.projectId}` : "";
  switch (stage) {
    case "question":
      return `/my-work${q}#project-questions`;
    case "evidence":
      return `/my-work${q}#project-evidence`;
    case "analysis":
      return `/reasoning`;
    case "validation":
      return `/trust`;
    case "impact":
      return `/my-work${q}#human-impact`;
    case "report":
      return `/my-work${q}#project-report`;
    default:
      return "/my-work";
  }
}

const STATUS_COLOR: Record<string, string> = {
  complete: "bg-emerald-500/80",
  partial: "bg-amber-500/70",
  missing: "bg-zinc-600/60",
  blocked: "bg-[var(--gold)]/70",
};

export default function CanvasMissionTimeline({ mission }: { mission: Mission | null }) {
  const { t } = useTranslation();
  const hydrated = useHydrated();
  const lifecycle = hydrated ? deriveMissionLifecycle(mission) : [];
  const stages: TimelineStage[] = ["question", "evidence", "analysis", "validation", "impact", "report"];

  return (
    <footer
      className="cbai-mission-timeline border-t border-zinc-800/80 bg-[var(--surface)]/30 px-4 py-3"
      aria-label={t("missionThread.eyebrow")}
    >
      <p className={`${cbaiSectionEyebrow} mb-2`}>{t("missionThread.eyebrow")}</p>
      <ol className="flex gap-1 overflow-x-auto pb-1">
        {stages.map((stage) => {
          const node = lifecycle.find((n) => n.stage === THREAD_MAP[stage]);
          const status = node?.status ?? "missing";
          const nextLabel = node
            ? translateMissionLifecycleNext(t, node.nextActionKey, node.nextAction)
            : t("intelligenceCanvas.openStage");
          return (
            <li key={stage} className="min-w-[5.5rem] flex-1">
              <Link
                href={node?.href ?? stageHref(stage, mission)}
                className="group flex flex-col items-center gap-1 rounded-md px-1 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/40"
                aria-label={`${t(`intelligenceCanvas.${STAGE_LABEL[stage]}`)} — ${nextLabel}`}
              >
                <span className={`h-1.5 w-full max-w-[3rem] rounded-full ${STATUS_COLOR[status] ?? STATUS_COLOR.missing}`} />
                <span className="text-[9px] font-medium uppercase tracking-wider text-zinc-600 group-hover:text-teal-400/80">
                  {t(`intelligenceCanvas.${STAGE_LABEL[stage]}`)}
                </span>
                <span className="line-clamp-2 max-w-[6rem] text-center text-[10px] leading-tight text-zinc-500 group-hover:text-zinc-400">
                  {node?.label ?? "—"}
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </footer>
  );
}
