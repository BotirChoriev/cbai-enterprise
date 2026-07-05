"use client";

import type { CountryRegion } from "@/lib/countries";
import { regions } from "@/lib/countries";

type CountryFiltersProps = {
  search: string;
  region: CountryRegion | "All";
  onSearchChange: (value: string) => void;
  onRegionChange: (value: CountryRegion | "All") => void;
  resultCount: number;
};

export default function CountryFilters({
  search,
  region,
  onSearchChange,
  onRegionChange,
  resultCount,
}: CountryFiltersProps) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-zinc-800 bg-zinc-950 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
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
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search countries..."
          className="w-full rounded-lg border border-zinc-800 bg-zinc-900/60 py-2 pl-10 pr-4 text-sm text-zinc-300 placeholder:text-zinc-600 outline-none transition-colors focus:border-sky-500/40 focus:ring-1 focus:ring-sky-500/20"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onRegionChange("All")}
          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
            region === "All"
              ? "bg-sky-500/10 text-sky-400 ring-1 ring-sky-500/30"
              : "border border-zinc-800 text-zinc-500 hover:text-zinc-300"
          }`}
        >
          All Regions
        </button>
        {regions.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => onRegionChange(r)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              region === r
                ? "bg-sky-500/10 text-sky-400 ring-1 ring-sky-500/30"
                : "border border-zinc-800 text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      <span className="font-mono text-xs text-zinc-600">
        {resultCount} {resultCount === 1 ? "country" : "countries"}
      </span>
    </div>
  );
}
