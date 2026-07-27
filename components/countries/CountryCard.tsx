"use client";

import type { Country } from "@/lib/countries";
import {
  buildCountryIntelligenceProfile,
  resolveCountryListEvidenceLabel,
  countryEvidenceStatusClass,
} from "@/lib/countries.intelligence";
import { getCountryRelationships } from "@/lib/countries.adapter";
import { buildCountryProfile } from "@/lib/country-intelligence/profile";
import { DOMAIN_DEFINITIONS } from "@/lib/country-intelligence/domains";
import CountryFlagMark from "@/components/countries/CountryFlagMark";
import { useTranslation } from "@/lib/i18n/use-translation";
import { translateEntityListEvidenceLabel } from "@/lib/i18n/entity-ui-translation";
import { getDictionary } from "@/lib/i18n/translate";
import { COUNTRY_LOCALIZED_NAMES } from "@/lib/i18n/country-names";
import {
  fillCountryCopy,
  getCountryIntelligenceCopy,
  type CountryIntelligenceCopy,
} from "@/lib/i18n/platform-copy-country-intelligence";
import { cbaiFocusRing } from "@/components/brand/brand-classes";

type CountryCardProps = {
  country: Country;
  isSelected: boolean;
  onSelect: () => void;
  comparisonSelected?: boolean;
  onToggleComparison?: () => void;
};

function localizedName(countryId: string, english: string, language: string): string {
  const loc = COUNTRY_LOCALIZED_NAMES[countryId];
  if (!loc) return english;
  if (language === "uz") return loc.uz;
  if (language === "ru") return loc.ru;
  if (language === "tr") return loc.tr;
  return english;
}

function domainShort(copy: CountryIntelligenceCopy, key: string): string {
  return (copy as Record<string, string>)[key] ?? key;
}

export default function CountryCard({
  country,
  isSelected,
  onSelect,
  comparisonSelected = false,
  onToggleComparison,
}: CountryCardProps) {
  const { language, t } = useTranslation();
  const dictionary = getDictionary(language);
  const cis = getCountryIntelligenceCopy(language);
  const name = localizedName(country.id, country.name, language);
  const cisProfile = buildCountryProfile(country);
  const profile = buildCountryIntelligenceProfile(
    country,
    getCountryRelationships(country),
  );
  const evidenceLabel = translateEntityListEvidenceLabel(
    dictionary,
    resolveCountryListEvidenceLabel(profile),
  );
  const evidenceClass = countryEvidenceStatusClass(
    profile.referenceConnected ? "connected" : "insufficient",
  );

  const statusDomains = DOMAIN_DEFINITIONS.slice(0, 5);

  return (
    <div
      className={`rounded-xl border p-3 transition-all ${
        isSelected
          ? "border-teal-500/40 bg-teal-500/5 ring-1 ring-teal-500/20"
          : "border-[var(--cbai-border)] bg-[color-mix(in_oklab,var(--cbai-surface)_85%,transparent)] hover:border-teal-500/25"
      }`}
      data-cbai-country-card=""
    >
      <button
        type="button"
        onClick={onSelect}
        className={`${cbaiFocusRing} w-full rounded-lg text-left`}
        aria-pressed={isSelected}
        aria-label={fillCountryCopy(cis.openIntelligenceProfile, {}) + `: ${name}`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <CountryFlagMark isoAlpha2={country.code} displayName={name} size="md" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[var(--cbai-text-primary)]">{name}</p>
              <p className="text-[10px] uppercase tracking-wider text-[var(--cbai-text-muted)]">
                {cis.isoCode} {country.code} · {country.region}
              </p>
            </div>
          </div>
          {isSelected ? (
            <span className="shrink-0 rounded-md bg-teal-500/10 px-2 py-0.5 text-[10px] font-medium text-teal-700 dark:text-teal-300">
              {t("entities.selected")}
            </span>
          ) : null}
        </div>

        <div className="mt-3 space-y-2">
          <p className="text-xs text-[var(--cbai-text-secondary)]">
            {cis.capital}: {country.capital}
          </p>
          <p className="text-[11px] text-[var(--cbai-text-muted)]">
            {cisProfile.lastVerifiedDate ?? cis.lastVerifiedUnknown}
          </p>
          <span
            className={`inline-flex rounded-md border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${evidenceClass}`}
          >
            {evidenceLabel}
          </span>
          <div className="flex flex-wrap gap-1" aria-label={cis.indicatorDomain}>
            {statusDomains.map((d) => {
              const slot = cisProfile.domainSlots.find((s) => s.domainId === d.id);
              const missing = slot?.latest?.value == null;
              return (
                <span
                  key={d.id}
                  title={domainShort(cis, d.labelKey)}
                  className={`inline-flex h-6 min-w-6 items-center justify-center rounded border px-1 text-[9px] ${
                    missing
                      ? "border-[var(--cbai-border)] text-[var(--cbai-text-muted)]"
                      : "border-teal-500/30 text-teal-700 dark:text-teal-300"
                  }`}
                >
                  {missing ? "·" : "✓"}
                  <span className="sr-only">
                    {domainShort(cis, d.labelKey)}:{" "}
                    {missing ? cis.noVerifiedData : cis.evidenceStatus}
                  </span>
                </span>
              );
            })}
          </div>
        </div>
      </button>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onSelect}
          className={`${cbaiFocusRing} min-h-11 rounded-lg border border-teal-500/30 bg-teal-500/10 px-3 text-xs font-medium text-teal-800 dark:text-teal-200`}
        >
          {cis.openIntelligenceProfile}
        </button>
        {onToggleComparison ? (
          <button
            type="button"
            onClick={onToggleComparison}
            aria-pressed={comparisonSelected}
            className={`${cbaiFocusRing} min-h-11 rounded-lg border border-[var(--cbai-border)] px-3 text-xs font-medium text-[var(--cbai-text-secondary)]`}
          >
            {comparisonSelected ? cis.removeFromComparison : cis.addToComparison}
          </button>
        ) : null}
      </div>
    </div>
  );
}
