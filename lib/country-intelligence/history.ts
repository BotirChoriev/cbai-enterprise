/**
 * Historical series helpers — gaps and methodology breaks are first-class.
 * Never draw continuous lines across incompatible or missing observations.
 */

import type { HistoricalObservation, IndicatorSeries } from "@/lib/country-intelligence/types";

export type HistoryWindow = 5 | 10 | 20 | "all";

export type ChartSegment =
  | { readonly kind: "point"; readonly year: number; readonly value: number | string }
  | { readonly kind: "gap"; readonly fromYear: number; readonly toYear: number; readonly reason: string }
  | {
      readonly kind: "methodology_break";
      readonly year: number;
      readonly note: string;
    };

/**
 * Build chart segments that never connect across gaps or methodology breaks.
 */
export function buildHistoryChartSegments(
  observations: readonly HistoricalObservation[],
): readonly ChartSegment[] {
  const sorted = [...observations].sort((a, b) => a.year - b.year);
  const segments: ChartSegment[] = [];
  let prev: HistoricalObservation | null = null;

  for (const obs of sorted) {
    if (obs.gap || obs.value === null) {
      if (prev) {
        segments.push({
          kind: "gap",
          fromYear: prev.year,
          toYear: obs.year,
          reason: "No verified comparable observation",
        });
      }
      prev = null;
      continue;
    }

    if (obs.methodologyBreak) {
      segments.push({
        kind: "methodology_break",
        year: obs.year,
        note: "Methodology changed — not continuously comparable",
      });
      prev = null;
    }

    if (obs.comparabilityStatus === "not_comparable" || obs.comparabilityStatus === "methodology_break") {
      if (prev) {
        segments.push({
          kind: "gap",
          fromYear: prev.year,
          toYear: obs.year,
          reason: "Not comparable across methodology",
        });
      }
      segments.push({ kind: "point", year: obs.year, value: obs.value });
      prev = null;
      continue;
    }

    segments.push({ kind: "point", year: obs.year, value: obs.value });
    prev = obs;
  }

  return segments;
}

export function filterHistoryWindow(
  series: IndicatorSeries,
  window: HistoryWindow,
  latestYear = new Date().getFullYear(),
): readonly HistoricalObservation[] {
  if (window === "all") return series.observations;
  const minYear = latestYear - window + 1;
  return series.observations.filter((o) => o.year >= minYear);
}

/** Accessible table rows for a series (screen-reader alternative to charts). */
export function historyTableRows(
  observations: readonly HistoricalObservation[],
): readonly {
  year: number;
  value: string;
  status: string;
  source: string;
  notes: string;
}[] {
  return observations.map((o) => ({
    year: o.year,
    value: o.value === null ? "No verified data available" : String(o.value),
    status: o.evidenceStatus,
    source: o.sourceOrganization ?? "—",
    notes: [
      o.gap ? "gap" : null,
      o.methodologyBreak ? "methodology break" : null,
      o.revisionNote,
    ]
      .filter(Boolean)
      .join("; "),
  }));
}

/**
 * Empty honest series for a domain indicator — used when no verified data exists.
 * Does not invent years or values.
 */
export function emptyIndicatorSeriesPlaceholder(
  indicatorId: string,
  domainId: IndicatorSeries["domainId"],
): IndicatorSeries {
  const latest = {
    id: `${indicatorId}:latest`,
    domainId,
    indicatorId,
    localizedLabelKey: indicatorId,
    officialSourceLabel: null,
    value: null,
    unit: null,
    observationDate: null,
    geographicCoverage: null,
    sourceOrganization: null,
    sourceUrl: null,
    datasetName: null,
    releaseDate: null,
    methodologyUrl: null,
    methodologyNote: null,
    evidenceStatus: "not_available" as const,
    comparabilityStatus: "unknown" as const,
    freshnessStatus: "unknown" as const,
    missingDataReason: "No verified observation is connected for this indicator.",
    revisionNote: null,
    provenance: "uncertainty" as const,
    officialTarget: null,
    scenarioValue: null,
  };
  return {
    indicatorId,
    domainId,
    unit: null,
    observations: [],
    latest,
  };
}
