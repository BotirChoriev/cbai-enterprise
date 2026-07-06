"use client";

import type { UniversityType } from "@/lib/universities";

type UniversityFiltersProps = {
  search: string;
  country: string;
  type: string;
  countries: string[];
  types: UniversityType[];
  onSearchChange: (value: string) => void;
  onCountryChange: (value: string) => void;
  onTypeChange: (value: string) => void;
  resultCount: number;
};

export default function UniversityFilters({
  search,
  country,
  type,
  countries,
  types,
  onSearchChange,
  onCountryChange,
  onTypeChange,
  resultCount,
}: UniversityFiltersProps) {
  return (
    <div className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-950 p-4">
      <div className="relative">
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
          placeholder="Search by country, university name, institution type..."
          className="w-full rounded-lg border border-zinc-800 bg-zinc-900/60 py-2 pl-10 pr-4 text-sm text-zinc-300 placeholder:text-zinc-600 outline-none transition-colors focus:border-violet-500/40 focus:ring-1 focus:ring-violet-500/20"
        />
      </div>

      <div>
        <p className="mb-2 text-[10px] font-medium uppercase tracking-widest text-zinc-600">
          Country
        </p>
        <div className="flex flex-wrap gap-1.5">
          <FilterPill
            label="All"
            active={country === "All"}
            onClick={() => onCountryChange("All")}
          />
          {countries.map((item) => (
            <FilterPill
              key={item}
              label={item}
              active={country === item}
              onClick={() => onCountryChange(item)}
            />
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-[10px] font-medium uppercase tracking-widest text-zinc-600">
          Type
        </p>
        <div className="flex flex-wrap gap-1.5">
          <FilterPill
            label="All"
            active={type === "All"}
            onClick={() => onTypeChange("All")}
          />
          {types.map((item) => (
            <FilterPill
              key={item}
              label={item}
              active={type === item}
              onClick={() => onTypeChange(item)}
            />
          ))}
        </div>
      </div>

      <p className="font-mono text-xs text-zinc-600">
        {resultCount} {resultCount === 1 ? "university" : "universities"}
      </p>
    </div>
  );
}

function FilterPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${
        active
          ? "bg-violet-500/10 text-violet-400 ring-1 ring-violet-500/30"
          : "border border-zinc-800 text-zinc-500 hover:text-zinc-300"
      }`}
    >
      {label}
    </button>
  );
}
