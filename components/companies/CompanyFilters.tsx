"use client";

type CompanyFiltersProps = {
  search: string;
  industry: string;
  country: string;
  industries: string[];
  countries: string[];
  onSearchChange: (value: string) => void;
  onIndustryChange: (value: string) => void;
  onCountryChange: (value: string) => void;
  resultCount: number;
};

export default function CompanyFilters({
  search,
  industry,
  country,
  industries,
  countries,
  onSearchChange,
  onIndustryChange,
  onCountryChange,
  resultCount,
}: CompanyFiltersProps) {
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
          placeholder="Search companies..."
          className="w-full rounded-lg border border-zinc-800 bg-zinc-900/60 py-2 pl-10 pr-4 text-sm text-zinc-300 placeholder:text-zinc-600 outline-none transition-colors focus:border-sky-500/40 focus:ring-1 focus:ring-sky-500/20"
        />
      </div>

      <div>
        <p className="mb-2 text-[10px] font-medium uppercase tracking-widest text-zinc-600">
          Industry
        </p>
        <div className="flex flex-wrap gap-1.5">
          <FilterPill
            label="All"
            active={industry === "All"}
            onClick={() => onIndustryChange("All")}
          />
          {industries.map((item) => (
            <FilterPill
              key={item}
              label={item}
              active={industry === item}
              onClick={() => onIndustryChange(item)}
            />
          ))}
        </div>
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

      <p className="font-mono text-xs text-zinc-600">
        {resultCount} {resultCount === 1 ? "company" : "companies"}
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
          ? "bg-sky-500/10 text-sky-400 ring-1 ring-sky-500/30"
          : "border border-zinc-800 text-zinc-500 hover:text-zinc-300"
      }`}
    >
      {label}
    </button>
  );
}
