"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAssistantProfile } from "@/components/platform/context/AssistantProfileProvider";
import { usePlatformContext } from "@/components/platform/context/PlatformContextProvider";
import { useTranslation } from "@/lib/i18n/use-translation";
import OperatorOrb, { type OperatorOrbState } from "@/components/shared/OperatorOrb";
import StatusBadge from "@/components/shared/StatusBadge";
import AssistantCommandCenter from "@/components/assistant/AssistantCommandCenter";
import { WORKSPACE_ROLE_LABELS, resolveOperatorName } from "@/lib/assistant/assistant-profile";
import { resolveNextStep } from "@/lib/assistant/assistant-next-step";
import { resolveTimeOfDay } from "@/lib/assistant/time-of-day";
import { cbaiSectionEyebrow } from "@/components/brand/brand-classes";

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

  // The command bar below reports its own real, live voice/confirmation state up here — one orb,
  // one Operator, reacting to real interaction rather than two independent presences on screen.
  const [liveOrbState, setLiveOrbState] = useState<OperatorOrbState>("idle");
  const orbState = isGreeting ? "greeting" : liveOrbState;

  const nextStep = resolveNextStep(profile, context.recentEntities[0] ?? null);
  const timeOfDay = resolveTimeOfDay(profile.timezone);

  // This is deliberately NOT a card among cards. It's the arrival moment — the one place on the
  // page allowed to be this large, this open, and this quiet around it. Everything below the
  // command bar (next step, shortcuts) stays real and present but visually demoted, so the
  // contrast between "you just arrived" and "here is your workspace" is unmistakable. Composed as
  // a left-aligned column so it can sit beside the Living Intelligence Network as one asymmetric
  // hero (see PlatformHome.tsx) rather than two separate centered sections stacked vertically —
  // the network visual itself now carries the "connected knowledge" motif, so the decorative
  // background lines this section used to render behind the Operator were retired as a duplicate.
  return (
    <section aria-labelledby="home-assistant-greeting-heading" className="cbai-hero-reveal mx-auto flex max-w-2xl flex-col items-center gap-7 px-4 text-center lg:mx-0 lg:items-start lg:text-left">
      <OperatorOrb state={orbState} size={104} />

      <div className="space-y-4">
        {isActive && timeOfDay ? <p className={cbaiSectionEyebrow}>{t(TIME_OF_DAY_KEYS[timeOfDay])}</p> : null}
        <h1
          id="home-assistant-greeting-heading"
          className="cbai-display text-4xl leading-[1.05] text-zinc-50 sm:text-5xl lg:text-[3.4rem]"
        >
          {isActive ? t("assistant.greetingReturning", { name: profile.name }) : t("assistant.greetingSignedOut")}
        </h1>
        <p className="mx-auto max-w-xl text-base text-zinc-400 sm:text-lg lg:mx-0">
          {isActive
            ? `Your ${resolveOperatorName(profile)} is ready — ${WORKSPACE_ROLE_LABELS[profile.workspaceRole]} workspace.`
            : "Your CBAI Operator is ready — speak or type to begin."}
        </p>
        {isActive ? (
          <div className="flex justify-center lg:justify-start">
            <StatusBadge status="live" />
          </div>
        ) : null}
      </div>

      <div className="w-full max-w-2xl">
        <AssistantCommandCenter size="prominent" hideOrb onOrbStateChange={setLiveOrbState} />
      </div>

      <Link
        href={nextStep.href}
        className="inline-flex items-center gap-2 text-sm text-zinc-500 transition-colors hover:text-cyan-300"
      >
        <span className={cbaiSectionEyebrow}>{t("project.nextStep")}</span>
        <span className="text-zinc-300">{nextStep.label}</span>
        <span aria-hidden="true">→</span>
      </Link>

      <div className="flex flex-wrap justify-center gap-2 pt-1 lg:justify-start">
        {SECONDARY_ACTIONS.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="rounded-full border border-zinc-800/60 bg-zinc-900/20 px-3 py-1.5 text-xs text-zinc-500 transition-colors hover:border-zinc-700 hover:text-zinc-200"
          >
            {action.label}
          </Link>
        ))}
      </div>
    </section>
  );
}
