"use client";

import type { CountryRegion } from "@/lib/countries";
import { regions } from "@/lib/countries";
import { COUNTRY_INTELLIGENCE_DOMAINS } from "@/lib/country-intelligence/types";
import { DOMAIN_DEFINITIONS } from "@/lib/country-intelligence/domains";
import { useTranslation } from "@/lib/i18n/use-translation";
import { translateCountryRegion } from "@/lib/i18n/entity-ui-translation";
import { getDictionary } from "@/lib/i18n/translate";
import {
  getCountryIntelligenceCopy,
  type CountryIntelligenceCopy,
} from "@/lib/i18n/platform-copy-country-intelligence";
import { cbaiFocusRing, cbaiMineralPanel } from "@/components/brand/brand-classes";

export type CoverageFilter = "all" | "identity_only" | "structured_empty" | "connected";
export type FreshnessFilter = "all" | "unknown" | "current" | "stale";

type CountryFiltersProps = {
  search: string;
  region: CountryRegion | "All";
  coverage: CoverageFilter;
  freshness: FreshnessFilter;
  domain: "all" | (typeof COUNTRY_INTELLIGENCE_DOMAINS)[number];
  comparisonOnly: boolean;
  onSearchChange: (value: string) => void;
  onRegionChange: (value: CountryRegion | "All") => void;
  onCoverageChange: (value: CoverageFilter) => void;
  onFreshnessChange: (value: FreshnessFilter) => void;
  onDomainChange: (value: CountryFiltersProps["domain"]) => void;
  onComparisonOnlyChange: (value: boolean) => void;
  resultCount: number;
  mobileOpen?: boolean;
  onMobileOpenChange?: (open: boolean) => void;
};

function domainLabel(copy: CountryIntelligenceCopy, id: string): string {
  const def = DOMAIN_DEFINITIONS.find((d) => d.id === id);
  if (!def) return id;
  return (copy as Record<string, string>)[def.labelKey] ?? id;
}

export default function CountryFilters({
  search,
  region,
  coverage,
  freshness,
  domain,
  comparisonOnly,
  onSearchChange,
  onRegionChange,
  onCoverageChange,
  onFreshnessChange,
  onDomainChange,
  onComparisonOnlyChange,
  resultCount,
  mobileOpen = true,
  onMobileOpenChange,
}: CountryFiltersProps) {
  const { t, language } = useTranslation();
  const dictionary = getDictionary(language);
  const cis = getCountryIntelligenceCopy(language);
  const resultLabel =
    resultCount === 1
      ? t("filters.resultCountry", { count: String(resultCount) })
      : t("filters.resultCountries", { count: String(resultCount) });

  const rail = (
    <div className={`${cbaiMineralPanel} flex flex-col gap-3`} data-cbai-country-filters="">
      <div className="relative">
        <label htmlFor="cis-country-search" className="sr-only">
          {cis.searchCountries}
        </label>
        <input
          id="cis-country-search"
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={cis.searchCountries}
          className={`${cbaiFocusRing} w-full rounded-lg border border-[var(--cbai-border)] bg-[var(--cbai-surface)] px-3 py-2.5 text-sm text-[var(--cbai-text-primary)]`}
        />
      </div>

      <fieldset>
        <legend className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-[var(--cbai-text-muted)]">
          {cis.region}
        </legend>
        <div className="flex flex-wrap gap-1">
          <button
            type="button"
            className={`${cbaiFocusRing} min-h-11 rounded-md border px-2.5 text-xs ${
              region === "All" ? "border-teal-500/40 text-teal-700 dark:text-teal-300" : "border-[var(--cbai-border)]"
            }`}
            aria-pressed={region === "All"}
            onClick={() => onRegionChange("All")}
          >
            {cis.filterAll}
          </button>
          {regions.map((r) => (
            <button
              key={r}
              type="button"
              className={`${cbaiFocusRing} min-h-11 rounded-md border px-2.5 text-xs ${
                region === r ? "border-teal-500/40 text-teal-700 dark:text-teal-300" : "border-[var(--cbai-border)]"
              }`}
              aria-pressed={region === r}
              onClick={() => onRegionChange(r)}
            >
              {translateCountryRegion(dictionary, r)}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-2 sm:grid-cols-2">
        <label className="block text-xs text-[var(--cbai-text-secondary)]">
          {cis.dataCoverage}
          <select
            className={`${cbaiFocusRing} mt-1 w-full min-h-11 rounded-md border border-[var(--cbai-border)] bg-[var(--cbai-surface)] px-2 text-sm`}
            value={coverage}
            onChange={(e) => onCoverageChange(e.target.value as CoverageFilter)}
          >
            <option value="all">{cis.filterAll}</option>
            <option value="structured_empty">structured_empty</option>
            <option value="connected">connected</option>
            <option value="identity_only">identity_only</option>
          </select>
        </label>
        <label className="block text-xs text-[var(--cbai-text-secondary)]">
          {cis.freshness}
          <select
            className={`${cbaiFocusRing} mt-1 w-full min-h-11 rounded-md border border-[var(--cbai-border)] bg-[var(--cbai-surface)] px-2 text-sm`}
            value={freshness}
            onChange={(e) => onFreshnessChange(e.target.value as FreshnessFilter)}
          >
            <option value="all">{cis.filterAll}</option>
            <option value="unknown">unknown</option>
            <option value="current">current</option>
            <option value="stale">stale</option>
          </select>
        </label>
      </div>

      <label className="block text-xs text-[var(--cbai-text-secondary)]">
        {cis.indicatorDomain}
        <select
          className={`${cbaiFocusRing} mt-1 w-full min-h-11 rounded-md border border-[var(--cbai-border)] bg-[var(--cbai-surface)] px-2 text-sm`}
          value={domain}
          onChange={(e) => onDomainChange(e.target.value as CountryFiltersProps["domain"])}
        >
          <option value="all">{cis.filterAll}</option>
          {COUNTRY_INTELLIGENCE_DOMAINS.map((id) => (
            <option key={id} value={id}>
              {domainLabel(cis, id)}
            </option>
          ))}
        </select>
      </label>

      <label className="flex min-h-11 items-center gap-2 text-sm text-[var(--cbai-text-secondary)]">
        <input
          type="checkbox"
          checked={comparisonOnly}
          onChange={(e) => onComparisonOnlyChange(e.target.checked)}
          className={cbaiFocusRing}
        />
        {cis.comparisonEligible}
      </label>

      <p className="text-xs text-[var(--cbai-text-muted)]">{resultLabel}</p>
    </div>
  );

  return (
    <div>
      <div className="mb-2 flex md:hidden">
        <button
          type="button"
          className={`${cbaiFocusRing} min-h-11 rounded-lg border border-[var(--cbai-border)] px-3 text-sm`}
          aria-expanded={mobileOpen}
          onClick={() => onMobileOpenChange?.(!mobileOpen)}
        >
          {mobileOpen ? cis.filtersClose : cis.filtersOpen}
        </button>
      </div>
      <div className={mobileOpen ? "block" : "hidden md:block"}>{rail}</div>
    </div>
  );
}
