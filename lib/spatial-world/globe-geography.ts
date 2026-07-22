/**
 * Globe geography helpers — factual capital coordinates for registry countries only.
 * No invented activity scores, arcs, or heatmap values.
 */

import { countries, type Country } from "@/lib/countries";

/** Capital coordinates from the local registry (WGS84). */
const CAPITAL_COORDINATES: Record<string, { lat: number; lng: number }> = {
  usa: { lat: 38.9072, lng: -77.0369 },
  china: { lat: 39.9042, lng: 116.4074 },
  uzbekistan: { lat: 41.2995, lng: 69.2401 },
  germany: { lat: 52.52, lng: 13.405 },
  uae: { lat: 24.4539, lng: 54.3773 },
  japan: { lat: 35.6762, lng: 139.6503 },
};

export type GlobeCountryPoint = {
  country: Country;
  lat: number;
  lng: number;
  href: string;
};

export function getGlobeCountryPoints(): GlobeCountryPoint[] {
  return countries
    .map((country) => {
      const coords = CAPITAL_COORDINATES[country.id];
      if (!coords) return null;
      return {
        country,
        lat: coords.lat,
        lng: coords.lng,
        href: `/countries?country=${encodeURIComponent(country.id)}`,
      };
    })
    .filter((entry): entry is GlobeCountryPoint => entry !== null);
}

/** Convert WGS84 degrees to a unit-sphere surface point (Y-up, radius 1). */
export function latLngToUnitVector(lat: number, lng: number): { x: number; y: number; z: number } {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lng + 180) * Math.PI) / 180;
  return {
    x: -Math.sin(phi) * Math.cos(theta),
    y: Math.cos(phi),
    z: Math.sin(phi) * Math.sin(theta),
  };
}

export function countryIntelligenceHref(countryId: string): string {
  return `/countries?country=${encodeURIComponent(countryId)}`;
}
