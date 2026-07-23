/**
 * Phase 1 official source registry — planned only.
 * No source is marked live.
 */

import type { OfficialSourceRecord } from "@/lib/official-connector-foundation/types";

export const FOUNDATION_SOURCE_REGISTRY: readonly OfficialSourceRecord[] = [
  {
    id: "fsrc-world-bank",
    slug: "world-bank",
    sourceName: "World Bank Open Data",
    sourceType: "international_org",
    officialSourceUrl: "https://data.worldbank.org",
    organization: "World Bank Group",
    jurisdictionScope: "Global country-coded statistics",
    updateFrequency: "As published (often annual)",
    license: "World Bank Open Data Terms of Use",
    connectionStatus: "connected",
    defaultHealth: "healthy",
  },
  {
    id: "fsrc-united-nations",
    slug: "united-nations",
    sourceName: "United Nations Statistics Division",
    sourceType: "international_org",
    officialSourceUrl: "https://unstats.un.org",
    organization: "United Nations",
    jurisdictionScope: "Global / treaty and SDG datasets",
    updateFrequency: "Varies by dataset",
    license: "UN data terms — per dataset",
    connectionStatus: "planned",
    defaultHealth: "planned",
  },
  {
    id: "fsrc-oecd",
    slug: "oecd",
    sourceName: "OECD",
    sourceType: "international_org",
    officialSourceUrl: "https://data.oecd.org",
    organization: "Organisation for Economic Co-operation and Development",
    jurisdictionScope: "OECD member economies only",
    updateFrequency: "Varies by dataset",
    license: "OECD data terms",
    connectionStatus: "planned",
    defaultHealth: "planned",
  },
  {
    id: "fsrc-us-census",
    slug: "us-census",
    sourceName: "U.S. Census Bureau",
    sourceType: "national_statistics",
    officialSourceUrl: "https://www.census.gov",
    organization: "United States Census Bureau",
    jurisdictionScope: "United States",
    updateFrequency: "Varies by program",
    license: "U.S. Government work",
    connectionStatus: "planned",
    defaultHealth: "planned",
  },
  {
    id: "fsrc-us-bea",
    slug: "us-bea",
    sourceName: "U.S. Bureau of Economic Analysis",
    sourceType: "national_statistics",
    officialSourceUrl: "https://www.bea.gov",
    organization: "U.S. Department of Commerce",
    jurisdictionScope: "United States",
    updateFrequency: "Quarterly / annual",
    license: "U.S. Government work",
    connectionStatus: "planned",
    defaultHealth: "planned",
  },
  {
    id: "fsrc-us-bls",
    slug: "us-bls",
    sourceName: "U.S. Bureau of Labor Statistics",
    sourceType: "national_statistics",
    officialSourceUrl: "https://www.bls.gov",
    organization: "U.S. Department of Labor",
    jurisdictionScope: "United States",
    updateFrequency: "Monthly",
    license: "U.S. Government work",
    connectionStatus: "connected",
    defaultHealth: "healthy",
  },
  {
    id: "fsrc-us-sec",
    slug: "us-sec",
    sourceName: "U.S. Securities and Exchange Commission",
    sourceType: "regulator",
    officialSourceUrl: "https://www.sec.gov",
    organization: "U.S. SEC",
    jurisdictionScope: "United States",
    updateFrequency: "As published",
    license: "SEC public disclosure",
    connectionStatus: "connected",
    defaultHealth: "healthy",
  },
] as const;

export function getFoundationSourceBySlug(slug: string): OfficialSourceRecord | undefined {
  return FOUNDATION_SOURCE_REGISTRY.find((source) => source.slug === slug);
}

export function listPlannedFoundationSources(): readonly OfficialSourceRecord[] {
  return FOUNDATION_SOURCE_REGISTRY.filter((source) => source.connectionStatus === "planned");
}

/** Phase 1 invariant: zero live sources. */
export function countLiveFoundationSources(): number {
  return FOUNDATION_SOURCE_REGISTRY.filter((source) => source.connectionStatus === "live").length;
}
