import { getIndicatorById } from "@/lib/indicator-framework";
import { isValidIndicatorExplorerIdFormat } from "@/lib/indicator-explorer/indicator-explorer.builder";
import { flattenIndicatorExplorerSummary } from "@/lib/indicator-explorer/indicator-explorer.summary";
import type {
  IndicatorExplorerId,
  IndicatorExplorerRecord,
  IndicatorExplorerSummary,
  IndicatorExplorerValidationIssue,
  IndicatorExplorerValidationReport,
} from "@/lib/indicator-explorer/indicator-explorer.types";

const PROHIBITED_LANGUAGE_PATTERNS: readonly RegExp[] = [
  /\bscore\b/i,
  /\brank(?:ing|ed)?\b/i,
  /\brecommendation\b/i,
  /\bpredict(?:ion|ed|s)?\b/i,
  /\binvest here\b/i,
  /\bbetter\b/i,
  /\bworse\b/i,
  /\bwinner\b/i,
  /\b\d+\s*%\b/i,
  /\blikely\b/i,
  /\bprobably\b/i,
];

function pushIssue(
  target: IndicatorExplorerValidationIssue[],
  issue: IndicatorExplorerValidationIssue,
): void {
  target.push(issue);
}

function scanProhibitedLanguage(
  text: string,
  explorerId: IndicatorExplorerId | undefined,
  errors: IndicatorExplorerValidationIssue[],
): void {
  for (const pattern of PROHIBITED_LANGUAGE_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      pushIssue(errors, {
        code: "prohibited_language",
        severity: "error",
        message: `Prohibited indicator explorer language: "${match[0]}".`,
        indicatorExplorerId: explorerId,
        reference: match[0],
      });
    }
  }
}

/** Validate indicator explorer record. */
export function validateIndicatorExplorerRecord(
  record: IndicatorExplorerRecord,
): IndicatorExplorerValidationReport {
  const errors: IndicatorExplorerValidationIssue[] = [];
  const warnings: IndicatorExplorerValidationIssue[] = [];

  if (!isValidIndicatorExplorerIdFormat(record.indicatorExplorerId)) {
    pushIssue(errors, {
      code: "invalid_explorer_id",
      severity: "error",
      message: `Explorer ID "${record.indicatorExplorerId}" invalid.`,
      indicatorExplorerId: record.indicatorExplorerId,
    });
  }

  if (record.humanReviewRequired !== true) {
    pushIssue(errors, {
      code: "human_review_not_required",
      severity: "error",
      message: "humanReviewRequired must always be true.",
      indicatorExplorerId: record.indicatorExplorerId,
    });
  }

  if (!getIndicatorById(record.indicatorId)) {
    pushIssue(errors, {
      code: "unknown_indicator",
      severity: "error",
      message: `Unknown indicator "${record.indicatorId}".`,
      indicatorExplorerId: record.indicatorExplorerId,
      reference: record.indicatorId,
    });
  }

  const text = [
    record.description,
    record.methodologyReferences.whyItExists,
    record.methodologyReferences.futureScoringDerivation,
  ].join(" ");

  scanProhibitedLanguage(text, record.indicatorExplorerId, errors);

  return {
    valid: errors.length === 0,
    issueCount: errors.length + warnings.length,
    errors,
    warnings,
  };
}

/** Validate indicator explorer summary. */
export function validateIndicatorExplorerSummary(
  summary: IndicatorExplorerSummary,
): IndicatorExplorerValidationReport {
  const errors: IndicatorExplorerValidationIssue[] = [];
  const warnings: IndicatorExplorerValidationIssue[] = [];

  scanProhibitedLanguage(
    flattenIndicatorExplorerSummary(summary),
    summary.indicatorExplorerId,
    errors,
  );

  return {
    valid: errors.length === 0,
    issueCount: errors.length + warnings.length,
    errors,
    warnings,
  };
}

/** Validate and throw if errors exist. */
export function assertIndicatorExplorerRecordValid(record: IndicatorExplorerRecord): void {
  const report = validateIndicatorExplorerRecord(record);
  if (!report.valid) {
    const summary = report.errors.map((issue) => issue.message).join("; ");
    throw new Error(`Indicator explorer validation failed: ${summary}`);
  }
}
