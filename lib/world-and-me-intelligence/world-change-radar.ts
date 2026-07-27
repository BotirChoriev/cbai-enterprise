import type { LiveIntelligenceRecord, LiveFreshnessState } from "@/lib/world-and-me-intelligence/types";

export type WorldChangeRadarResult = {
  readonly records: readonly LiveIntelligenceRecord[];
  readonly freshness: LiveFreshnessState;
  readonly honestyNotice: string;
  readonly emptyState: string;
};

/** Honest empty radar — never invents news/activity. */
export function listWorldChangeRadar(): WorldChangeRadarResult {
  return {
    records: [],
    freshness: "no_verified_live_source",
    honestyNotice:
      "World Change Radar shows only source-backed dated records. No verified live source is connected yet.",
    emptyState: "No verified live source is connected yet.",
  };
}

export function isFabricatedLiveForbidden(records: readonly LiveIntelligenceRecord[]): boolean {
  return records.every((r) => r.sourceName || r.freshness === "no_verified_live_source");
}
