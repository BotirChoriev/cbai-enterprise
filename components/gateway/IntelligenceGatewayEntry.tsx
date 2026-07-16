"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useTranslation } from "@/lib/i18n/use-translation";
import { useMissionContext } from "@/components/mission/MissionContextProvider";
import { useHydrated } from "@/lib/hooks/use-hydrated";
import { useProgressiveDisclosure } from "@/lib/hooks/use-progressive-disclosure";
import {
  deriveContextualGoals,
  resolveGoalRoute,
  type UserGoal,
} from "@/lib/intelligence-os/intelligence-gateway";
import { deriveFirstMinuteAction, translateFirstMinuteAction } from "@/lib/intelligence-os/first-minute";
import {
  cbaiChip,
  cbaiGapSm,
  cbaiGlassCard,
  cbaiPanelPadding,
  cbaiProminentAction,
  cbaiSectionEyebrow,
  cbaiStackLg,
  cbaiStackSm,
  cbaiTextMuted,
} from "@/components/brand/brand-classes";

const GOAL_I18N: Record<UserGoal, string> = {
  research: "goalResearch",
  verify: "goalVerify",
  compare: "goalCompare",
  continue: "goalContinue",
  create: "goalCreate",
  collaborate: "goalCollaborate",
  publish: "goalPublish",
};

type IntelligenceGatewayEntryProps = {
  compact?: boolean;
  variant?: "home" | "search";
};

export default function IntelligenceGatewayEntry({
  compact = false,
  variant = "home",
}: IntelligenceGatewayEntryProps) {
  const { t } = useTranslation();
  const hydrated = useHydrated();
  const disclosure = useProgressiveDisclosure();
  const { mission } = useMissionContext();

  const firstAction = useMemo(
    () => (hydrated ? deriveFirstMinuteAction(mission) : null),
    [hydrated, mission],
  );
  const goals = useMemo(
    () => (hydrated && disclosure.showGatewayGoalChips ? deriveContextualGoals(mission) : []),
    [hydrated, mission, disclosure.showGatewayGoalChips],
  );

  if (!hydrated) return null;

  const hint = variant === "search" ? t("zeroLearningCurve.searchGoalHint") : t("zeroLearningCurve.gatewayHint");
  const firstLabel = firstAction ? translateFirstMinuteAction(t, firstAction) : null;

  return (
    <section
      className={`${compact ? cbaiStackSm : cbaiStackLg} ${variant === "home" ? `${cbaiGlassCard} ${cbaiPanelPadding}` : ""}`}
      aria-labelledby="intelligence-gateway-heading"
    >
      <div>
        <p className={cbaiSectionEyebrow} id="intelligence-gateway-heading">
          {variant === "search" ? t("zeroLearningCurve.commandEyebrow") : t("zeroLearningCurve.gatewayEyebrow")}
        </p>
        {disclosure.showGatewayGoalChips || variant === "search" ? (
          <p className={cbaiTextMuted}>{hint}</p>
        ) : null}
      </div>

      {variant === "home" && firstAction && !mission ? (
        <Link href={firstAction.href} className={`${cbaiProminentAction} w-full justify-between`}>
          {firstLabel}
          <span aria-hidden="true">→</span>
        </Link>
      ) : null}

      {goals.length > 0 ? (
        <div className={`flex flex-wrap ${cbaiGapSm}`}>
          {goals.map((goal) => {
            const route = resolveGoalRoute(goal, mission);
            return (
              <Link key={goal} href={route.href} className={cbaiChip}>
                {t(`zeroLearningCurve.${GOAL_I18N[goal]}`)}
              </Link>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}
