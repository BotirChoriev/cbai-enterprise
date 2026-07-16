"use client";

import Link from "next/link";
import { useTranslation } from "@/lib/i18n/use-translation";
import { cbaiMineralSurface, cbaiSectionEyebrow } from "@/components/brand/brand-classes";
import type { Mission } from "@/lib/intelligence-os/mission.types";
import { deriveMissionThread } from "@/lib/intelligence-os/mission-engine";
import type { MissionThreadStage } from "@/lib/intelligence-os/mission.types";

const STAGE_KEYS: Record<MissionThreadStage, keyof typeof import("@/lib/i18n/platform-copy-build011-en").MISSION_THREAD_EN> = {
  mission: "mission",
  question: "question",
  evidence: "evidence",
  reasoning: "reasoning",
  collaborators: "collaborators",
  report: "report",
  impact: "impact",
};

const STAGE_UI_KEYS: Record<MissionThreadStage, keyof typeof import("@/lib/i18n/platform-copy-build012-en").MISSION_THREAD_BUILD012_EN> = {
  mission: "stageMission",
  question: "stageQuestion",
  evidence: "stageEvidence",
  reasoning: "stageReasoning",
  collaborators: "stageCollaborators",
  report: "stageReport",
  impact: "stageImpact",
};

const STATUS_COLOR: Record<string, string> = {
  complete: "bg-emerald-500/80",
  partial: "bg-amber-500/70",
  missing: "bg-zinc-600/60",
  blocked: "bg-[var(--gold)]/70",
};

function resolveStageHref(stage: MissionThreadStage, mission: Mission | null): string {
  if (!mission) {
    return stage === "mission" ? "/" : "/my-work";
  }
  const projectQuery = mission.projectId ? `?project=${mission.projectId}` : "";
  switch (stage) {
    case "mission":
      return "/";
    case "question":
      return `/my-work${projectQuery}#project-questions`;
    case "evidence":
      return `/my-work${projectQuery}#project-evidence`;
    case "reasoning":
      return `/reasoning`;
    case "collaborators":
      return `/my-work${projectQuery}`;
    case "report":
      return `/my-work${projectQuery}#project-report`;
    case "impact":
      return `/my-work${projectQuery}#human-impact`;
    default:
      return "/my-work";
  }
}

export default function MissionThread({ mission }: { mission: Mission | null }) {
  const { t } = useTranslation();
  const thread = deriveMissionThread(mission);

  return (
    <section className={`${cbaiMineralSurface} space-y-4 p-5`} aria-labelledby="mission-thread-heading">
      <p className={cbaiSectionEyebrow}>{t("missionThread.eyebrow")}</p>
      <h2 id="mission-thread-heading" className="sr-only">
        {t("missionThread.eyebrow")}
      </h2>
      <ol className="relative flex flex-col gap-0 sm:flex-row sm:items-stretch sm:gap-0">
        {thread.map((node, index) => {
          const href = resolveStageHref(node.stage, mission);
          return (
            <li key={node.stage} className="relative flex flex-1 flex-col items-center px-1 py-2 sm:py-0">
              {index > 0 ? (
                <span
                  aria-hidden="true"
                  className="absolute left-0 top-5 hidden h-px w-full -translate-x-1/2 bg-teal-500/20 sm:block"
                />
              ) : null}
              <Link
                href={href}
                className="group flex flex-col items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/40"
                aria-label={`${t(`missionThread.${STAGE_KEYS[node.stage]}`)} — ${t("missionThreadUi.openStage")}`}
              >
                <span
                  className={`relative z-10 h-2.5 w-2.5 shrink-0 rounded-full transition-transform group-hover:scale-125 ${STATUS_COLOR[node.status] ?? STATUS_COLOR.missing}`}
                  title={node.status}
                />
                <p className="mt-2 text-center text-[10px] font-medium uppercase tracking-wider text-zinc-500 group-hover:text-teal-400/80">
                  {t(`missionThread.${STAGE_KEYS[node.stage]}`)}
                </p>
                <p className="mt-1 max-w-[8rem] text-center text-[11px] leading-snug text-zinc-400 group-hover:text-zinc-300">
                  {node.label}
                </p>
                <span className="mt-1 text-[9px] text-teal-500/0 transition-colors group-hover:text-teal-500/80">
                  {t(`missionThreadUi.${STAGE_UI_KEYS[node.stage]}`)}
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
      {mission ? (
        <Link href="/my-work" className="text-xs text-teal-400 hover:text-teal-300">
          {t("missionCenter.continueMission")} →
        </Link>
      ) : null}
    </section>
  );
}
