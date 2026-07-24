"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import StatusBadge from "@/components/shared/StatusBadge";
import { useTranslation } from "@/lib/i18n/use-translation";
import { translateCountryRegion } from "@/lib/i18n/entity-ui-translation";
import { getDictionary } from "@/lib/i18n/translate";
import { PRODUCT_STATUSES, PRODUCT_STATUS_DOT_CLASSES } from "@/lib/product-status";
import { buildWorldIntelligenceMap, searchWorldMapCountries, type WorldMapCountry } from "@/lib/world-map";
import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

const LEGEND_STATUSES = PRODUCT_STATUSES.filter((status) =>
  (["live", "partial", "waiting_for_verified_data", "preview"] as const).includes(
    status as "live" | "partial" | "waiting_for_verified_data" | "preview",
  ),
);

const STATUS_ACCENT_BORDER: Record<WorldMapCountry["status"], string> = {
  live: "hover:border-emerald-500/50",
  partial: "hover:border-teal-500/40",
  waiting_for_verified_data: "hover:border-amber-500/40",
  preview: "hover:border-violet-500/40",
  restricted: "hover:border-orange-500/40",
  not_connected: "hover:border-zinc-600/60",
  planned: "hover:border-zinc-500/60",
};

function CountryTile({ entry }: { entry: WorldMapCountry }) {
  return (
    <Link
      href={entry.href}
      className={`group relative flex flex-col gap-2 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3.5 transition-all hover:-translate-y-0.5 hover:bg-zinc-900 hover:shadow-[0_12px_32px_-16px_rgba(0,88,16,0.35)] ${STATUS_ACCENT_BORDER[entry.status]}`}
    >
      <span
        aria-hidden="true"
        className={`absolute inset-y-0 left-0 w-[3px] ${PRODUCT_STATUS_DOT_CLASSES[entry.status]} opacity-70`}
      />
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold text-zinc-100">{entry.country.name}</span>
        <span className="text-[10px] font-mono text-zinc-600">{entry.country.code}</span>
      </div>
      <StatusBadge status={entry.status} />
    </Link>
  );
}

export default function WorldIntelligenceMap() {
  const { t, language } = useTranslation();
  const dictionary = getDictionary(language);
  const [query, setQuery] = useState("");
  const regionGroups = useMemo(() => buildWorldIntelligenceMap(), []);
  const searchResults = useMemo(() => (query.trim() ? searchWorldMapCountries(query) : null), [query]);

  return (
    <section aria-labelledby="world-map-heading" className={`${cbaiGlassCard} relative space-y-5 overflow-hidden p-5 sm:p-6`}>
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute -right-10 -top-10 h-64 w-64 text-[#005810] opacity-[0.07]"
        viewBox="0 0 200 200"
        fill="none"
      >
        <g stroke="currentColor" strokeWidth="1">
          <path d="M20 40 L90 20 L150 60 L110 130 L40 110 Z" />
          <path d="M90 20 L110 130" />
          <path d="M20 40 L150 60" />
          <path d="M150 60 L180 150" />
        </g>
        <g fill="currentColor">
          <circle cx="20" cy="40" r="3" />
          <circle cx="90" cy="20" r="3" />
          <circle cx="150" cy="60" r="4" />
          <circle cx="110" cy="130" r="3" />
          <circle cx="40" cy="110" r="2.5" />
          <circle cx="180" cy="150" r="2.5" />
        </g>
      </svg>

      <div className="relative flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className={cbaiSectionEyebrow}>{t("entities.worldMapTitle")}</p>
          <h2 id="world-map-heading" className="mt-1 text-lg font-semibold text-zinc-100">
            {t("entities.worldMapHeading")}
          </h2>
          <p className="mt-1 max-w-xl text-sm text-zinc-500">{t("entities.worldMapDescription")}</p>
        </div>
        <label className="w-full max-w-xs space-y-1 sm:w-56">
          <span className="sr-only" id="world-map-search-label">
            {t("entities.worldMapSearchLabel")}
          </span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("entities.worldMapSearchPlaceholder")}
            aria-labelledby="world-map-search-label"
            className="w-full rounded-lg border border-zinc-800 bg-slate-900/80 px-3 py-2 text-sm text-zinc-200 outline-none transition-colors focus:border-teal-500/30 focus:ring-1 focus:ring-teal-500/20"
          />
        </label>
      </div>

      <ul className="flex flex-wrap items-center gap-3" aria-label={t("entities.worldMapLegendAria")}>
        {LEGEND_STATUSES.map((status) => (
          <li key={status} className="flex items-center gap-1.5 text-xs text-zinc-500">
            <StatusBadge status={status} />
          </li>
        ))}
      </ul>

      {searchResults ? (
        <div className="space-y-2">
          <p className="text-xs text-zinc-500">
            {searchResults.length === 1
              ? t("entities.worldMapResultsMatchOne", { query })
              : t("entities.worldMapResultsMatch", { count: String(searchResults.length), query })}
          </p>
          {searchResults.length > 0 ? (
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3" role="list" aria-label={t("entities.worldMapSearchLabel")}>
              {searchResults.map((entry) => (
                <CountryTile key={entry.country.id} entry={entry} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-500">{t("entities.worldMapNoMatch", { query })}</p>
          )}
        </div>
      ) : (
        <div className="space-y-5">
          {regionGroups.map((group) => {
            const regionLabel = translateCountryRegion(dictionary, group.region);
            return (
            <div key={group.region} className="space-y-2">
              <h3 className="text-xs font-medium uppercase tracking-wider text-zinc-600">{regionLabel}</h3>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3" role="list" aria-label={regionLabel}>
                {group.countries.map((entry) => (
                  <CountryTile key={entry.country.id} entry={entry} />
                ))}
              </div>
            </div>
          );
          })}
        </div>
      )}
    </section>
  );
}
