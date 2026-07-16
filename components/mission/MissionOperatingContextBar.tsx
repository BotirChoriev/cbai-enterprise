"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "@/lib/i18n/use-translation";
import { useMissionContext } from "@/components/mission/MissionContextProvider";
import HumanDecisionBoundary from "@/components/intelligence-os/HumanDecisionBoundary";
import { cbaiMineralSurface, cbaiSectionEyebrow } from "@/components/brand/brand-classes";
import {
  deriveRouteCompanion,
  routePurposeI18nKey,
  storyBeatI18nKey,
} from "@/lib/intelligence-os/first-minute";
import { loadCompanionThought, recordCompanionThought } from "@/lib/intelligence-os/living-memory";

type MissionOperatingContextBarProps = {
  /** Compact strip only — full boundary on mission-heavy routes */
  variant?: "compact" | "full";
};

const PRIMARY_ROUTES_WITH_CONTEXT = new Set([
  "/my-work",
  "/search",
  "/countries",
  "/companies",
  "/universities",
  "/research",
  "/knowledge",
  "/graph",
  "/reasoning",
  "/reports",
  "/analytics",
  "/trust",
  "/ai-control",
  "/settings",
  "/account",
]);

export default function MissionOperatingContextBar({
  variant = "compact",
}: MissionOperatingContextBarProps) {
  const pathname = usePathname();
  const { t } = useTranslation();
  const { mission, humanImpact } = useMissionContext();

  const basePath = pathname.split("?")[0];
  const showBar =
    basePath !== "/" &&
    (PRIMARY_ROUTES_WITH_CONTEXT.has(basePath) || basePath.startsWith("/research/"));

  const companion = useMemo(
    () => (showBar ? deriveRouteCompanion(pathname, mission) : null),
    [showBar, pathname, mission],
  );

  const purposeKey = companion ? routePurposeI18nKey(companion.routeKey) : null;
  const storyKey = companion ? storyBeatI18nKey(companion.storyBeat) : null;
  const purpose = purposeKey ? t(`zeroLearningCurve.${purposeKey}`) : "";
  const storyBeat = storyKey ? t(`zeroLearningCurve.${storyKey}`) : "";

  const priorThought = useMemo(() => (showBar ? loadCompanionThought() : null), [showBar]);

  useEffect(() => {
    if (!showBar || !purpose) return;
    recordCompanionThought(mission?.id ?? null, pathname, purpose);
  }, [showBar, mission?.id, pathname, purpose]);

  if (!showBar || !companion) return null;

  const showResume =
    priorThought &&
    priorThought.lastRoute !== basePath &&
    priorThought.missionId === (mission?.id ?? null) &&
    priorThought.lastFocus.length > 0;

  return (
    <aside
      className={`${cbaiMineralSurface} space-y-3 p-4`}
      aria-label={t("zeroLearningCurve.companionEyebrow")}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          <p className={cbaiSectionEyebrow}>{t("zeroLearningCurve.companionEyebrow")}</p>
          <p className="text-sm text-zinc-300">{purpose}</p>
          <p className="text-xs text-zinc-500">{storyBeat}</p>
          {showResume ? (
            <p className="text-xs text-zinc-500">
              {t("zeroLearningCurve.resumeThought")}: {priorThought.lastFocus}
            </p>
          ) : null}
          {humanImpact && !humanImpact.isComplete ? (
            <p className="text-xs text-amber-400/90">{t("humanImpact.requiredForReport")}</p>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <Link href="/" className="text-xs text-zinc-500 hover:text-teal-300">
            {t("zeroLearningCurve.returnToMission")}
          </Link>
          <Link
            href={companion.nextHref}
            className="rounded-md border border-teal-500/30 px-3 py-1.5 text-xs font-medium text-teal-300 hover:border-teal-400/50 hover:text-teal-200"
          >
            {companion.nextLabel} →
          </Link>
        </div>
      </div>
      {variant === "full" ? <HumanDecisionBoundary /> : null}
    </aside>
  );
}
