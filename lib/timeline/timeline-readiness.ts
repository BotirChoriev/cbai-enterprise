import type {
  TimelineReadinessStatus,
  TimelineYearEntry,
  TimelineYearStatus,
} from "@/lib/timeline/timeline-types";

/** Human-readable readiness label — factual, not evaluative. */
export function timelineReadinessLabel(status: TimelineReadinessStatus): string {
  switch (status) {
    case "planned":
      return "Planned — timeline structure defined, no time-series evidence connected";
    case "partial":
      return "Partial — some indicator coverage mapped, year-level evidence gaps remain";
    case "ready_for_evidence":
      return "Ready for evidence — year slots mapped, awaiting official source connection";
    case "verified":
      return "Verified — time-series evidence connected and validated for all year slots";
  }
}

export function timelineReadinessStatusClass(status: TimelineReadinessStatus): string {
  switch (status) {
    case "verified":
      return "text-cyan-400 bg-cyan-500/10 border-cyan-500/20";
    case "ready_for_evidence":
      return "text-sky-400 bg-sky-500/10 border-sky-500/20";
    case "partial":
      return "text-violet-400 bg-violet-500/10 border-violet-500/20";
    case "planned":
      return "text-zinc-400 bg-zinc-800/50 border-zinc-700/50";
  }
}

export function timelineYearStatusClass(status: TimelineYearStatus): string {
  switch (status) {
    case "verified":
      return "text-cyan-400 bg-cyan-500/10 border-cyan-500/20";
    case "partial":
      return "text-violet-400 bg-violet-500/10 border-violet-500/20";
    case "future":
      return "text-sky-400 bg-sky-500/10 border-sky-500/20";
    case "missing":
      return "text-zinc-400 bg-zinc-800/50 border-zinc-700/50";
  }
}

/**
 * Assess timeline readiness from year-level evidence posture.
 * Never infers historical significance or event completeness.
 */
export function assessTimelineReadiness(input: {
  supportedYears: readonly number[];
  availableEvidenceYears: readonly number[];
  connectedIndicatorCount: number;
  totalIndicatorCount: number;
  connectedSourceCount: number;
  totalSourceCount: number;
}): TimelineReadinessStatus {
  const { supportedYears, availableEvidenceYears } = input;

  if (supportedYears.length === 0) {
    return "planned";
  }

  const allYearsVerified =
    availableEvidenceYears.length === supportedYears.length &&
    availableEvidenceYears.length > 0;

  const allSourcesConnected =
    input.totalSourceCount > 0 &&
    input.connectedSourceCount === input.totalSourceCount;

  if (allYearsVerified && allSourcesConnected) {
    return "verified";
  }

  if (
    input.connectedIndicatorCount > 0 &&
    availableEvidenceYears.length === 0
  ) {
    return "ready_for_evidence";
  }

  if (input.connectedIndicatorCount > 0 || availableEvidenceYears.length > 0) {
    return "partial";
  }

  return "planned";
}

/** Standard limitations for timeline foundation in static export. */
export function buildTimelineStandardLimitations(
  readinessStatus: TimelineReadinessStatus,
): string[] {
  const base = [
    "Timeline displays evidence readiness structure only — not historical events or political interpretation.",
    "No event narratives, political framing, or generated history appear on this timeline.",
    "Year slots are structural placeholders until official time-series evidence connects.",
    "Human review is required before any timeline use in decision support.",
    "Static export — no live time-series ingestion or runtime validation.",
  ];

  switch (readinessStatus) {
    case "planned":
      return [
        ...base,
        "No time-series evidence is connected — all year slots show evidence gaps.",
      ];
    case "partial":
      return [
        ...base,
        "Partial indicator coverage exists but year-level evidence remains incomplete.",
      ];
    case "ready_for_evidence":
      return [
        ...base,
        "Year slots are mapped and awaiting official source time-series publication.",
      ];
    case "verified":
      return [
        ...base,
        "Verified status reflects connected sources — reviewers must confirm year applicability.",
      ];
  }
}

/** Build year entry slots from supported years and available evidence years. */
export function buildTimelineYearEntries(
  supportedYears: readonly number[],
  availableEvidenceYears: readonly number[],
): TimelineYearEntry[] {
  const availableSet = new Set(availableEvidenceYears);
  const referenceYear = supportedYears.length > 0 ? Math.max(...supportedYears) : 2026;

  return supportedYears.map((year) => {
    if (availableSet.has(year)) {
      return {
        year,
        status: "verified" as const,
        label: "Verified evidence slot — time-series connected",
      };
    }

    if (year > referenceYear) {
      return {
        year,
        status: "future" as const,
        label: "Future evidence availability — source not yet connected",
      };
    }

    return {
      year,
      status: "missing" as const,
      label: "Evidence not connected.",
    };
  });
}
