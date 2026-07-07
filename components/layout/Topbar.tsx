"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Topbar() {
  const pathname = usePathname();
  const isPrimarySearchSurface = pathname === "/" || pathname === "/search";

  if (isPrimarySearchSurface) {
    return null;
  }

  return (
    <header className="flex h-14 shrink-0 items-center border-b border-cyan-500/10 bg-slate-950/90 px-6 backdrop-blur-md">
      <form
        action="/search"
        method="get"
        role="search"
        aria-label="Search country, company, or university"
        className="relative w-full max-w-md"
      >
        <label htmlFor="topbar-search" className="sr-only">
          Search country, company, or university
        </label>
        <svg
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
          />
        </svg>
        <input
          id="topbar-search"
          name="q"
          type="search"
          placeholder="Search country, company, or university"
          className="w-full rounded-lg border border-zinc-800 bg-slate-900/80 py-2 pl-10 pr-4 text-sm text-zinc-300 placeholder:text-zinc-600 outline-none transition-colors focus:border-cyan-500/30 focus:ring-1 focus:ring-cyan-500/20"
        />
      </form>
      <Link
        href="/search"
        className="ml-4 hidden shrink-0 text-sm font-medium text-cyan-400 transition-colors hover:text-cyan-300 sm:inline-flex"
      >
        Search →
      </Link>
    </header>
  );
}
