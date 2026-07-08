import {
  LANDSCAPE_OBJECT_STATUSES,
  LANDSCAPE_STATUS_LABELS,
  type LandscapeObject,
  type LandscapeObjectStatus,
  type ResearchLandscape,
} from "@/lib/research/landscape/landscape-types";
import { getResearchTopicById } from "@/lib/research/research-topics";

export type LandscapeValidationIssue = {
  code:
    | "duplicate_landscape_id"
    | "unknown_topic"
    | "invalid_status"
    | "mismatched_landscape_id"
    | "center_topic_mismatch"
    | "invalid_object_status"
    | "missing_center_topic";
  message: string;
  landscapeId?: string;
};

export type LandscapeValidationReport = {
  valid: boolean;
  issues: LandscapeValidationIssue[];
};

const STATUSES = new Set<string>(LANDSCAPE_OBJECT_STATUSES);

function isValidStatus(value: string): value is LandscapeObjectStatus {
  return STATUSES.has(value) || value in LANDSCAPE_STATUS_LABELS;
}

function validateObjects(
  objects: readonly LandscapeObject[],
  landscapeId: string,
  issues: LandscapeValidationIssue[],
): void {
  for (const object of objects) {
    if (!isValidStatus(object.status)) {
      issues.push({
        code: "invalid_object_status",
        message: `Invalid status "${object.status}" on object "${object.objectId}".`,
        landscapeId,
      });
    }
  }
}

/** Validate a research landscape snapshot. */
export function validateResearchLandscape(landscape: ResearchLandscape): LandscapeValidationReport {
  const issues: LandscapeValidationIssue[] = [];
  const expectedId = `landscape:${landscape.topicId}`;

  if (landscape.landscapeId !== expectedId) {
    issues.push({
      code: "mismatched_landscape_id",
      message: `Expected landscapeId "${expectedId}" but found "${landscape.landscapeId}".`,
      landscapeId: landscape.landscapeId,
    });
  }

  if (!getResearchTopicById(landscape.topicId)) {
    issues.push({
      code: "unknown_topic",
      message: `Unknown topicId "${landscape.topicId}".`,
      landscapeId: landscape.landscapeId,
    });
  }

  if (!isValidStatus(landscape.status)) {
    issues.push({
      code: "invalid_status",
      message: `Invalid landscape status "${landscape.status}".`,
      landscapeId: landscape.landscapeId,
    });
  }

  if (!landscape.centerTopic.topicName.trim()) {
    issues.push({
      code: "missing_center_topic",
      message: "Landscape is missing center topic name.",
      landscapeId: landscape.landscapeId,
    });
  }

  if (landscape.centerTopic.topicId !== landscape.topicId) {
    issues.push({
      code: "center_topic_mismatch",
      message: "centerTopic.topicId does not match landscape topicId.",
      landscapeId: landscape.landscapeId,
    });
  }

  validateObjects(landscape.domains, landscape.landscapeId, issues);
  validateObjects(landscape.methods, landscape.landscapeId, issues);
  validateObjects(landscape.evidenceTypes, landscape.landscapeId, issues);
  validateObjects(landscape.futureObjects, landscape.landscapeId, issues);
  validateObjects(landscape.relatedTopics, landscape.landscapeId, issues);
  validateObjects(landscape.knowledgeGaps, landscape.landscapeId, issues);
  validateObjects(landscape.modules, landscape.landscapeId, issues);

  return {
    valid: issues.length === 0,
    issues,
  };
}

/** Validate multiple landscape snapshots. */
export function validateResearchLandscapes(
  landscapes: readonly ResearchLandscape[],
): LandscapeValidationReport {
  const issues: LandscapeValidationIssue[] = [];
  const seenIds = new Set<string>();

  for (const landscape of landscapes) {
    if (seenIds.has(landscape.landscapeId)) {
      issues.push({
        code: "duplicate_landscape_id",
        message: `Duplicate landscapeId "${landscape.landscapeId}".`,
        landscapeId: landscape.landscapeId,
      });
    }
    seenIds.add(landscape.landscapeId);

    const report = validateResearchLandscape(landscape);
    issues.push(...report.issues);
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}
