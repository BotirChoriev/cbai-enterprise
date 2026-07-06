import type { Country } from "@/lib/countries";
import {
  buildCountryTimeline,
  buildCountryTimelineModel,
} from "@/lib/timeline/timeline-builder";
import { buildTimelineSummary } from "@/lib/timeline/timeline-summary";
import {
  timelineReadinessLabel,
  timelineReadinessStatusClass,
  timelineYearStatusClass,
} from "@/lib/timeline/timeline-readiness";
import type {
  CountryTimelineModel,
  TimelineRecord,
  TimelineSummary,
} from "@/lib/timeline/timeline-types";

/** Get country timeline record for a country catalog entry. */
export function getCountryTimeline(country: Country): TimelineRecord {
  return buildCountryTimeline(country);
}

/** Get UI-facing country timeline model. */
export function getCountryTimelineModel(country: Country): CountryTimelineModel {
  return buildCountryTimelineModel(country);
}

/** Get country timeline record and summary pair. */
export function getCountryTimelinePackage(
  country: Country,
): { record: TimelineRecord; summary: TimelineSummary } {
  const record = buildCountryTimeline(country);
  const summary = buildTimelineSummary(record);
  return { record, summary };
}

export {
  timelineReadinessLabel,
  timelineReadinessStatusClass,
  timelineYearStatusClass,
};
