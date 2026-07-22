"use client";

import type { CountryRegion } from "@/lib/countries";
import { regions } from "@/lib/countries";
import { cbaiGlassCard } from "@/components/brand/brand-classes";
import { useTranslation } from "@/lib/i18n/use-translation";
import { translateCountryRegion } from "@/lib/i18n/entity-ui-translation";
import { getDictionary } from "@/lib/i18n/translate";

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
  const { t, language } = useTranslation();
  const dictionary = getDictionary(language);
  const resultLabel =
    resultCount === 1
      ? t("filters.resultCountry", { count: String(resultCount) })
      : t("filters.resultCountries", { count: String(resultCount) });

  return (
    <div className={`${cbaiGlassCard} flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between`}>
      <div className="relative max-w-md flex-1">
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
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t("filters.searchCountries")}
          aria-label={t("filters.searchCountries")}
          className="w-full rounded-lg border border-zinc-800 bg-zinc-900/60 py-2 pl-10 pr-4 text-sm text-zinc-300 placeholder:text-zinc-600 outline-none transition-colors focus:border-teal-500/40 focus:ring-1 focus:ring-teal-500/20"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onRegionChange("All")}
          aria-pressed={region === "All"}
          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
            region === "All"
              ? "bg-teal-500/10 text-teal-400 ring-1 ring-teal-500/30"
              : "border border-zinc-800 text-zinc-500 hover:text-zinc-300"
          }`}
        >
          {t("filters.allRegions")}
        </button>
        {regions.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => onRegionChange(r)}
            aria-pressed={region === r}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              region === r
                ? "bg-teal-500/10 text-teal-400 ring-1 ring-teal-500/30"
                : "border border-zinc-800 text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {translateCountryRegion(dictionary, r)}
          </button>
        ))}
      </div>

      <span className="font-mono text-xs text-zinc-600">{resultLabel}</span>
    </div>
  );
}
