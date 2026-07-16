"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useTranslation } from "@/lib/i18n/use-translation";
import { useMissionContext } from "@/components/mission/MissionContextProvider";
import { useHydrated } from "@/lib/hooks/use-hydrated";
import {
  deriveContextualGoals,
  resolveGoalRoute,
  type UserGoal,
} from "@/lib/intelligence-os/intelligence-gateway";
import { deriveFirstMinuteAction } from "@/lib/intelligence-os/first-minute";
import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

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
  const { mission } = useMissionContext();

  const firstAction = useMemo(
    () => (hydrated ? deriveFirstMinuteAction(mission) : null),
    [hydrated, mission],
  );
  const goals = useMemo(
    () => (hydrated ? deriveContextualGoals(mission) : []),
    [hydrated, mission],
  );

  if (!hydrated) return null;

  const hint = variant === "search" ? t("zeroLearningCurve.searchGoalHint") : t("zeroLearningCurve.gatewayHint");

  return (
    <section
      className={`${compact ? "space-y-2" : "space-y-4"} ${variant === "home" ? cbaiGlassCard : ""} ${variant === "home" ? "p-4" : ""}`}
      aria-labelledby="intelligence-gateway-heading"
    >
      <div>
        <p className={cbaiSectionEyebrow} id="intelligence-gateway-heading">
          {t("zeroLearningCurve.gatewayEyebrow")}
        </p>
        <p className="text-xs text-zinc-500">{hint}</p>
      </div>

      {variant === "home" && firstAction && !mission ? (
        <Link
          href={firstAction.href}
          className="block rounded-md border border-teal-500/30 bg-teal-500/10 px-3 py-2 text-sm text-teal-300 hover:bg-teal-500/15"
        >
          {firstAction.label} →
        </Link>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {goals.map((goal) => {
          const route = resolveGoalRoute(goal, mission);
          return (
            <Link
              key={goal}
              href={route.href}
              className="rounded-md border border-zinc-800 px-3 py-1.5 text-xs text-zinc-400 hover:border-teal-500/30 hover:text-teal-300"
            >
              {t(`zeroLearningCurve.${GOAL_I18N[goal]}`)}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
