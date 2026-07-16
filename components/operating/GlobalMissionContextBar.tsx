"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "@/lib/i18n/use-translation";
import { useMissionContext } from "@/components/mission/MissionContextProvider";
import {
  intelligenceSpaceI18nKey,
  resolveIntelligenceSpace,
} from "@/lib/intelligence-os/intelligence-spaces";
import { cbaiSectionEyebrow } from "@/components/brand/brand-classes";

export default function GlobalMissionContextBar() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const { mission, evidencePulse } = useMissionContext();
  const spaceId = resolveIntelligenceSpace(pathname);
  const spaceKey = intelligenceSpaceI18nKey(spaceId);

  return (
    <header
      className="cbai-global-mission-context shrink-0 border-b border-zinc-800/80 bg-[var(--surface)]/40 px-4 py-2 sm:px-5"
      aria-label={t("intelligenceSpaces.operatingEnvironment")}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className={cbaiSectionEyebrow}>{t(`intelligenceSpaces.${spaceKey}`)}</p>
          <p className="truncate text-sm text-zinc-300">
            {mission?.problem ?? t("intelligenceSpaces.noMission")}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3 text-xs">
          {evidencePulse ? (
            <span className="text-zinc-500" title={evidencePulse.limitation}>
              {evidencePulse.label}
            </span>
          ) : null}
          {pathname !== "/" ? (
            <Link href="/" className="text-teal-400 hover:text-teal-300">
              {t("intelligenceSpaces.missionSpace")} →
            </Link>
          ) : null}
        </div>
      </div>
    </header>
  );
}
