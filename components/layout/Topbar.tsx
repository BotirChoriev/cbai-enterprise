"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import AssistantCommandCenter from "@/components/assistant/AssistantCommandCenter";
import AccountMenu from "@/components/assistant/AccountMenu";
import LanguageSelector from "@/components/i18n/LanguageSelector";
import ThemeToggle from "@/components/shared/ThemeToggle";
import { CBAIMark } from "@/components/brand/CBAILogo";
import { useTranslation } from "@/lib/i18n/use-translation";
import { useContextualHref } from "@/lib/context/use-contextual-href";
import { cbaiFocusRing } from "@/components/brand/brand-classes";

type TopbarProps = {
  onMenuClick?: () => void;
  spatialHome?: boolean;
  transparent?: boolean;
};

export default function Topbar({ onMenuClick, transparent = false }: TopbarProps) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const { moduleHref } = useContextualHref();
  const isHome = pathname === "/";

  return (
    <header
      className={`cbai-platform-topbar cbai-spatial-topbar sticky top-0 z-30 flex min-h-[4.5rem] min-w-0 shrink-0 items-center gap-2 border-b px-3 backdrop-blur-md transition-colors duration-300 sm:gap-3 sm:px-6`}
    >
      {onMenuClick ? (
        <button
          type="button"
          onClick={onMenuClick}
          aria-label={t("navigation.openNavigation")}
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-[var(--cbai-text-muted)] hover:bg-[var(--cbai-surface-hover)] hover:text-[var(--cbai-text-primary)] md:hidden ${cbaiFocusRing}`}
        >
          <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-5 w-5">
            <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
      ) : null}

      <Link href="/" className="shrink-0 md:hidden" aria-label="CBAI home">
        <CBAIMark size={26} standalone />
      </Link>

      {!isHome ? <AssistantCommandCenter /> : <div className="flex-1" />}

      <div
        className={`ml-auto flex shrink-0 items-center gap-1.5 transition-opacity duration-300 sm:gap-2.5 ${
          transparent ? "opacity-50 hover:opacity-100 focus-within:opacity-100" : "opacity-100"
        }`}
      >
        <Link
          href={moduleHref("/search")}
          className="hidden shrink-0 text-sm font-medium text-[var(--cbai-accent-primary)] transition-colors hover:text-[var(--cbai-accent-hover)] sm:inline-flex"
        >
          {t("navigation.search")} →
        </Link>
        <Link
          href={moduleHref("/my-work")}
          className="hidden shrink-0 rounded-lg border border-[var(--cbai-border-default)] px-3 py-1.5 text-xs font-medium text-[var(--cbai-text-secondary)] transition-colors hover:border-[var(--cbai-border-active)] hover:text-[var(--cbai-text-primary)] lg:inline-flex"
        >
          + {t("home.newProject")}
        </Link>
        <Link
          href="/trust"
          className="hidden shrink-0 rounded-lg border border-[var(--cbai-border-default)] px-3 py-1.5 text-xs font-medium text-[var(--cbai-text-secondary)] transition-colors hover:border-[var(--cbai-border-active)] hover:text-[var(--cbai-text-primary)] lg:inline-flex"
        >
          {t("navigation.trust")}
        </Link>
        <ThemeToggle hideOnMobile />
        <LanguageSelector compact />
        <AccountMenu />
      </div>
    </header>
  );
}
