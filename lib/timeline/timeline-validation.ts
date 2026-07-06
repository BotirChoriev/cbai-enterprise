import { findEntityById } from "@/lib/registry";
import { isValidTimelineIdFormat } from "@/lib/timeline/timeline-builder";
import { flattenTimelineSummary } from "@/lib/timeline/timeline-summary";
import type {
  TimelineId,
  TimelineRecord,
  TimelineSummary,
  TimelineValidationIssue,
  TimelineValidationReport,
  TimelineYearEntry,
} from "@/lib/timeline/timeline-types";

/** Prohibited language — historical events, political interpretation, fake history. */
const PROHIBITED_EVENT_PATTERNS: readonly RegExp[] = [
  /\belection\b/i,
  /\bwar\b/i,
  /\bcrisis\b/i,
  /\bcoup\b/i,
  /\brevolution\b/i,
  /\bprotest\b/i,
  /\bscandal\b/i,
  /\bassassination\b/i,
  /\binvasion\b/i,
  /\bsanction\b/i,
  /\brecession\b/i,
  /\binaugurated\b/i,
  /\bgovernment action\b/i,
  /\bpolitical event\b/i,
  /\bhistorical event\b/i,
  /\bnews\b/i,
  /\beconomic event\b/i,
  /\brecommendation\b/i,
  /\bbest choice\b/i,
  /\binvest here\b/i,
  /\bgovernment should\b/i,
];

/** Patterns that suggest fabricated timeline entries (event-style descriptions). */
const FAKE_TIMELINE_ENTRY_PATTERNS: readonly RegExp[] = [
  /\b(?:founded|established|declared|signed|announced|passed|elected|appointed)\b/i,
  /\btreaty of\b/i,
  /\bindependence\b/i,
  /\bcivil war\b/i,
];

function pushIssue(
  target: TimelineValidationIssue[],
  issue: TimelineValidationIssue,
): void {
  target.push(issue);
}

function scanProhibitedLanguage(
  text: string,
  timelineId: TimelineId,
  errors: TimelineValidationIssue[],
): void {
  for (const pattern of PROHIBITED_EVENT_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      pushIssue(errors, {
        code: "prohibited_event_language",
        severity: "error",
        message: `Prohibited timeline language detected: "${match[0]}". Timelines must represent evidence readiness only.`,
        timelineId,
        reference: match[0],
      });
    }
  }
}

function validateYearEntry(
  entry: TimelineYearEntry,
  timelineId: TimelineId,
  errors: TimelineValidationIssue[],
): void {
  const combined = `${entry.year} ${entry.label}`;

  for (const pattern of FAKE_TIMELINE_ENTRY_PATTERNS) {
    const match = combined.match(pattern);
    if (match) {
      pushIssue(errors, {
        code: "fake_timeline_entry",
        severity: "error",
        message: `Year entry ${entry.year} contains event-style language: "${match[0]}".`,
        timelineId,
        reference: match[0],
      });
    }
  }

  for (const pattern of PROHIBITED_EVENT_PATTERNS) {
    const match = entry.label.match(pattern);
    if (match) {
      pushIssue(errors, {
        code: "prohibited_historical_claim",
        severity: "error",
        message: `Year ${entry.year} label contains prohibited content: "${match[0]}".`,
        timelineId,
        reference: match[0],
      });
    }
  }
}

/** Validate timeline record against constitutional rules. */
export function validateTimelineRecord(record: TimelineRecord): TimelineValidationReport {
  const errors: TimelineValidationIssue[] = [];
  const warnings: TimelineValidationIssue[] = [];

  if (!isValidTimelineIdFormat(record.timelineId)) {
    pushIssue(errors, {
      code: "invalid_timeline_id",
      severity: "error",
      message: `Timeline ID "${record.timelineId}" does not match required format.`,
      timelineId: record.timelineId,
    });
  }

  if (record.humanReviewRequired !== true) {
    pushIssue(errors, {
      code: "human_review_not_required",
      severity: "error",
      message: "humanReviewRequired must always be true per CBAI Constitution.",
      timelineId: record.timelineId,
    });
  }

  const entity = findEntityById(record.entityId);
  if (!entity) {
    pushIssue(errors, {
      code: "unknown_entity",
      severity: "error",
      message: `Unknown entity "${record.entityId}" in timeline record.`,
      timelineId: record.timelineId,
      reference: record.entityId,
    });
  } else {
    for (const relatedId of entity.relatedEntityIds) {
      if (!findEntityById(relatedId)) {
        pushIssue(errors, {
          code: "broken_registry_link",
          severity: "error",
          message: `Entity "${record.entityId}" references missing related entity "${relatedId}".`,
          timelineId: record.timelineId,
          reference: relatedId,
        });
      }
    }
  }

  if (record.methodologyReferences.length === 0 && record.indicatorCoverage.length > 0) {
    pushIssue(warnings, {
      code: "missing_methodology",
      severity: "warning",
      message: "Timeline has indicator coverage but no resolved methodology references.",
      timelineId: record.timelineId,
    });
  }

  for (const entry of record.yearEntries) {
    validateYearEntry(entry, record.timelineId, errors);
  }

  const allIssues = [...errors, ...warnings];

  return {
    valid: errors.length === 0,
    issueCount: allIssues.length,
    errors,
    warnings,
  };
}

/** Validate timeline summary for prohibited language. */
export function validateTimelineSummary(summary: TimelineSummary): TimelineValidationReport {
  const errors: TimelineValidationIssue[] = [];
  const warnings: TimelineValidationIssue[] = [];

  if (summary.humanReviewRequired !== true) {
    pushIssue(errors, {
      code: "human_review_not_required",
      severity: "error",
      message: "Timeline summary must declare humanReviewRequired: true.",
      timelineId: summary.timelineId,
    });
  }

  const text = flattenTimelineSummary(summary);
  scanProhibitedLanguage(text, summary.timelineId, errors);

  return {
    valid: errors.length === 0,
    issueCount: errors.length + warnings.length,
    errors,
    warnings,
  };
}

/** Validate and throw if errors exist — for CI hooks. */
export function assertTimelineRecordValid(record: TimelineRecord): void {
  const report = validateTimelineRecord(record);
  if (!report.valid) {
    const summary = report.errors.map((issue) => issue.message).join("; ");
    throw new Error(`Timeline validation failed: ${summary}`);
  }
}
