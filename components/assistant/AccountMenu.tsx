"use client";

import Link from "next/link";
import { useAssistantProfile } from "@/components/platform/context/AssistantProfileProvider";
import { useAuth } from "@/components/platform/context/AuthProvider";
import Avatar from "@/components/shared/Avatar";
import { WORKSPACE_ROLE_LABELS, resolveOperatorName } from "@/lib/assistant/assistant-profile";

/**
 * Account menu (Release 5, Phase 5; real authentication wired in for the Authentication + User
 * Platform Foundation mission) — the real signed-in account (lib/auth) and the local Assistant
 * profile (lib/assistant/assistant-profile.ts) are two different things and both show here: the
 * account is who owns this browser's Projects/Bookmarks; the Assistant profile is how the
 * Assistant addresses you. Native <details>/<summary>, matching this codebase's existing
 * disclosure pattern (EntityOptionalExploration) rather than a new dropdown mechanism.
 */
export default function AccountMenu() {
  const { profile, isActive } = useAssistantProfile();
  const { user, isSignedIn, signOut } = useAuth();

  const displayName = user?.displayName || (isActive ? profile.name : "");

  if (!displayName) {
    return (
      <Link
        href="/account"
        className="flex shrink-0 items-center gap-2 rounded-lg border border-zinc-800 bg-slate-900/80 px-2 py-1.5 text-xs text-zinc-400 transition-colors hover:text-zinc-100"
      >
        <Avatar name="" avatar="cyan" size="sm" />
        <span className="hidden sm:inline">Sign In</span>
      </Link>
    );
  }

  return (
    <details className="group relative shrink-0">
      <summary className="flex cursor-pointer list-none items-center gap-2 rounded-lg border border-zinc-800 bg-slate-900/80 px-2 py-1.5 text-xs text-zinc-300 marker:content-none [&::-webkit-details-marker]:hidden">
        <Avatar name={displayName} avatar={profile.avatar} size="sm" />
        <span className="hidden sm:inline">{displayName}</span>
      </summary>
      <div className="absolute right-0 z-50 mt-2 w-56 space-y-1 rounded-lg border border-zinc-800 bg-slate-950 p-2 shadow-xl">
        <p className="px-2 py-1 text-[11px] text-zinc-500">
          {isSignedIn ? user!.email : "Not signed in on this device"}
        </p>
        {isActive ? (
          <p className="px-2 py-1 text-[11px] text-zinc-600">
            {resolveOperatorName(profile)} · {WORKSPACE_ROLE_LABELS[profile.workspaceRole]}
          </p>
        ) : null}
        <Link
          href="/my-work"
          className="block rounded-md px-2 py-1.5 text-sm text-zinc-300 transition-colors hover:bg-zinc-900 hover:text-zinc-100"
        >
          My Work
        </Link>
        <Link
          href="/account"
          className="block rounded-md px-2 py-1.5 text-sm text-zinc-300 transition-colors hover:bg-zinc-900 hover:text-zinc-100"
        >
          Account
        </Link>
        <Link
          href="/settings"
          className="block rounded-md px-2 py-1.5 text-sm text-zinc-300 transition-colors hover:bg-zinc-900 hover:text-zinc-100"
        >
          Settings
        </Link>
        {isSignedIn ? (
          <button
            type="button"
            onClick={() => {
              signOut();
              window.location.href = "/";
            }}
            className="block w-full rounded-md px-2 py-1.5 text-left text-sm text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-amber-300"
          >
            Sign Out
          </button>
        ) : null}
      </div>
    </details>
  );
}
