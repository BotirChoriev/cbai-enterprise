/**
 * CBAI Country Intelligence Timeline Foundation — public API.
 *
 * Evidence readiness structure for future country timelines.
 * No historical events, fake data, predictions, or AI summaries.
 */

export {
  TIMELINE_FOUNDATION_VERSION,
  TIMELINE_FOUNDATION_VERSION_INFO,
  TIMELINE_MIGRATION_MANIFEST,
  TIMELINE_LIFECYCLE_STAGES,
  TIMELINE_REFERENCE_YEAR,
  type TimelineFoundationVersionInfo,
  type TimelineMigrationEntry,
  type TimelineLifecycleStage,
} from "@/lib/timeline/timeline-version";

export {
  TIMELINE_RECORD_VERSION,
  TIMELINE_READINESS_STATUSES,
  TIMELINE_DEFAULT_YEAR_SPAN,
  TIMELINE_EVIDENCE_NOT_CONNECTED_LABEL,
  type TimelineId,
  type TimelineEntityType,
  type TimelineReadinessStatus,
  type TimelineYearStatus,
  type TimelineYearEntry,
  type TimelineOfficialSourceEntry,
  type TimelineIndicatorCoverageEntry,
  type TimelineMethodologyReference,
  type TimelineRecord,
  type TimelineSummarySectionId,
  type TimelineSummarySection,
  type TimelineSummary,
  type TimelineValidationIssueCode,
  type TimelineValidationIssue,
  type TimelineValidationReport,
  type CountryTimelineModel,
} from "@/lib/timeline/timeline-types";

export {
  TIMELINE_ID_PATTERN,
  buildTimelineId,
  isValidTimelineIdFormat,
  buildSupportedYearRange,
  buildCountryTimeline,
  buildCountryTimelineModel,
  assertCountryTimelineEntity,
} from "@/lib/timeline/timeline-builder";

export {
  timelineReadinessLabel,
  timelineReadinessStatusClass,
  timelineYearStatusClass,
  assessTimelineReadiness,
  buildTimelineStandardLimitations,
  buildTimelineYearEntries,
} from "@/lib/timeline/timeline-readiness";

export {
  buildTimelineSummary,
  flattenTimelineSummary,
} from "@/lib/timeline/timeline-summary";

export {
  validateTimelineRecord,
  validateTimelineSummary,
  assertTimelineRecordValid,
} from "@/lib/timeline/timeline-validation";

export {
  getCountryTimeline,
  getCountryTimelineModel,
  getCountryTimelinePackage,
} from "@/lib/timeline/timeline-query";
