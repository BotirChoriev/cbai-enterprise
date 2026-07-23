/**
 * Phase 1 official source registry.
 * Static defaults are Planned. World Bank may become Connected at runtime
 * only after verified WDI retrieval (see runtime-status.ts).
 */

import type { OfficialSourceRecord } from "@/lib/official-connector-foundation/types";
import { getWorldBankRuntimeStatus } from "@/lib/official-connector-foundation/runtime-status";

const STATIC_REGISTRY: readonly OfficialSourceRecord[] = [
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
    connectionStatus: "planned",
    defaultHealth: "planned",
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
    connectionStatus: "planned",
    defaultHealth: "planned",
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
    connectionStatus: "planned",
    defaultHealth: "planned",
  },
] as const;

/** Registry view with World Bank runtime status overlaid — no other slugs mutated. */
export function getFoundationSourceRegistry(): readonly OfficialSourceRecord[] {
  const wb = getWorldBankRuntimeStatus();
  return STATIC_REGISTRY.map((source) => {
    if (source.slug !== "world-bank") return source;
    return {
      ...source,
      connectionStatus: wb.status,
      defaultHealth: wb.health,
    };
  });
}

/** @deprecated Prefer getFoundationSourceRegistry() for runtime-aware status. */
export const FOUNDATION_SOURCE_REGISTRY = STATIC_REGISTRY;

export function getFoundationSourceBySlug(slug: string): OfficialSourceRecord | undefined {
  return getFoundationSourceRegistry().find((source) => source.slug === slug);
}

export function listPlannedFoundationSources(): readonly OfficialSourceRecord[] {
  return getFoundationSourceRegistry().filter((source) => source.connectionStatus === "planned");
}

export function countLiveFoundationSources(): number {
  return getFoundationSourceRegistry().filter((source) => source.connectionStatus === "live").length;
}

export function countConnectedFoundationSources(): number {
  return getFoundationSourceRegistry().filter((source) => source.connectionStatus === "connected")
    .length;
}
