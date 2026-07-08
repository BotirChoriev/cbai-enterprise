import {
  TIMELINE_STAGE_IDS,
  TIMELINE_STAGE_STATUS_LABELS,
  type KnowledgeTimeline,
  type TimelineStageStatus,
} from "@/lib/research/timeline/timeline-types";

export type KnowledgeTimelineValidationIssue = {
  code:
    | "missing_topic_id"
    | "missing_stages"
    | "invalid_stage_count"
    | "missing_required_stage"
    | "invalid_status"
    | "missing_human_review";
  message: string;
  timelineId?: string;
};

export type KnowledgeTimelineValidationReport = {
  valid: boolean;
  issues: KnowledgeTimelineValidationIssue[];
};

const REQUIRED_STAGES = new Set<string>(TIMELINE_STAGE_IDS);

/** Validate a knowledge timeline snapshot. */
export function validateKnowledgeTimeline(
  timeline: KnowledgeTimeline,
): KnowledgeTimelineValidationReport {
  const issues: KnowledgeTimelineValidationIssue[] = [];

  if (!timeline.topicId.trim()) {
    issues.push({
      code: "missing_topic_id",
      message: "Timeline is missing topicId.",
      timelineId: timeline.timelineId,
    });
  }

  if (!(timeline.status in TIMELINE_STAGE_STATUS_LABELS)) {
    issues.push({
      code: "invalid_status",
      message: `Invalid timeline status "${timeline.status}".`,
      timelineId: timeline.timelineId,
    });
  }

  if (timeline.stages.length === 0) {
    issues.push({
      code: "missing_stages",
      message: "Timeline has no stages.",
      timelineId: timeline.timelineId,
    });
  }

  if (timeline.stages.length !== TIMELINE_STAGE_IDS.length) {
    issues.push({
      code: "invalid_stage_count",
      message: `Expected ${TIMELINE_STAGE_IDS.length} stages, got ${timeline.stages.length}.`,
      timelineId: timeline.timelineId,
    });
  }

  for (const stageId of REQUIRED_STAGES) {
    if (!timeline.stages.some((stage) => stage.stageId === stageId)) {
      issues.push({
        code: "missing_required_stage",
        message: `Missing required stage "${stageId}".`,
        timelineId: timeline.timelineId,
      });
    }
  }

  for (const stage of timeline.stages) {
    if (!(stage.status in TIMELINE_STAGE_STATUS_LABELS)) {
      issues.push({
        code: "invalid_status",
        message: `Invalid stage status "${stage.status}" on stage "${stage.stageId}".`,
        timelineId: timeline.timelineId,
      });
    }
  }

  if (!timeline.humanReviewRequired) {
    issues.push({
      code: "missing_human_review",
      message: "Timeline must require human review.",
      timelineId: timeline.timelineId,
    });
  }

  return { valid: issues.length === 0, issues };
}

export function isValidTimelineStageStatus(value: string): value is TimelineStageStatus {
  return value in TIMELINE_STAGE_STATUS_LABELS;
}
