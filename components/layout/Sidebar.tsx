"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { mainNav } from "@/lib/navigation";
import NavIcon from "@/components/layout/NavIcon";

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-zinc-800 bg-zinc-950">
      <div className="flex h-16 items-center gap-2.5 border-b border-zinc-800 px-5">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-sky-400 to-blue-600 text-sm font-bold text-white">
          C
        </span>
        <div>
          <p className="text-sm font-semibold text-zinc-50">CBAI Enterprise</p>
          <p className="text-xs text-zinc-500">Acme Corp</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {mainNav.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

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
      </nav>

      <div className="border-t border-zinc-800 p-4">
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-3">
          <p className="text-xs font-medium text-zinc-300">Enterprise Plan</p>
          <p className="mt-1 text-xs text-zinc-500">847K / 1M tokens used</p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-800">
            <div className="h-full w-[84.7%] rounded-full bg-sky-500" />
          </div>
        </div>
      </div>
    </aside>
  );
}
