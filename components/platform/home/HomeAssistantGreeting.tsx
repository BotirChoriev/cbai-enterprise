"use client";

import Link from "next/link";
import { useAssistantProfile } from "@/components/platform/context/AssistantProfileProvider";
import { usePlatformContext } from "@/components/platform/context/PlatformContextProvider";
import Avatar from "@/components/shared/Avatar";
import StatusBadge from "@/components/shared/StatusBadge";
import { WORKSPACE_ROLE_LABELS, resolveOperatorName } from "@/lib/assistant/assistant-profile";
import { resolveNextStep } from "@/lib/assistant/assistant-next-step";
import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

function timeOfDayGreeting(timezone: string): string {
  let hour = new Date().getHours();
  try {
    hour = Number(
      new Intl.DateTimeFormat("en-US", { hour: "numeric", hour12: false, timeZone: timezone }).format(
        new Date(),
      ),
    );
  } catch {
    // Invalid or unsupported timezone string — fall back to the local browser hour above.
  }
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

const SECONDARY_ACTIONS = [
  { label: "Open My Work", href: "/my-work" },
  { label: "Search Intelligence", href: "/search" },
  { label: "Explore Countries", href: "/countries" },
  { label: "Review Evidence", href: "/knowledge" },
] as const;

export default function HomeAssistantGreeting() {
  const { profile, isActive } = useAssistantProfile();
  const { context } = usePlatformContext();

  if (!isActive) return null;

  const nextStep = resolveNextStep(profile, context.recentEntities[0] ?? null);

  return (
    <section
      aria-labelledby="home-assistant-greeting-heading"
      className={`${cbaiGlassCard} mx-auto mt-8 max-w-6xl space-y-5 p-6 sm:p-8`}
    >
      <div className="flex flex-wrap items-center gap-4">
        <Avatar name={profile.name} avatar={profile.avatar} size="lg" />
        <div className="min-w-0 flex-1">
          <h1 id="home-assistant-greeting-heading" className="text-xl font-semibold text-zinc-50 sm:text-2xl">
            {timeOfDayGreeting(profile.timezone)}, {profile.name}.
          </h1>
          <p className="mt-0.5 text-sm text-zinc-400">
            Your {resolveOperatorName(profile)} is ready — {WORKSPACE_ROLE_LABELS[profile.workspaceRole]}{" "}
            workspace.
          </p>
        </div>
        <StatusBadge status="live" />
      </div>

      <Link
        href={nextStep.href}
        className="flex items-center justify-between gap-3 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-5 py-4 transition-colors hover:border-cyan-500/50 hover:bg-cyan-500/15"
      >
        <div>
          <p className={cbaiSectionEyebrow}>Suggested next step</p>
          <p className="mt-1 text-sm font-medium text-zinc-100">{nextStep.label}</p>
        </div>
        <span className="shrink-0 text-cyan-300">→</span>
      </Link>

      <div className="space-y-2 border-t border-zinc-800/80 pt-4">
        <p className={cbaiSectionEyebrow}>Available actions</p>
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
