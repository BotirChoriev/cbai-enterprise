"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { primaryNavSections, secondaryNavSections } from "@/lib/navigation";
import NavIcon from "@/components/layout/NavIcon";
import CBAILogo, { CBAIMark } from "@/components/brand/CBAILogo";
import { useTranslation } from "@/lib/i18n/use-translation";
import { translateNavLabel, translateNavSectionTitle } from "@/lib/i18n/nav-translation";

function isNavItemActive(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Sidebar() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const isHome = pathname === "/" || pathname === "/search";

  return (
    <aside
      className={`hidden h-full shrink-0 flex-col bg-[#050810] transition-all duration-300 md:flex ${
        isHome
          ? "w-56 border-r border-teal-500/10 opacity-100"
          : "w-64 border-r border-teal-500/10 opacity-100"
      }`}
    >
      <Link
        href="/"
        className="flex h-16 items-center gap-2.5 border-b border-teal-500/10 px-4 transition-colors hover:bg-slate-900/50"
        title="CBAI — Universal Intelligence"
        aria-label="CBAI — Universal Intelligence, go to homepage"
      >
        {isHome ? (
          <span className="flex justify-center">
            <CBAIMark size={28} />
          </span>
        ) : (
          <CBAILogo showTagline />
        )}
      </Link>

      <nav className="flex-1 space-y-4 overflow-y-auto px-3 py-4">
        {primaryNavSections.map((section, index) => (
          <div key={section.title || `section-${index}`}>
            {!isHome && section.title ? (
              <p className="mb-2 px-3 text-[10px] font-medium uppercase tracking-widest text-zinc-600">
                {translateNavSectionTitle(t, section.title)}
              </p>
            ) : null}
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive = isNavItemActive(pathname, item.href);
                const label = translateNavLabel(t, item.href, item.label);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={isHome ? label : undefined}
                    aria-label={isHome ? label : undefined}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-teal-500/10 text-teal-400"
                        : "text-zinc-400 hover:bg-slate-900/80 hover:text-zinc-50"
                    }`}
                  >
                    <NavIcon name={item.icon} />
                    {label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        <details className="border-t border-zinc-800/60 pt-3">
            <summary className="mb-2 cursor-pointer list-none px-3 text-[10px] font-medium uppercase tracking-widest text-zinc-600 hover:text-zinc-400">
              {t("navigation.intelligenceCabinet")}
            </summary>
            {secondaryNavSections.map((section, index) => (
              <div key={section.title || `secondary-${index}`} className="mb-3">
                <p className="mb-2 px-3 text-[10px] font-medium uppercase tracking-widest text-zinc-700">
                  {translateNavSectionTitle(t, section.title)}
                </p>
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const isActive = isNavItemActive(pathname, item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                          isActive
                            ? "bg-teal-500/10 text-teal-400"
                            : "text-zinc-500 hover:bg-slate-900/80 hover:text-zinc-50"
                        }`}
                      >
                        <NavIcon name={item.icon} />
                        {translateNavLabel(t, item.href, item.label)}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </details>
      </nav>

      {!isHome ? (
        <div className="border-t border-teal-500/10 p-4">
          <div className="rounded-xl border border-teal-500/10 bg-slate-950/60 p-3 backdrop-blur-sm">
            <p className="text-xs font-medium text-zinc-300">{t("navigation.startWithSearch")}</p>
            <p className="mt-1 text-xs text-zinc-500">{t("navigation.startWithSearchBody")}</p>
            <Link
              href="/search"
              className="mt-3 inline-flex text-xs font-medium text-teal-400 hover:text-teal-300"
            >
              {t("navigation.openSearch")} →
            </Link>
          </div>
        </div>
      ) : null}
    </aside>
  );
}
