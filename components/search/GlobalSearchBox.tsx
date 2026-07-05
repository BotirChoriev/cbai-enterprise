"use client";

type GlobalSearchBoxProps = {
  query: string;
  onQueryChange: (value: string) => void;
  resultCount: number;
};

const suggestions = [
  "Uzbekistan",
  "AI readiness",
  "NVIDIA",
  "Stanford",
  "investment",
  "low risk",
];

export default function GlobalSearchBox({
  query,
  onQueryChange,
  resultCount,
}: GlobalSearchBoxProps) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-sky-500/5 via-violet-500/10 to-cyan-500/5"
      />

      <div className="relative border-b border-zinc-800 px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-50" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-sky-400" />
          </span>
          <div>
            <h2 className="text-sm font-semibold tracking-wide text-zinc-50">
              Global Intelligence Search
            </h2>
            <p className="text-xs text-zinc-500">
              Search across {resultCount} indexed entities · Countries · Companies · Universities
            </p>
          </div>
        </div>
      </div>

      <div className="relative p-6">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-1 focus-within:border-sky-500/40 focus-within:ring-1 focus-within:ring-sky-500/20">
          <div className="flex items-center gap-3 px-4 py-3">
            <svg
              className="h-5 w-5 shrink-0 text-zinc-500"
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
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="Search countries, companies, universities, industries, AI topics..."
              className="w-full bg-transparent font-mono text-sm text-zinc-100 placeholder:text-zinc-600 outline-none"
            />
            <kbd className="hidden shrink-0 rounded border border-zinc-700 bg-zinc-800 px-2 py-0.5 font-mono text-[10px] text-zinc-500 sm:inline">
              ⌘K
            </kbd>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onQueryChange(s)}
              className="rounded-full border border-zinc-800 bg-zinc-900/40 px-3 py-1.5 font-mono text-xs text-zinc-400 transition-colors hover:border-sky-500/30 hover:bg-sky-500/10 hover:text-sky-300"
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
