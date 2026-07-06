import { flattenSearchIntelligenceSummary } from "@/lib/search-intelligence/search-intelligence.summary";
import { isValidSearchIntelligenceIdFormat } from "@/lib/search-intelligence/search-intelligence.builder";
import { findEntityById, type EntityId } from "@/lib/registry";
import type {
  SearchIntelligenceId,
  SearchIntelligenceRecord,
  SearchIntelligenceSummary,
  SearchIntelligenceValidationIssue,
  SearchIntelligenceValidationReport,
} from "@/lib/search-intelligence/search-intelligence.types";

const PROHIBITED_LANGUAGE_PATTERNS: readonly RegExp[] = [
  /\brank(?:ing|ed)?\b/i,
  /\brecommendation\b/i,
  /\bpredict(?:ion|ed|s)?\b/i,
  /\bconfidence\b/i,
  /\binvest here\b/i,
  /\bbetter\b/i,
  /\bworse\b/i,
  /\bwinner\b/i,
  /\b\d+\s*%\b/i,
  /\blikely\b/i,
  /\bprobably\b/i,
];

function pushIssue(
  target: SearchIntelligenceValidationIssue[],
  issue: SearchIntelligenceValidationIssue,
): void {
  target.push(issue);
}

function scanProhibitedLanguage(
  text: string,
  searchIntelligenceId: SearchIntelligenceId | undefined,
  errors: SearchIntelligenceValidationIssue[],
): void {
  for (const pattern of PROHIBITED_LANGUAGE_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      pushIssue(errors, {
        code: "prohibited_language",
        severity: "error",
        message: `Prohibited search intelligence language: "${match[0]}".`,
        searchIntelligenceId,
        reference: match[0],
      });
    }
  }
}

/** Validate search intelligence record. */
export function validateSearchIntelligenceRecord(
  record: SearchIntelligenceRecord,
): SearchIntelligenceValidationReport {
  const errors: SearchIntelligenceValidationIssue[] = [];
  const warnings: SearchIntelligenceValidationIssue[] = [];

  if (!isValidSearchIntelligenceIdFormat(record.searchIntelligenceId)) {
    pushIssue(errors, {
      code: "invalid_search_id",
      severity: "error",
      message: `Search intelligence ID "${record.searchIntelligenceId}" invalid.`,
      searchIntelligenceId: record.searchIntelligenceId,
    });
  }

  if (record.humanReviewRequired !== true) {
    pushIssue(errors, {
      code: "human_review_not_required",
      severity: "error",
      message: "humanReviewRequired must always be true.",
      searchIntelligenceId: record.searchIntelligenceId,
    });
  }

  if (!findEntityById(record.entityId as EntityId)) {
    pushIssue(errors, {
      code: "unknown_entity",
      severity: "error",
      message: `Unknown entity "${record.entityId}".`,
      searchIntelligenceId: record.searchIntelligenceId,
      reference: record.entityId,
    });
  }

  for (const navModule of record.availableModules) {
    if (!navModule.href.startsWith("/")) {
      pushIssue(errors, {
        code: "fabricated_navigation",
        severity: "error",
        message: `Navigation href must be internal path: "${navModule.href}".`,
        searchIntelligenceId: record.searchIntelligenceId,
        reference: navModule.moduleId,
      });
    }
  }

  const text = [
    ...record.limitations,
    ...record.availableModules.map((navModule) => navModule.description),
  ].join(" ");

  scanProhibitedLanguage(text, record.searchIntelligenceId, errors);

  return {
    valid: errors.length === 0,
    issueCount: errors.length + warnings.length,
    errors,
    warnings,
  };
}

/** Validate search intelligence summary. */
export function validateSearchIntelligenceSummary(
  summary: SearchIntelligenceSummary,
): SearchIntelligenceValidationReport {
  const errors: SearchIntelligenceValidationIssue[] = [];
  const warnings: SearchIntelligenceValidationIssue[] = [];

  scanProhibitedLanguage(
    flattenSearchIntelligenceSummary(summary),
    summary.searchIntelligenceId,
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
export function assertSearchIntelligenceRecordValid(
  record: SearchIntelligenceRecord,
): void {
  const report = validateSearchIntelligenceRecord(record);
  if (!report.valid) {
    const summary = report.errors.map((issue) => issue.message).join("; ");
    throw new Error(`Search intelligence validation failed: ${summary}`);
  }
}
