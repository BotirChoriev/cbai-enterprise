"use client";

export default function Topbar() {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-zinc-800 bg-zinc-950/80 px-6 backdrop-blur-md">
      <div className="relative flex-1 max-w-md">
        <svg
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
          />
        </svg>
        <input
          type="search"
          placeholder="Search agents, workflows, documents..."
          className="w-full rounded-lg border border-zinc-800 bg-zinc-900/60 py-2 pl-10 pr-4 text-sm text-zinc-300 placeholder:text-zinc-600 outline-none transition-colors focus:border-zinc-700 focus:ring-1 focus:ring-sky-500/30"
        />
        <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border border-zinc-700 bg-zinc-800 px-1.5 py-0.5 font-mono text-[10px] text-zinc-500 sm:inline">
          ⌘K
        </kbd>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Notifications"
          className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-zinc-50"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
            />
          </svg>
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-sky-400" />
        </button>

        <button
          type="button"
          className="flex items-center gap-3 rounded-lg border border-zinc-800 py-1.5 pl-1.5 pr-3 transition-colors hover:bg-zinc-900"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-violet-500 to-purple-600 text-xs font-semibold text-white">
            JD
          </span>
          <div className="hidden text-left sm:block">
            <p className="text-xs font-medium text-zinc-200">Jane Doe</p>
            <p className="text-[10px] text-zinc-500">Admin</p>
          </div>
          <svg
            className="hidden h-4 w-4 text-zinc-500 sm:block"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 8.25l-7.5 7.5-7.5-7.5"
            />
          </svg>
        </button>
      </div>
    </header>
  );
}
