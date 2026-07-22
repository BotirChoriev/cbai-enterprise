"use client";

import type { UniversityType } from "@/lib/universities";
import { cbaiChip, cbaiChipActive, cbaiGlassCard } from "@/components/brand/brand-classes";
import { useTranslation } from "@/lib/i18n/use-translation";

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
  const { t } = useTranslation();

  return (
    <div className={`${cbaiGlassCard} space-y-3 p-3 sm:p-4`}>
      <div className="relative">
        <svg
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--cbai-text-muted)]"
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
          placeholder={t("universities.searchPlaceholder")}
          className="w-full rounded-lg border border-[var(--cbai-border-default)] bg-[var(--cbai-workspace-solid)] py-2 pl-10 pr-4 text-sm text-[var(--cbai-text-primary)] placeholder:text-[var(--cbai-text-muted)] outline-none transition-colors focus:border-[var(--cbai-border-active)]"
        />
      </div>

      <div>
        <p className="cbai-nav-eyebrow mb-2">{t("universities.filterCountry")}</p>
        <div className="flex flex-wrap gap-1.5">
          <FilterPill
            label={t("universities.filterAll")}
            active={country === "All"}
            onClick={() => onCountryChange("All")}
          />
          {countries.map((item) => (
            <FilterPill key={item} label={item} active={country === item} onClick={() => onCountryChange(item)} />
          ))}
        </div>
      </div>

      <div>
        <p className="cbai-nav-eyebrow mb-2">{t("universities.filterType")}</p>
        <div className="flex flex-wrap gap-1.5">
          <FilterPill
            label={t("universities.filterAll")}
            active={type === "All"}
            onClick={() => onTypeChange("All")}
          />
          {types.map((item) => (
            <FilterPill
              key={item}
              label={t(`universities.types.${item}` as "universities.types.Public")}
              active={type === item}
              onClick={() => onTypeChange(item)}
            />
          ))}
        </div>
      </div>

      <p className="text-xs text-[var(--cbai-text-muted)]">
        {t("universities.resultCount", { count: String(resultCount) })}
      </p>
    </div>
  );
}

function FilterPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={active ? cbaiChipActive : cbaiChip}>
      {label}
    </button>
  );
}
