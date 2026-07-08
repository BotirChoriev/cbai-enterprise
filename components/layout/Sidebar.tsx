"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { platformNavSections } from "@/lib/navigation";
import NavIcon from "@/components/layout/NavIcon";
import CBAILogo, { CBAIMark } from "@/components/brand/CBAILogo";

function isNavItemActive(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Sidebar() {
  const pathname = usePathname();
  const isHome = pathname === "/" || pathname === "/search";

  return (
    <aside
      className={`flex h-full shrink-0 flex-col border-r border-cyan-500/10 bg-[#050810] transition-all duration-200 ${
        isHome ? "w-16 opacity-40 hover:opacity-90" : "w-64 opacity-100"
      }`}
    >
      <Link
        href="/"
        className="flex h-16 items-center gap-2.5 border-b border-cyan-500/10 px-4 transition-colors hover:bg-slate-900/50"
        title="CBAI — Official Evidence Intelligence"
      >
        {isHome ? (
          <span className="flex justify-center">
            <CBAIMark size={28} />
          </span>
        ) : (
          <CBAILogo showTagline />
        )}
      </Link>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {platformNavSections.map((section) => (
          <div key={section.title}>
            {!isHome ? (
              <p className="mb-2 px-3 text-[10px] font-medium uppercase tracking-widest text-zinc-600">
                {section.title}
              </p>
            ) : null}
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive = isNavItemActive(pathname, item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={isHome ? item.label : undefined}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-cyan-500/10 text-cyan-400"
                        : "text-zinc-400 hover:bg-slate-900/80 hover:text-zinc-50"
                    } ${isHome ? "justify-center px-2" : ""}`}
                  >
                    <NavIcon name={item.icon} />
                    {!isHome ? item.label : null}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {!isHome ? (
        <div className="border-t border-cyan-500/10 p-4">
          <div className="rounded-xl border border-cyan-500/10 bg-slate-950/60 p-3 backdrop-blur-sm">
            <p className="text-xs font-medium text-zinc-300">Start with Search</p>
            <p className="mt-1 text-xs text-zinc-500">
              Find a profile, review available information, and open reports.
            </p>
            <Link
              href="/search"
              className="mt-3 inline-flex text-xs font-medium text-cyan-400 hover:text-cyan-300"
            >
              Open Search →
            </Link>
          </div>
        </div>
      ) : null}
    </aside>
  );
}
