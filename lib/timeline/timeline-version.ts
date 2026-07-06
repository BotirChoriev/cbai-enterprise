export const TIMELINE_FOUNDATION_VERSION = "1.0.0" as const;

export type TimelineFoundationVersionInfo = {
  foundationVersion: typeof TIMELINE_FOUNDATION_VERSION;
  timelineRecordVersion: "1.0.0";
  schema: "cbai-timeline-foundation-v1";
  historicalEventSupport: "none";
  timeSeriesEvidenceSupport: "planned";
  humanReviewRequired: true;
};

export const TIMELINE_FOUNDATION_VERSION_INFO: TimelineFoundationVersionInfo = {
  foundationVersion: TIMELINE_FOUNDATION_VERSION,
  timelineRecordVersion: "1.0.0",
  schema: "cbai-timeline-foundation-v1",
  historicalEventSupport: "none",
  timeSeriesEvidenceSupport: "planned",
  humanReviewRequired: true,
};

export type TimelineMigrationEntry = {
  fromVersion: string;
  toVersion: string;
  description: string;
  breaking: boolean;
};

/** Future migration manifest — no migrations executed in v1. */
export const TIMELINE_MIGRATION_MANIFEST: readonly TimelineMigrationEntry[] = [
  {
    fromVersion: "1.0.0",
    toVersion: "1.1.0",
    description: "Reserved — official time-series evidence binding from connected sources.",
    breaking: false,
  },
];

/** Declarative timeline lifecycle stages — foundation only in v1. */
export const TIMELINE_LIFECYCLE_STAGES = [
  "structure-defined",
  "year-slots-mapped",
  "readiness-assessed",
  "human-review-pending",
  "evidence-bound",
  "archived",
] as const;

export type TimelineLifecycleStage = (typeof TIMELINE_LIFECYCLE_STAGES)[number];

/** Reference anchor year for structural slot generation — updated at build time. */
export const TIMELINE_REFERENCE_YEAR = 2026 as const;
