"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAssistantProfile } from "@/components/platform/context/AssistantProfileProvider";
import { usePlatformContext } from "@/components/platform/context/PlatformContextProvider";
import { useTranslation } from "@/lib/i18n/use-translation";
import { useHydrated } from "@/lib/hooks/use-hydrated";
import OperatorOrb, { type OperatorOrbState } from "@/components/shared/OperatorOrb";
import StatusBadge from "@/components/shared/StatusBadge";
import AssistantCommandCenter from "@/components/assistant/AssistantCommandCenter";
import { resolveOperatorName } from "@/lib/assistant/assistant-profile";
import { resolveRoleDestinations } from "@/lib/assistant/role-destinations";
import { resolveNextStep } from "@/lib/assistant/assistant-next-step";
import { resolveTimeOfDay } from "@/lib/assistant/time-of-day";
import { loadProjects } from "@/lib/project/project-store";
import { resolveProjectGuideStep } from "@/lib/project/project-guide";
import { translateProjectTypeLabel, translateProjectStatus } from "@/lib/i18n/project-translation";
import { cbaiSectionEyebrow, cbaiBtnPrimary } from "@/components/brand/brand-classes";

const TIME_OF_DAY_KEYS = {
  morning: "assistant.timeOfDayMorning",
  afternoon: "assistant.timeOfDayAfternoon",
  evening: "assistant.timeOfDayEvening",
} as const;

// Neutral, signed-out default — the same four real destinations previously hardcoded here,
// now translated. Active/signed-in visitors see their own role-adaptive set instead (below).
const NEUTRAL_ACTIONS = [
  { labelKey: "destOpenMyWork", href: "/my-work" },
  { labelKey: "destSearchIntelligence", href: "/search" },
  { labelKey: "destExploreCountries", href: "/countries" },
  { labelKey: "destReviewEvidence", href: "/knowledge" },
] as const;

/**
 * BUILD-009 — this console no longer opens by introducing itself. It opens by reporting real
 * state: a real in-progress Project (title, type/status, the Intelligence Guide's real next
 * step, real last-activity timestamp) or a real recently viewed entity, whichever
 * resolveNextStep() — the platform's one true priority order — actually resolves to. Only when
 * genuinely neither exists does it fall back to introducing itself at all; that fallback is
 * still fully honest (a real first-time visitor truly has nothing to resume), never a fabricated
 * "welcome back" for someone with real state, and never a fabricated project for someone with
 * none. Same orb, same command bar, same role-adaptive shortcuts in every mode — only the
 * headline block changes.
 */
