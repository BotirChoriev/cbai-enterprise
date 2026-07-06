"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { platformNavSections } from "@/lib/navigation";
import NavIcon from "@/components/layout/NavIcon";

function isNavItemActive(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }

  if (href === "/dashboard") {
    return pathname === "/dashboard";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-zinc-800 bg-zinc-950">
      <Link
        href="/"
        className="flex h-16 items-center gap-2.5 border-b border-zinc-800 px-5 transition-colors hover:bg-zinc-900/50"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-sky-400 to-blue-600 text-sm font-bold text-white">
          C
        </span>
        <div>
          <p className="text-sm font-semibold text-zinc-50">CBAI Enterprise</p>
          <p className="text-xs text-zinc-500">Enterprise Alpha</p>
        </div>
      </Link>

      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
        {platformNavSections.map((section) => (
          <div key={section.title}>
            <p className="mb-2 px-3 text-[10px] font-medium uppercase tracking-widest text-zinc-600">
              {section.title}
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
                        ? "bg-sky-500/10 text-sky-400"
                        : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-50"
                    }`}
                  >
                    <NavIcon name={item.icon} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-zinc-800 p-4">
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-3">
          <p className="text-xs font-medium text-zinc-300">Start with Search</p>
          <p className="mt-1 text-xs text-zinc-500">
            Find a country and follow evidence through decision package to reports.
          </p>
          <Link
            href="/search"
            className="mt-3 inline-flex text-xs font-medium text-sky-400 hover:text-sky-300"
          >
            Open Search →
          </Link>
        </div>
      </div>
    </aside>
  );
}
