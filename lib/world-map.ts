/**
 * World Intelligence Map data model (Release 5, Phase 6). Real country catalog only — no
 * invented coordinates, scores, ratings, or heatmap values. Presented as a region-grouped grid
 * with an accessible list, not a hand-coded geographic SVG projection: this repository has no
 * map/geo-data library, and approximating country shapes or coordinates without one would itself
 * be a form of fabricated geography. See docs/product-activation-audit.md for the reasoning.
 */

import { countries, regions, type Country, type CountryRegion } from "@/lib/countries";
import { buildCountryCoverageProfile } from "@/lib/countries.coverage";
import { countConnectedSources, resolveEntityDataStatus } from "@/components/shared/entity-profile-copy";
import type { ProductStatus } from "@/lib/product-status";

export type WorldMapCountry = {
  country: Country;
  status: ProductStatus;
  href: string;
};

export type WorldMapRegionGroup = {
  region: CountryRegion;
  countries: WorldMapCountry[];
};

function resolveCountryStatus(country: Country): ProductStatus {
  const coverage = buildCountryCoverageProfile(country);
  return resolveEntityDataStatus(countConnectedSources(coverage), coverage.sources.length);
}

/** Every real country in the catalog, grouped by real region, with an honest data status each. */
export function buildWorldIntelligenceMap(): WorldMapRegionGroup[] {
  return regions
    .map((region) => ({
      region,
      countries: countries
        .filter((country) => country.region === region)
        .map((country) => ({
          country,
          status: resolveCountryStatus(country),
          href: `/countries?country=${encodeURIComponent(country.id)}`,
        })),
    }))
    .filter((group) => group.countries.length > 0);
}

export function searchWorldMapCountries(query: string): WorldMapCountry[] {
  const normalized = query.trim().toLowerCase();
  const all = countries.map((country) => ({
    country,
    status: resolveCountryStatus(country),
    href: `/countries?country=${encodeURIComponent(country.id)}`,
  }));
  if (!normalized) return all;
  return all.filter(
    (entry) =>
      entry.country.name.toLowerCase().includes(normalized) ||
      entry.country.code.toLowerCase().includes(normalized) ||
      entry.country.region.toLowerCase().includes(normalized),
  );
}
