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

const STATUS_COLOR: Record<string, string> = {
  complete: "bg-emerald-500/80",
  partial: "bg-amber-500/70",
  missing: "bg-zinc-600/60",
  blocked: "bg-[var(--gold)]/70",
};

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
        {thread.map((node, index) => (
          <li key={node.stage} className="relative flex flex-1 flex-col items-center px-1 py-2 sm:py-0">
            {index > 0 ? (
              <span
                aria-hidden="true"
                className="absolute left-0 top-5 hidden h-px w-full -translate-x-1/2 bg-teal-500/20 sm:block"
              />
            ) : null}
            <span
              className={`relative z-10 h-2.5 w-2.5 shrink-0 rounded-full ${STATUS_COLOR[node.status] ?? STATUS_COLOR.missing}`}
              title={node.status}
            />
            <p className="mt-2 text-center text-[10px] font-medium uppercase tracking-wider text-zinc-500">
              {t(`missionThread.${STAGE_KEYS[node.stage]}`)}
            </p>
            <p className="mt-1 max-w-[8rem] text-center text-[11px] leading-snug text-zinc-400">{node.label}</p>
          </li>
        ))}
      </ol>
      {mission ? (
        <Link href="/my-work" className="text-xs text-teal-400 hover:text-teal-300">
          {t("missionCenter.continueMission")} →
        </Link>
      ) : null}
    </section>
  );
}
