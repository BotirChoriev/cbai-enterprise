"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAssistantProfile } from "@/components/platform/context/AssistantProfileProvider";
import { usePlatformContext } from "@/components/platform/context/PlatformContextProvider";
import { useTranslation } from "@/lib/i18n/use-translation";
import OperatorOrb from "@/components/shared/OperatorOrb";
import StatusBadge from "@/components/shared/StatusBadge";
import AssistantCommandCenter from "@/components/assistant/AssistantCommandCenter";
import { WORKSPACE_ROLE_LABELS, resolveOperatorName } from "@/lib/assistant/assistant-profile";
import { resolveNextStep } from "@/lib/assistant/assistant-next-step";
import { resolveTimeOfDay } from "@/lib/assistant/time-of-day";
import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

const TIME_OF_DAY_KEYS = {
  morning: "assistant.timeOfDayMorning",
  afternoon: "assistant.timeOfDayAfternoon",
  evening: "assistant.timeOfDayEvening",
} as const;

const SECONDARY_ACTIONS = [
  { label: "Open My Work", href: "/my-work" },
  { label: "Search Intelligence", href: "/search" },
  { label: "Explore Countries", href: "/countries" },
  { label: "Review Evidence", href: "/knowledge" },
] as const;

/**
 * Personalized greeting (Phase 7) — uses the real saved Assistant Profile name only, in the
 * user's selected interface language (assistant.greetingReturning). Never fabricates a name,
 * personal task, or notification. Signed-out visitors see a real, neutral welcome instead of
 * nothing — same component, no personal data referenced.
 */
export default function HomeAssistantGreeting() {
  const { profile, isActive } = useAssistantProfile();
  const { context } = usePlatformContext();
  const { t } = useTranslation();

  // A real, one-shot "just arrived" moment — the Operator visibly welcomes the user on mount, then
  // settles into idle, rather than starting in idle as if nothing happened. Same setTimeout-in-
  // effect pattern EntryExperience.tsx already uses; harmless under reduced motion (the CSS simply
  // renders no animation, state still flips after the timer with no visible transition).
  const [isGreeting, setIsGreeting] = useState(true);
  useEffect(() => {
    const timer = window.setTimeout(() => setIsGreeting(false), 1300);
    return () => window.clearTimeout(timer);
  }, []);

  const nextStep = resolveNextStep(profile, context.recentEntities[0] ?? null);
  const timeOfDay = resolveTimeOfDay(profile.timezone);

  return (
    <section
      aria-labelledby="home-assistant-greeting-heading"
      className={`${cbaiGlassCard} mx-auto mt-8 max-w-6xl space-y-5 p-6 sm:p-8`}
    >
      <div className="flex flex-wrap items-center gap-4">
        <OperatorOrb state={isGreeting ? "greeting" : "idle"} size={72} />
        <div className="min-w-0 flex-1">
          {isActive && timeOfDay ? (
            <p className={cbaiSectionEyebrow}>{t(TIME_OF_DAY_KEYS[timeOfDay])}</p>
          ) : null}
          <h1 id="home-assistant-greeting-heading" className="text-xl font-semibold text-zinc-50 sm:text-2xl">
            {isActive ? t("assistant.greetingReturning", { name: profile.name }) : t("assistant.greetingSignedOut")}
          </h1>
          <p className="mt-0.5 text-sm text-zinc-400">
            {isActive
              ? `Your ${resolveOperatorName(profile)} is ready — ${WORKSPACE_ROLE_LABELS[profile.workspaceRole]} workspace.`
              : "Your CBAI Operator is ready — speak or type to begin."}
          </p>
        </div>
        {isActive ? <StatusBadge status="live" /> : null}
      </div>

      <div className="flex justify-center border-y border-zinc-800/80 py-6">
        <AssistantCommandCenter size="prominent" />
      </div>

      <Link
        href={nextStep.href}
        className="flex items-center justify-between gap-3 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-5 py-4 transition-colors hover:border-cyan-500/50 hover:bg-cyan-500/15"
      >
        <div>
          <p className={cbaiSectionEyebrow}>{t("project.nextStep")}</p>
          <p className="mt-1 text-sm font-medium text-zinc-100">{nextStep.label}</p>
        </div>
        <span className="shrink-0 text-cyan-300">→</span>
      </Link>

      <div className="space-y-2 border-t border-zinc-800/80 pt-4">
        <p className={cbaiSectionEyebrow}>Shortcuts</p>
        <div className="flex flex-wrap gap-2">
          {SECONDARY_ACTIONS.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="rounded-full border border-zinc-800 bg-zinc-900/40 px-3 py-1.5 text-xs text-zinc-400 transition-colors hover:text-zinc-100"
            >
              {action.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
