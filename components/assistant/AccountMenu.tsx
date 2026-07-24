"use client";

import Link from "next/link";
import { useAssistantProfile } from "@/components/platform/context/AssistantProfileProvider";
import { useAuth } from "@/components/platform/context/AuthProvider";
import Avatar from "@/components/shared/Avatar";
import { useTranslation } from "@/lib/i18n/use-translation";
import { resolveOperatorName } from "@/lib/assistant/assistant-profile";

/**
 * Account menu (Release 5, Phase 5; real authentication wired in for the Authentication + User
 * Platform Foundation mission) — the real signed-in account (lib/auth) and the local Assistant
 * profile (lib/assistant/assistant-profile.ts) are two different things and both show here: the
 * account is who owns this browser's Projects/Bookmarks; the Assistant profile is how the
 * Assistant addresses you. Native <details>/<summary>, matching this codebase's existing
 * disclosure pattern (EntityOptionalExploration) rather than a new dropdown mechanism.
 */
export default function AccountMenu() {
  const { t } = useTranslation();
  const { profile, isActive } = useAssistantProfile();
  const { user, isSignedIn, signOut } = useAuth();

  const displayName = user?.displayName || (isActive ? profile.name : "");

  if (!displayName) {
    return (
      <Link
        href="/account"
        className="flex shrink-0 items-center gap-2 rounded-lg border border-[var(--cbai-border-default)] bg-[var(--cbai-surface-glass)] px-2 py-1.5 text-xs text-[var(--cbai-text-secondary)] transition-colors hover:text-[var(--cbai-text-primary)]"
      >
        <Avatar name="" avatar="cyan" size="sm" />
        <span className="hidden sm:inline">{t("accountPage.signIn")}</span>
      </Link>
    );
  }

  return (
    <details className="group relative shrink-0">
      <summary className="flex cursor-pointer list-none items-center gap-2 rounded-lg border border-[var(--cbai-border-default)] bg-[var(--cbai-surface-glass)] px-2 py-1.5 text-xs text-[var(--cbai-text-secondary)] marker:content-none [&::-webkit-details-marker]:hidden">
        <Avatar name={displayName} avatar={profile.avatar} size="sm" />
        <span className="hidden sm:inline">{displayName}</span>
      </summary>
      <div className="absolute right-0 z-50 mt-2 w-56 space-y-1 rounded-lg border border-[var(--cbai-border-default)] bg-[var(--cbai-surface-elevated)] p-2 shadow-[var(--cbai-shadow-elevated)]">
        <p className="px-2 py-1 text-[11px] text-[var(--cbai-text-muted)]">
          {isSignedIn ? user!.email : t("accountPage.modeSignedOut")}
        </p>
        {isActive ? (
          <p className="px-2 py-1 text-[11px] text-[var(--cbai-text-muted)]">
            {resolveOperatorName(profile)} · {t(`workspaceRoles.${profile.workspaceRole}`)}
          </p>
        ) : null}
        <Link
          href="/my-work"
          className="block rounded-md px-2 py-1.5 text-sm text-[var(--cbai-text-secondary)] transition-colors hover:bg-[var(--cbai-surface-hover)] hover:text-[var(--cbai-text-primary)]"
        >
          {t("navigation.myWork")}
        </Link>
        <Link
          href="/account"
          className="block rounded-md px-2 py-1.5 text-sm text-[var(--cbai-text-secondary)] transition-colors hover:bg-[var(--cbai-surface-hover)] hover:text-[var(--cbai-text-primary)]"
        >
          {t("navigation.account")}
        </Link>
        <Link
          href="/settings"
          className="block rounded-md px-2 py-1.5 text-sm text-[var(--cbai-text-secondary)] transition-colors hover:bg-[var(--cbai-surface-hover)] hover:text-[var(--cbai-text-primary)]"
        >
          {t("navigation.settings")}
        </Link>
        {isSignedIn ? (
          <button
            type="button"
            onClick={() => {
              signOut();
              window.location.href = "/";
            }}
            className="block w-full rounded-md px-2 py-1.5 text-left text-sm text-[var(--cbai-text-muted)] transition-colors hover:bg-[var(--cbai-surface-hover)] hover:text-amber-400"
          >
            {t("accountPage.signOut")}
          </button>
        ) : null}
      </div>
    </details>
  );
}
