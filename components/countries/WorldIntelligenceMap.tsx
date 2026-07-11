"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import StatusBadge from "@/components/shared/StatusBadge";
import { PRODUCT_STATUSES } from "@/lib/product-status";
import { buildWorldIntelligenceMap, searchWorldMapCountries, type WorldMapCountry } from "@/lib/world-map";
import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

const LEGEND_STATUSES = PRODUCT_STATUSES.filter((status) =>
  (["live", "partial", "waiting_for_verified_data", "preview"] as const).includes(
    status as "live" | "partial" | "waiting_for_verified_data" | "preview",
  ),
);

function CountryTile({ entry }: { entry: WorldMapCountry }) {
  return (
    <Link
      href={entry.href}
      className="flex flex-col gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2.5 transition-colors hover:border-cyan-500/30 hover:bg-zinc-900"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-zinc-100">{entry.country.name}</span>
        <span className="text-[10px] font-mono text-zinc-600">{entry.country.code}</span>
      </div>
      <StatusBadge status={entry.status} />
    </Link>
  );
}

/**
 * World Intelligence Map (Release 5, Phase 6) — real country catalog only, grouped by real
 * region, each with an honest data status. Presented as an accessible, keyboard-navigable grid of
 * real links (every tile is a real <a>, not a canvas/SVG image), with a text search over the same
 * data as the primary "list-based fallback" — there is no separate degraded mode because nothing
 * here depends on visual map rendering to be usable. No scores, ratings, heatmaps, or alerts.
 */
export default function WorldIntelligenceMap() {
  const [query, setQuery] = useState("");
  const regionGroups = useMemo(() => buildWorldIntelligenceMap(), []);
  const searchResults = useMemo(() => (query.trim() ? searchWorldMapCountries(query) : null), [query]);

  return (
    <section aria-labelledby="world-map-heading" className={`${cbaiGlassCard} space-y-5 p-5 sm:p-6`}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className={cbaiSectionEyebrow}>World Intelligence Map</p>
          <h2 id="world-map-heading" className="mt-1 text-lg font-semibold text-zinc-100">
            Which countries have profiles?
          </h2>
          <p className="mt-1 max-w-xl text-sm text-zinc-500">
            Every country in the local registry, grouped by region, with its real evidence data
            status. Select a country to open its profile.
          </p>
        </div>
        <label className="w-full max-w-xs space-y-1 sm:w-56">
          <span className="sr-only" id="world-map-search-label">
            Search countries by name, code, or region
          </span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search countries…"
            aria-labelledby="world-map-search-label"
            className="w-full rounded-lg border border-zinc-800 bg-slate-900/80 px-3 py-2 text-sm text-zinc-200 outline-none transition-colors focus:border-cyan-500/30 focus:ring-1 focus:ring-cyan-500/20"
          />
        </label>
      </div>

      <ul className="flex flex-wrap items-center gap-3" aria-label="Data status legend">
        {LEGEND_STATUSES.map((status) => (
          <li key={status} className="flex items-center gap-1.5 text-xs text-zinc-500">
            <StatusBadge status={status} />
          </li>
        ))}
      </ul>

      {searchResults ? (
        <div className="space-y-2">
          <p className="text-xs text-zinc-500">
            {searchResults.length} countr{searchResults.length === 1 ? "y" : "ies"} match
            &quot;{query}&quot;
          </p>
          {searchResults.length > 0 ? (
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3" role="list" aria-label="Search results">
              {searchResults.map((entry) => (
                <CountryTile key={entry.country.id} entry={entry} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-500">
              No country matches &quot;{query}&quot; in the local registry.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-5">
          {regionGroups.map((group) => (
            <div key={group.region} className="space-y-2">
              <h3 className="text-xs font-medium uppercase tracking-wider text-zinc-600">
                {group.region}
              </h3>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3" role="list" aria-label={`${group.region} countries`}>
                {group.countries.map((entry) => (
                  <CountryTile key={entry.country.id} entry={entry} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
