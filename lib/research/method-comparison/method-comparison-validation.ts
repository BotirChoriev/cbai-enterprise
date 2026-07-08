import {
  METHOD_COMPARISON_STATUSES,
  METHOD_COMPARISON_STATUS_LABELS,
  type MethodComparison,
  type MethodComparisonStatus,
} from "@/lib/research/method-comparison/method-comparison-types";
import { getResearchTopicById } from "@/lib/research/research-topics";

export type MethodComparisonValidationIssue = {
  code:
    | "duplicate_comparison_id"
    | "unknown_topic"
    | "invalid_status"
    | "mismatched_comparison_id"
    | "methods_mismatch"
    | "missing_method_row"
    | "missing_limitations"
    | "empty_methods";
  message: string;
  comparisonId?: string;
};

export type MethodComparisonValidationReport = {
  valid: boolean;
  issues: MethodComparisonValidationIssue[];
};

const STATUSES = new Set<string>(METHOD_COMPARISON_STATUSES);

function isValidStatus(value: string): value is MethodComparisonStatus {
  return STATUSES.has(value) || value in METHOD_COMPARISON_STATUS_LABELS;
}

/** Validate a method comparison snapshot. */
export function validateMethodComparison(
  comparison: MethodComparison,
): MethodComparisonValidationReport {
  const issues: MethodComparisonValidationIssue[] = [];
  const expectedId = `method-comparison:${comparison.topicId}`;

  if (comparison.comparisonId !== expectedId) {
    issues.push({
      code: "mismatched_comparison_id",
      message: `Expected comparisonId "${expectedId}" but found "${comparison.comparisonId}".`,
      comparisonId: comparison.comparisonId,
    });
  }

  if (!getResearchTopicById(comparison.topicId)) {
    issues.push({
      code: "unknown_topic",
      message: `Unknown topicId "${comparison.topicId}".`,
      comparisonId: comparison.comparisonId,
    });
  }

  if (!isValidStatus(comparison.status)) {
    issues.push({
      code: "invalid_status",
      message: `Invalid status "${comparison.status}" on "${comparison.comparisonId}".`,
      comparisonId: comparison.comparisonId,
    });
  }

  if (comparison.methods.length === 0) {
    issues.push({
      code: "empty_methods",
      message: `Comparison "${comparison.comparisonId}" has no methods.`,
      comparisonId: comparison.comparisonId,
    });
  }

  if (comparison.limitations.length === 0) {
    issues.push({
      code: "missing_limitations",
      message: `Comparison "${comparison.comparisonId}" has no limitations.`,
      comparisonId: comparison.comparisonId,
    });
  }

  const rowNames = new Set(comparison.methodEvidenceRows.map((row) => row.methodName));
  for (const method of comparison.methods) {
    if (!rowNames.has(method)) {
      issues.push({
        code: "missing_method_row",
        message: `Missing methodEvidenceRow for "${method}".`,
        comparisonId: comparison.comparisonId,
      });
    }
  }

  if (comparison.methodEvidenceRows.length !== comparison.methods.length) {
    issues.push({
      code: "methods_mismatch",
      message: "methodEvidenceRows length does not match methods length.",
      comparisonId: comparison.comparisonId,
    });
  }

  for (const row of comparison.methodEvidenceRows) {
    if (!isValidStatus(row.status)) {
      issues.push({
        code: "invalid_status",
        message: `Invalid row status "${row.status}" for method "${row.methodName}".`,
        comparisonId: comparison.comparisonId,
      });
    }
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}

/** Validate multiple comparison snapshots. */
export function validateMethodComparisons(
  comparisons: readonly MethodComparison[],
): MethodComparisonValidationReport {
  const issues: MethodComparisonValidationIssue[] = [];
  const seenIds = new Set<string>();

  for (const comparison of comparisons) {
    if (seenIds.has(comparison.comparisonId)) {
      issues.push({
        code: "duplicate_comparison_id",
        message: `Duplicate comparisonId "${comparison.comparisonId}".`,
        comparisonId: comparison.comparisonId,
      });
    }
    seenIds.add(comparison.comparisonId);

    const report = validateMethodComparison(comparison);
    issues.push(...report.issues);
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}
