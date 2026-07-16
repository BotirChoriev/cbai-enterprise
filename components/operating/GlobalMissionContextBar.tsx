"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "@/lib/i18n/use-translation";
import { useMissionContext } from "@/components/mission/MissionContextProvider";
import { useProgressiveDisclosure } from "@/lib/hooks/use-progressive-disclosure";
import { deriveFirstMinuteAction } from "@/lib/intelligence-os/first-minute";

/** Mission Gravity 2.0 — quieter in focused mode; one line when possible. */
export default function GlobalMissionContextBar() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const { mission, evidencePulse } = useMissionContext();
  const disclosure = useProgressiveDisclosure();
  const firstAction = deriveFirstMinuteAction(mission);

  if (!disclosure.showGlobalMissionBarDetail) {
    return (
      <header
        className="cbai-global-mission-context shrink-0 border-b border-zinc-800/80 px-4 py-2 sm:px-5"
        aria-label={t("operatingContext.missionContext")}
      >
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm text-zinc-300">
            {mission?.problem ?? firstAction.label}
          </p>
          <div className="flex shrink-0 items-center gap-2">
            {pathname !== "/" ? (
              <Link href="/" className="text-xs text-zinc-500 hover:text-teal-300">
                {t("operatingContext.returnPath")}
              </Link>
            ) : null}
            <Link href={firstAction.href} className="text-xs text-teal-400 hover:text-teal-300">
              →
            </Link>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header
      className="cbai-global-mission-context shrink-0 border-b border-zinc-800/80 px-4 py-2.5 sm:px-5"
      aria-label={t("intelligenceSpaces.operatingEnvironment")}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-medium text-zinc-100" title={mission?.problem}>
            {mission?.problem ?? t("intelligenceSpaces.noMission")}
          </p>
          {mission?.whyExists ? (
            <p className="truncate text-xs text-zinc-500" title={mission.whyExists}>
              {mission.whyExists}
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-3 text-xs">
          {evidencePulse && evidencePulse.count > 0 ? (
            <span className="text-zinc-600" title={evidencePulse.limitation}>
              {evidencePulse.label}
            </span>
          ) : null}
          {pathname !== "/" ? (
            <Link href="/" className="text-teal-400/90 hover:text-teal-300">
              {t("operatingContext.returnPath")} →
            </Link>
          ) : null}
        </div>
      </div>
    </header>
  );
}
