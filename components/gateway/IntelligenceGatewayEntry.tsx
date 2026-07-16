"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useTranslation } from "@/lib/i18n/use-translation";
import { useMissionContext } from "@/components/mission/MissionContextProvider";
import { useHydrated } from "@/lib/hooks/use-hydrated";
import {
  USER_GOALS,
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
};

/** One universal entry — speak (command bar), type (search), choose goal. */
export default function IntelligenceGatewayEntry({ compact = false }: IntelligenceGatewayEntryProps) {
  const { t } = useTranslation();
  const hydrated = useHydrated();
  const { mission } = useMissionContext();

  const firstAction = useMemo(
    () => (hydrated ? deriveFirstMinuteAction(mission) : null),
    [hydrated, mission],
  );

  if (!hydrated) return null;

  return (
    <section className={`${compact ? "space-y-2" : "space-y-4"} ${cbaiGlassCard} p-4`} aria-labelledby="intelligence-gateway-heading">
      <div>
        <p className={cbaiSectionEyebrow} id="intelligence-gateway-heading">
          {t("zeroLearningCurve.gatewayEyebrow")}
        </p>
        <p className="text-xs text-zinc-500">{t("zeroLearningCurve.gatewayHint")}</p>
      </div>

      {firstAction ? (
        <Link href={firstAction.href} className="block rounded-md border border-teal-500/30 bg-teal-500/10 px-3 py-2 text-sm text-teal-300 hover:bg-teal-500/15">
          {t("zeroLearningCurve.firstMinuteAction")}: {firstAction.label} →
        </Link>
      ) : null}

      <div className="flex flex-wrap gap-2 text-[10px] uppercase tracking-wider text-zinc-600">
        <span>{t("zeroLearningCurve.speak")} · {t("zeroLearningCurve.type")} · {t("zeroLearningCurve.chooseGoal")}</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {USER_GOALS.map((goal) => {
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

      {!compact ? (
        <p className="text-[10px] text-zinc-600">{t("zeroLearningCurve.noTutorial")}</p>
      ) : null}
    </section>
  );
}