export default function HomeAssistantGreeting() {
  const { profile, isActive } = useAssistantProfile();
  const { context } = usePlatformContext();
  const { t } = useTranslation();
  const hydrated = useHydrated();

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

  // Real hydration-mismatch guard (the same fix ProjectList.tsx already documents): loadProjects()
  // is honestly empty on the server, so it's only read once the client has actually hydrated.
  const recentEntity = context.recentEntities[0] ?? null;
  const latestProject = hydrated ? (loadProjects()[0] ?? null) : null;
  const guideStep = latestProject ? resolveProjectGuideStep(latestProject, t) : null;
  // latestProject is passed explicitly (rather than letting resolveNextStep read it internally)
  // specifically so this stays null — matching the server's own render — until hydrated, even
  // though loadProjects() itself would already return the real project on the client's first
  // paint. Without this, the label/href below would differ between server and client and React
  // would regenerate the tree (a real hydration-mismatch console error this exact guard fixes).
  const nextStep = resolveNextStep(profile, hydrated ? recentEntity : null, t, latestProject);

  const isResumingProject = nextStep.id === "continue-project" && latestProject !== null && guideStep !== null;
  const isResumingEntity = nextStep.id === "continue-work" && recentEntity !== null;
  const timeOfDay = resolveTimeOfDay(profile.timezone);

  // Role-adaptive quick destinations (BUILD-009 Phase 5/6) — an active profile sees the four real
  // destinations its own workspace role actually needs first; a signed-out visitor sees the same
  // neutral four this always showed. Same shape either way, so nothing shifts in layout.
  const quickActions = (isActive ? resolveRoleDestinations(profile.workspaceRole) : NEUTRAL_ACTIONS).map(
    (action) => ({ label: t(`home.${action.labelKey}`), href: action.href }),
  );

  // This is deliberately NOT a card among cards. It's the one place on the page allowed to be
  // this large and this quiet around it. Composed as a left-aligned column so it can sit in front
  // of the Living Intelligence Network as one environment (see PlatformHome.tsx), not a separate
  // centered section.
  return (
    <section aria-labelledby="home-assistant-greeting-heading" className="cbai-hero-reveal mx-auto flex max-w-2xl flex-col items-center gap-7 px-4 text-center lg:mx-0 lg:items-start lg:text-left">
      <OperatorOrb state={orbState} size={104} />

      <div className="space-y-3">
        {isResumingProject && latestProject && guideStep ? (
          <>
            <p className={cbaiSectionEyebrow}>{t("assistant.continuingEyebrow")}</p>
            <h1
              id="home-assistant-greeting-heading"
              className="cbai-display text-2xl leading-[1.15] text-zinc-50 sm:text-3xl lg:text-[2.1rem]"
            >
              {latestProject.title}
            </h1>
            <p className="text-xs uppercase tracking-wide text-zinc-500">
              {translateProjectTypeLabel(t, latestProject.type)} · {translateProjectStatus(t, latestProject.status)}
            </p>
            <p className="mx-auto max-w-xl text-sm text-zinc-400 sm:text-base lg:mx-0">{guideStep.detail}</p>
            <p className="text-xs text-zinc-600">
              {t("project.lastActivity")}: {new Date(latestProject.updatedAt).toLocaleString()}
            </p>
          </>
        ) : isResumingEntity && recentEntity ? (
          <>
            <p className={cbaiSectionEyebrow}>{t("assistant.continuingEyebrow")}</p>
            <h1
              id="home-assistant-greeting-heading"
              className="cbai-display text-2xl leading-[1.15] text-zinc-50 sm:text-3xl lg:text-[2.1rem]"
            >
              {recentEntity.name}
            </h1>
            <p className="mx-auto max-w-xl text-sm text-zinc-400 sm:text-base lg:mx-0">
              {t("assistant.continuingEntitySubtitle")}
            </p>
          </>
        ) : (
          <>
            {isActive && timeOfDay ? <p className={cbaiSectionEyebrow}>{t(TIME_OF_DAY_KEYS[timeOfDay])}</p> : null}
            {/* Deliberately restrained relative to the command bar below — a status line
                announcing who is present, not the visual anchor of the viewport. This block only
                renders at all when there is genuinely nothing real to resume. */}
            <h1
              id="home-assistant-greeting-heading"
              className="cbai-display text-2xl leading-[1.15] text-zinc-50 sm:text-3xl lg:text-[2.1rem]"
            >
              {isActive ? t("assistant.greetingReturning", { name: profile.name }) : t("assistant.greetingSignedOut")}
            </h1>
            <p className="mx-auto max-w-xl text-sm text-zinc-400 sm:text-base lg:mx-0">
              {isActive
                ? t("assistant.operatorReadyWorkspace", {
                    operator: resolveOperatorName(profile),
                    role: t(`workspaceRoles.${profile.workspaceRole}`),
                  })
                : t("assistant.operatorReadySignedOut")}
            </p>
          </>
        )}
        {isActive ? (
          <div className="flex justify-center lg:justify-start">
            <StatusBadge status="live" />
          </div>
        ) : null}
      </div>

      <div className="w-full max-w-2xl">
        <AssistantCommandCenter size="prominent" hideOrb onOrbStateChange={setLiveOrbState} />
      </div>

      {isResumingProject || isResumingEntity ? (
        <Link href={nextStep.href} className={`${cbaiBtnPrimary} gap-2`}>
          {t("project.catalog.continueAction")}
          <span aria-hidden="true">→</span>
        </Link>
      ) : (
        <Link
          href={nextStep.href}
          className="inline-flex items-center gap-2 text-sm text-zinc-500 transition-colors hover:text-cyan-300"
        >
          <span className={cbaiSectionEyebrow}>{t("project.nextStep")}</span>
          <span className="text-zinc-300">{nextStep.label}</span>
          <span aria-hidden="true">→</span>
        </Link>
      )}

      <div className="flex flex-wrap justify-center gap-2 pt-1 lg:justify-start">
        {quickActions.map((action) => (
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
