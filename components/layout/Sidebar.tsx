"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import OperatingNavigator from "@/components/operating/OperatingNavigator";
import CBAILogo, { CBAIMark } from "@/components/brand/CBAILogo";
import { useTranslation } from "@/lib/i18n/use-translation";
import { useContextualHref } from "@/lib/context/use-contextual-href";

export default function Sidebar() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const { moduleHref } = useContextualHref();
  const isHome = pathname === "/";

  return (
    <aside className="hidden h-full w-56 shrink-0 flex-col border-r border-teal-500/10 bg-[#050810] md:flex lg:w-60">
      <Link
        href="/"
        className="flex h-16 items-center gap-2.5 border-b border-teal-500/10 px-4 transition-colors hover:bg-slate-900/50"
        title="CBAI — Universal Intelligence"
        aria-label="CBAI — Universal Intelligence, go to Mission Space"
      >
        {isHome ? (
          <span className="flex justify-center">
            <CBAIMark size={28} />
          </span>
        ) : (
          <CBAILogo showTagline />
        )}
      </Link>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <OperatingNavigator />
      </nav>

      {!isHome ? (
        <div className="border-t border-teal-500/10 p-4">
          <div className="rounded-xl border border-teal-500/10 bg-slate-950/60 p-3">
            <p className="text-xs font-medium text-zinc-300">{t("navigation.startWithSearch")}</p>
            <p className="mt-1 text-xs text-zinc-500">{t("navigation.startWithSearchBody")}</p>
            <Link href={moduleHref("/search")} className="mt-3 inline-flex text-xs font-medium text-teal-400 hover:text-teal-300">
              {t("navigation.openSearch")} →
            </Link>
          </div>
        </div>
      ) : null}
    </aside>
  );
}
