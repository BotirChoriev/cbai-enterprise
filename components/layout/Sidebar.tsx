"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import OperatingNavigator from "@/components/operating/OperatingNavigator";
import CBAILogo from "@/components/brand/CBAILogo";
import { useTranslation } from "@/lib/i18n/use-translation";
import { useContextualHref } from "@/lib/context/use-contextual-href";

export default function Sidebar() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const { moduleHref } = useContextualHref();
  const isHome = pathname === "/";
  const homeLabel = `CBAI — ${t("navigation.home")}`;

  return (
    <aside className={`cbai-platform-sidebar hidden h-full shrink-0 flex-col border-r md:flex ${isHome ? "cbai-spatial-sidebar" : ""}`}>
      <Link
        href="/"
        className={`flex items-center border-b border-[var(--cbai-border-default)] px-4 transition-colors hover:bg-[var(--cbai-surface-hover)] ${isHome ? "min-h-[5.25rem] py-3" : "h-16 gap-2.5"}`}
        title={homeLabel}
        aria-label={homeLabel}
      >
        {isHome ? (
          <CBAILogo size="lg" showTagline variant="auto" className="w-full" />
        ) : (
          <CBAILogo showTagline variant="auto" />
        )}
      </Link>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <OperatingNavigator />
      </nav>

      {!isHome ? (
        <div className="border-t border-[var(--cbai-border-default)] p-4">
          <div className="rounded-xl border border-[var(--cbai-border-default)] bg-[var(--cbai-workspace-solid)] p-3">
            <p className="text-xs font-medium text-[var(--cbai-text-secondary)]">{t("navigation.startWithSearch")}</p>
            <p className="mt-1 text-xs text-[var(--cbai-text-muted)]">{t("navigation.startWithSearchBody")}</p>
            <Link
              href={moduleHref("/search")}
              className="mt-3 inline-flex text-xs font-medium text-[var(--cbai-accent-primary)] hover:text-[var(--cbai-accent-hover)]"
            >
              {t("navigation.openSearch")} →
            </Link>
          </div>
        </div>
      ) : null}
    </aside>
  );
}
