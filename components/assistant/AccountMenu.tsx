"use client";

import Link from "next/link";
import { useAssistantProfile } from "@/components/platform/context/AssistantProfileProvider";
import Avatar from "@/components/shared/Avatar";
import { WORKSPACE_ROLE_LABELS, resolveOperatorName } from "@/lib/assistant/assistant-profile";

/**
 * Account menu (Release 5, Phase 5) — the same Avatar and profile data used everywhere else,
 * reused here as the account entry point. Native <details>/<summary>, matching this codebase's
 * existing disclosure pattern (EntityOptionalExploration) rather than a new dropdown mechanism.
 * Always rendered, including on narrow viewports — user identity is never mobile-nav-only-hidden.
 */
export default function AccountMenu() {
  const { profile, isActive } = useAssistantProfile();

  if (!isActive) {
    return (
      <Link
        href="/settings"
        className="flex shrink-0 items-center gap-2 rounded-lg border border-zinc-800 bg-slate-900/80 px-2 py-1.5 text-xs text-zinc-400 transition-colors hover:text-zinc-100"
      >
        <Avatar name="" avatar="cyan" size="sm" />
        <span className="hidden sm:inline">Set up Operator</span>
      </Link>
    );
  }

  return (
    <details className="group relative shrink-0">
      <summary className="flex cursor-pointer list-none items-center gap-2 rounded-lg border border-zinc-800 bg-slate-900/80 px-2 py-1.5 text-xs text-zinc-300 marker:content-none [&::-webkit-details-marker]:hidden">
        <Avatar name={profile.name} avatar={profile.avatar} size="sm" />
        <span className="hidden sm:inline">{profile.name}</span>
      </summary>
      <div className="absolute right-0 z-50 mt-2 w-56 space-y-1 rounded-lg border border-zinc-800 bg-slate-950 p-2 shadow-xl">
        <p className="px-2 py-1 text-[11px] text-zinc-500">
          {resolveOperatorName(profile)} · {WORKSPACE_ROLE_LABELS[profile.workspaceRole]}
        </p>
        <Link
          href="/my-work"
          className="block rounded-md px-2 py-1.5 text-sm text-zinc-300 transition-colors hover:bg-zinc-900 hover:text-zinc-100"
        >
          My Work
        </Link>
        <Link
          href="/settings"
          className="block rounded-md px-2 py-1.5 text-sm text-zinc-300 transition-colors hover:bg-zinc-900 hover:text-zinc-100"
        >
          Settings
        </Link>
      </div>
    </details>
  );
}
