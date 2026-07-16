"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "@/lib/i18n/use-translation";
import { useMissionContext } from "@/components/mission/MissionContextProvider";
import HumanDecisionBoundary from "@/components/intelligence-os/HumanDecisionBoundary";
import {
  cbaiLinkMuted,
  cbaiMineralPanelMd,
  cbaiProminentAction,
  cbaiSectionEyebrow,
  cbaiTextBody,
  cbaiTextMuted,
} from "@/components/brand/brand-classes";
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
    <aside className={cbaiMineralPanelMd} aria-label={t("zeroLearningCurve.companionEyebrow")}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          <p className={cbaiSectionEyebrow}>{t("zeroLearningCurve.companionEyebrow")}</p>
          <p className={cbaiTextBody}>{purpose}</p>
          <p className={cbaiTextMuted}>{storyBeat}</p>
          {showResume ? (
            <p className={cbaiTextMuted}>
              {t("zeroLearningCurve.resumeThought")}: {priorThought.lastFocus}
            </p>
          ) : null}
          {humanImpact && !humanImpact.isComplete ? (
            <p className="text-xs text-amber-400/90">{t("humanImpact.requiredForReport")}</p>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <Link href="/" className={cbaiLinkMuted}>
            {t("zeroLearningCurve.returnToMission")}
          </Link>
          <Link href={companion.nextHref} className={`${cbaiProminentAction} gap-1.5`}>
            {companion.nextLabel}
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
      {variant === "full" ? <HumanDecisionBoundary /> : null}
    </aside>
  );
}
