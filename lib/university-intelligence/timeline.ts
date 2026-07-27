/**
 * Five-year research timeline helpers — classify observed vs plan vs scenario.
 */

import type {
  TimelineClassification,
  UniversityResearchTimelineYear,
} from "@/lib/university-intelligence/types";

export function classifyTimelinePoint(input: {
  readonly isFuture: boolean;
  readonly hasOfficialSource: boolean;
  readonly isCbaiScenario: boolean;
  readonly hasObservedValue: boolean;
}): TimelineClassification {
  if (input.isCbaiScenario) return "cbai_scenario";
  if (input.isFuture && input.hasOfficialSource) return "official_future_plan";
  if (input.isFuture) return "cbai_inference";
  if (input.hasObservedValue) return "observed_historical";
  return "current_verified";
}

/**
 * Build an empty five-year window with honest not_connected coverage.
 * Does not invent yearly counts.
 */
export function buildEmptyFiveYearTimeline(
  latestYear = new Date().getFullYear(),
): readonly UniversityResearchTimelineYear[] {
  const years: UniversityResearchTimelineYear[] = [];
  for (let y = latestYear - 4; y <= latestYear; y++) {
    years.push({
      year: y,
      projectsStarted: null,
      projectsCompleted: null,
      publications: null,
      datasets: null,
      patents: null,
      grants: null,
      laboratoriesOpened: null,
      collaborationsStarted: null,
      verifiedEvents: [],
      sourceCoverage: "not_connected",
      classification: y === latestYear ? "current_verified" : "observed_historical",
    });
  }
  return years;
}

export function timelineTableRows(years: readonly UniversityResearchTimelineYear[]): readonly {
  year: number;
  publications: string;
  projects: string;
  classification: TimelineClassification;
  coverage: string;
}[] {
  return years.map((y) => ({
    year: y.year,
    publications: y.publications == null ? "No verified data available" : String(y.publications),
    projects:
      y.projectsStarted == null && y.projectsCompleted == null
        ? "No verified data available"
        : `${y.projectsStarted ?? "—"} / ${y.projectsCompleted ?? "—"}`,
    classification: y.classification,
    coverage: y.sourceCoverage,
  }));
}
