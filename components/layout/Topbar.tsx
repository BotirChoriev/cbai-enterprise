"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import AssistantCommandCenter from "@/components/assistant/AssistantCommandCenter";
import AccountMenu from "@/components/assistant/AccountMenu";
import LanguageSelector from "@/components/i18n/LanguageSelector";
import ThemeToggle from "@/components/shared/ThemeToggle";
import { CBAIMark } from "@/components/brand/CBAILogo";
import { useTranslation } from "@/lib/i18n/use-translation";

type TopbarProps = {
  onMenuClick?: () => void;
};

// One persistent Command Center, part of the workspace chrome on every route — never a floating
// overlay, never hidden. Routes typed, spoken, and searched input to the same real destinations.
// Global header (Phase 3): logo (mobile only — Sidebar already shows it on desktop), universal
// search access, language selector, account/avatar, New Project action, Help/Trust access.
export default function Topbar({ onMenuClick }: TopbarProps) {
  const { t } = useTranslation();
  const pathname = usePathname();
  // The homepage already carries one prominent Operator + command bar (HomeAssistantGreeting) —
  // showing the compact one here too would be the exact literal duplication this platform's
  // design system is meant to avoid, so it steps aside there and reappears on every other route.
  const isHome = pathname === "/";

  return (
    <header className="flex h-14 min-w-0 shrink-0 items-center gap-2 border-b border-cyan-500/10 bg-slate-950/90 px-3 backdrop-blur-md sm:gap-3 sm:px-6">
      {onMenuClick ? (
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open navigation"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400 md:hidden"
        >
          <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-5 w-5">
            <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
      ) : null}

      <Link href="/" className="shrink-0 md:hidden" aria-label="CBAI home">
        <CBAIMark size={26} />
      </Link>

      {!isHome ? <AssistantCommandCenter /> : <div className="flex-1" />}

      <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2.5">
        <Link
          href="/search"
          className="hidden shrink-0 text-sm font-medium text-cyan-400 transition-colors hover:text-cyan-300 sm:inline-flex"
        >
          {t("navigation.search")} →
        </Link>
        <Link
          href="/my-work"
          className="hidden shrink-0 rounded-lg border border-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:border-cyan-500/30 hover:text-cyan-300 lg:inline-flex"
        >
          + {t("home.newProject")}
        </Link>
        <Link
          href="/trust"
          className="hidden shrink-0 rounded-lg border border-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:border-cyan-500/30 hover:text-cyan-300 lg:inline-flex"
        >
          {t("navigation.trust")}
        </Link>
        <ThemeToggle className="hidden sm:inline-flex" />
        <LanguageSelector compact />
        <AccountMenu />
      </div>
    </header>
  );
}
