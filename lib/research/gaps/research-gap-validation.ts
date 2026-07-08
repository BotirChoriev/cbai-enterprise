import {
  RESEARCH_GAP_STATUS_LABELS,
  RESEARCH_GAP_TYPES,
  type ResearchGap,
  type ResearchGapStatus,
  type ResearchGapType,
} from "@/lib/research/gaps/research-gap-types";
import { getResearchTopicById } from "@/lib/research/research-topics";

export type ResearchGapValidationIssue = {
  code:
    | "duplicate_gap_id"
    | "unknown_topic"
    | "invalid_gap_type"
    | "invalid_status"
    | "missing_missing_reason"
    | "missing_future_evidence"
    | "missing_workspace_area"
    | "mismatched_gap_id";
  message: string;
  gapId?: string;
};

export type ResearchGapValidationReport = {
  valid: boolean;
  issues: ResearchGapValidationIssue[];
};

const GAP_TYPES = new Set<string>(RESEARCH_GAP_TYPES);

function isValidGapType(value: string): value is ResearchGapType {
  return GAP_TYPES.has(value);
}

function isValidGapStatus(value: string): value is ResearchGapStatus {
  return value in RESEARCH_GAP_STATUS_LABELS;
}

/** Validate a batch of research gap records. */
export function validateResearchGaps(gaps: readonly ResearchGap[]): ResearchGapValidationReport {
  const issues: ResearchGapValidationIssue[] = [];
  const seenIds = new Set<string>();

  for (const gap of gaps) {
    const expectedId = `gap:${gap.topicId}:${gap.gapType}`;

    if (seenIds.has(gap.gapId)) {
      issues.push({
        code: "duplicate_gap_id",
        message: `Duplicate gapId "${gap.gapId}".`,
        gapId: gap.gapId,
      });
    }
    seenIds.add(gap.gapId);

    if (gap.gapId !== expectedId) {
      issues.push({
        code: "mismatched_gap_id",
        message: `Expected gapId "${expectedId}" but found "${gap.gapId}".`,
        gapId: gap.gapId,
      });
    }

    if (!getResearchTopicById(gap.topicId)) {
      issues.push({
        code: "unknown_topic",
        message: `Unknown topicId "${gap.topicId}".`,
        gapId: gap.gapId,
      });
    }

    if (!isValidGapType(gap.gapType)) {
      issues.push({
        code: "invalid_gap_type",
        message: `Invalid gapType "${gap.gapType}" on "${gap.gapId}".`,
        gapId: gap.gapId,
      });
    }

    if (!isValidGapStatus(gap.currentStatus)) {
      issues.push({
        code: "invalid_status",
        message: `Invalid currentStatus "${gap.currentStatus}" on "${gap.gapId}".`,
        gapId: gap.gapId,
      });
    }

    if (!gap.missingReason.trim()) {
      issues.push({
        code: "missing_missing_reason",
        message: `Gap "${gap.gapId}" is missing a missingReason.`,
        gapId: gap.gapId,
      });
    }

    if (gap.futureEvidenceNeeded.length === 0) {
      issues.push({
        code: "missing_future_evidence",
        message: `Gap "${gap.gapId}" has no futureEvidenceNeeded entries.`,
        gapId: gap.gapId,
      });
    }

    if (!gap.relatedWorkspaceArea.trim()) {
      issues.push({
        code: "missing_workspace_area",
        message: `Gap "${gap.gapId}" is missing relatedWorkspaceArea.`,
        gapId: gap.gapId,
      });
    }
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}
