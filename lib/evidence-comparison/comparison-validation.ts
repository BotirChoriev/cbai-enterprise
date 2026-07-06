import { findEntityById } from "@/lib/registry";
import { isValidComparisonIdFormat } from "@/lib/evidence-comparison/comparison-builder";
import { flattenComparisonSummary } from "@/lib/evidence-comparison/comparison-summary";
import type {
  ComparisonId,
  ComparisonSummary,
  ComparisonValidationIssue,
  ComparisonValidationReport,
  EvidenceComparisonRecord,
} from "@/lib/evidence-comparison/comparison-types";

const PROHIBITED_LANGUAGE_PATTERNS: readonly RegExp[] = [
  /\bwinner\b/i,
  /\bbetter\b/i,
  /\bworse\b/i,
  /\brank(?:ing|ed)?\b/i,
  /\bscore\b/i,
  /\brecommendation\b/i,
  /\binvest here\b/i,
  /\bpolicy advice\b/i,
  /\blikely\b/i,
  /\bprobably\b/i,
  /\bestimated\b/i,
  /\b\d+\s*%\b/i,
];

function pushIssue(
  target: ComparisonValidationIssue[],
  issue: ComparisonValidationIssue,
): void {
  target.push(issue);
}

function scanProhibitedLanguage(
  text: string,
  comparisonId: ComparisonId | undefined,
  errors: ComparisonValidationIssue[],
): void {
  for (const pattern of PROHIBITED_LANGUAGE_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      pushIssue(errors, {
        code: "prohibited_language",
        severity: "error",
        message: `Prohibited comparison language detected: "${match[0]}".`,
        comparisonId,
        reference: match[0],
      });
    }
  }
}

/** Validate evidence comparison record. */
export function validateEvidenceComparison(
  record: EvidenceComparisonRecord,
): ComparisonValidationReport {
  const errors: ComparisonValidationIssue[] = [];
  const warnings: ComparisonValidationIssue[] = [];

  if (!isValidComparisonIdFormat(record.comparisonId)) {
    pushIssue(errors, {
      code: "invalid_comparison_id",
      severity: "error",
      message: `Comparison ID "${record.comparisonId}" does not match required format.`,
      comparisonId: record.comparisonId,
    });
  }

  if (record.humanReviewRequired !== true) {
    pushIssue(errors, {
      code: "human_review_not_required",
      severity: "error",
      message: "humanReviewRequired must always be true.",
      comparisonId: record.comparisonId,
    });
  }

  const leftEntity = findEntityById(record.leftEntityId);
  const rightEntity = findEntityById(record.rightEntityId);

  if (!leftEntity) {
    pushIssue(errors, {
      code: "unknown_entity",
      severity: "error",
      message: `Unknown left entity "${record.leftEntityId}".`,
      comparisonId: record.comparisonId,
      reference: record.leftEntityId,
    });
  }

  if (!rightEntity) {
    pushIssue(errors, {
      code: "unknown_entity",
      severity: "error",
      message: `Unknown right entity "${record.rightEntityId}".`,
      comparisonId: record.comparisonId,
      reference: record.rightEntityId,
    });
  }

  if (leftEntity && rightEntity && leftEntity.entityType !== rightEntity.entityType) {
    pushIssue(errors, {
      code: "unsupported_entity_type_mix",
      severity: "error",
      message: "Entity types must match for comparison.",
      comparisonId: record.comparisonId,
    });
  }

  if (record.leftEntityId === record.rightEntityId) {
    pushIssue(warnings, {
      code: "same_entity_comparison",
      severity: "warning",
      message: "Left and right entities are identical.",
      comparisonId: record.comparisonId,
    });
  }

  for (const row of record.indicatorRows) {
    scanProhibitedLanguage(row.note, record.comparisonId, errors);
  }

  return {
    valid: errors.length === 0,
    issueCount: errors.length + warnings.length,
    errors,
    warnings,
  };
}

/** Validate comparison summary for prohibited language. */
export function validateComparisonSummary(summary: ComparisonSummary): ComparisonValidationReport {
  const errors: ComparisonValidationIssue[] = [];
  const warnings: ComparisonValidationIssue[] = [];

  scanProhibitedLanguage(flattenComparisonSummary(summary), summary.comparisonId ?? undefined, errors);

  return {
    valid: errors.length === 0,
    issueCount: errors.length + warnings.length,
    errors,
    warnings,
  };
}

/** Validate and throw if errors exist. */
export function assertEvidenceComparisonValid(record: EvidenceComparisonRecord): void {
  const report = validateEvidenceComparison(record);
  if (!report.valid) {
    const summary = report.errors.map((issue) => issue.message).join("; ");
    throw new Error(`Evidence comparison validation failed: ${summary}`);
  }
}
