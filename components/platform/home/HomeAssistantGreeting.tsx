"use client";

import Link from "next/link";
import { useAssistantProfile } from "@/components/platform/context/AssistantProfileProvider";
import { ASSISTANT_AVATAR_CLASSES, ROLE_DEFAULT_WORKSPACE } from "@/lib/assistant/assistant-profile";
import { ASSISTANT_COMMANDS } from "@/lib/assistant/assistant-commands";
import { getEntityCounts } from "@/lib/global-search";
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

const quickActionIds = ["open-my-work", "continue-research", "open-evidence"] as const;

export default function HomeAssistantGreeting() {
  const { profile, isActive } = useAssistantProfile();

  if (!isActive) return null;

  const counts = getEntityCounts();
  const defaultWorkspace = ROLE_DEFAULT_WORKSPACE[profile.workspaceRole];
  const quickActions = ASSISTANT_COMMANDS.filter((command) => quickActionIds.includes(command.id as (typeof quickActionIds)[number]));

  return (
    <section
      aria-labelledby="home-assistant-greeting-heading"
      className={`${cbaiGlassCard} mx-auto mt-8 max-w-6xl space-y-6 p-6 sm:p-8`}
    >
      <div className="flex items-center gap-4">
        <span
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border text-lg font-semibold uppercase ${ASSISTANT_AVATAR_CLASSES[profile.avatar]}`}
        >
          {profile.name.slice(0, 1)}
        </span>
        <div>
          <h1 id="home-assistant-greeting-heading" className="text-xl font-semibold text-zinc-50 sm:text-2xl">
            {timeOfDayGreeting(profile.timezone)}, {profile.name}
          </h1>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-zinc-500">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Assistant ready — saved to this browser
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-1.5">
          <p className={cbaiSectionEyebrow}>Today&apos;s summary</p>
          <p className="text-xs leading-relaxed text-zinc-500">
            {counts.all} profiles catalogued across countries, companies, and universities. Open{" "}
            <Link href="/dashboard" className="text-cyan-400 hover:text-cyan-300">
              Dashboard
            </Link>{" "}
            for what&apos;s available today.
          </p>
        </div>

        <div className="space-y-1.5">
          <p className={cbaiSectionEyebrow}>Continue working</p>
          <p className="text-xs leading-relaxed text-zinc-500">
            <Link href="/my-work" className="text-cyan-400 hover:text-cyan-300">
              Open My Work →
            </Link>{" "}
            for research, evidence review, and reports in progress.
          </p>
        </div>

        <div className="space-y-1.5">
          <p className={cbaiSectionEyebrow}>Recent changes</p>
          <p className="text-xs leading-relaxed text-zinc-500">
            No recent-changes feed is connected yet — an honest empty state, not an error.
          </p>
        </div>

        <div className="space-y-1.5">
          <p className={cbaiSectionEyebrow}>Recommendations</p>
          <p className="text-xs leading-relaxed text-zinc-500">
            Personal recommendations require connected evidence and mission history — not
            available yet.
          </p>
        </div>
      </div>

      <div className="space-y-2 border-t border-zinc-800/80 pt-4">
        <p className={cbaiSectionEyebrow}>Quick actions</p>
        <div className="flex flex-wrap gap-2">
          <Link
            href={defaultWorkspace}
            className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-medium text-cyan-300 transition-colors hover:border-cyan-500/50"
          >
            Go to my workspace →
          </Link>
          {quickActions.map((action) => (
            <Link
              key={action.id}
              href={action.href}
              className="rounded-full border border-zinc-800 bg-zinc-900/40 px-3 py-1.5 text-xs text-zinc-400 transition-colors hover:text-zinc-100"
            >
              {action.phrase}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
