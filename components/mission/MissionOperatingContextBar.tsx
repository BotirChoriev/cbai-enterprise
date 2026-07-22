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
  translateFirstMinuteAction,
} from "@/lib/intelligence-os/first-minute";
import { loadCompanionThought, recordCompanionThought } from "@/lib/intelligence-os/living-memory";
import { useProgressiveDisclosure } from "@/lib/hooks/use-progressive-disclosure";
import { useHydrated } from "@/lib/hooks/use-hydrated";

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
  "/governance",
  "/investor",
  "/settings",
  "/account",
]);

function resolveResumeFocus(
  priorThought: NonNullable<ReturnType<typeof loadCompanionThought>>,
  currentLanguage: string,
  translate: (key: string, params?: Record<string, string>) => string,
  livePurpose: string,
): { text: string; localeNote: string | null } {
  if (priorThought.focusKind === "system" && priorThought.purposeKey) {
    return {
      text: translate(`zeroLearningCurve.${priorThought.purposeKey}`),
      localeNote: null,
    };
  }
  const text = priorThought.lastFocus;
  const localeNote =
    priorThought.focusLocale &&
    priorThought.focusLocale !== currentLanguage &&
    priorThought.focusKind === "user"
      ? translate("zeroLearningCurve.resumeSavedInLocale", {
          locale: priorThought.focusLocale.toUpperCase(),
        })
      : null;
  if (priorThought.focusKind === "system" && text === livePurpose) {
    return { text: livePurpose, localeNote: null };
  }
  return { text, localeNote };
}

export default function MissionOperatingContextBar({
  variant = "compact",
}: MissionOperatingContextBarProps) {
  const pathname = usePathname();
  const { t, language } = useTranslation();
  const disclosure = useProgressiveDisclosure();
  const hydrated = useHydrated();
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

  const priorThought = useMemo(
    () => (showBar && hydrated ? loadCompanionThought() : null),
    [showBar, hydrated],
  );

  useEffect(() => {
    if (!showBar) return;
    const userFocus =
      mission?.problem?.trim() ||
      (mission?.whyExists?.trim() ? mission.whyExists : "");
    if (userFocus) {
      recordCompanionThought(mission?.id ?? null, pathname, userFocus, {
        focusKind: "user",
        focusLocale: language,
      });
      return;
    }
    if (purposeKey && purpose.trim()) {
      recordCompanionThought(mission?.id ?? null, pathname, purpose, {
        focusKind: "system",
        focusLocale: language,
        purposeKey,
      });
    }
  }, [showBar, mission?.id, mission?.problem, mission?.whyExists, pathname, purpose, purposeKey, language]);

  if (!showBar || !companion) return null;

  const nextLabel = translateFirstMinuteAction(t, {
    label: companion.nextLabel,
    labelKey: companion.nextLabelKey,
    nextActionKey: companion.nextActionKey,
    href: companion.nextHref,
    reason: "companion",
    exposesArchitecture: false,
  });

  const resume =
    priorThought &&
    priorThought.lastRoute !== basePath &&
    priorThought.missionId === (mission?.id ?? null) &&
    priorThought.lastFocus.trim().length > 0
      ? resolveResumeFocus(priorThought, language, t, purpose)
      : null;

  const showResume =
    disclosure.showCompanionDetail &&
    resume &&
    resume.text !== purpose &&
    resume.text !== mission?.problem?.trim();

  const showBoundary =
    variant === "full" && disclosure.showInlineHumanDecisionBoundary;

  if (!disclosure.showCompanionDetail) {
    return (
      <aside className={cbaiMineralPanelMd} aria-label={t("zeroLearningCurve.nextAction")}>
        <Link href={companion.nextHref} className={`${cbaiProminentAction} w-full justify-between sm:w-auto`}>
          {nextLabel}
          <span aria-hidden="true">→</span>
        </Link>
      </aside>
    );
  }

  return (
    <aside className={cbaiMineralPanelMd} aria-label={t("zeroLearningCurve.companionEyebrow")}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          <p className={cbaiSectionEyebrow}>{t("zeroLearningCurve.companionEyebrow")}</p>
          <p className={cbaiTextBody}>{purpose}</p>
          {disclosure.showCompanionStoryBeat ? <p className={cbaiTextMuted}>{storyBeat}</p> : null}
          {showResume && resume ? (
            <p className={cbaiTextMuted}>
              {t("zeroLearningCurve.resumeThought")}: {resume.text}
              {resume.localeNote ? (
                <span className="block text-[11px] text-zinc-500">{resume.localeNote}</span>
              ) : null}
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
            {nextLabel}
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
      {showBoundary ? <HumanDecisionBoundary /> : null}
    </aside>
  );
}
