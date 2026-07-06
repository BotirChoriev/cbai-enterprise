import { OFFICIAL_EVIDENCE_SOURCES } from "@/lib/evidence-infrastructure/sources/catalog";
import { findConnectorByIdString } from "@/lib/connectors";
import { isValidWatchIdFormat } from "@/lib/evidence-watch/watch-builder";
import { flattenEvidenceWatchSummary } from "@/lib/evidence-watch/watch-summary";
import { EVIDENCE_WATCH_REGISTRY_SNAPSHOT_AT } from "@/lib/evidence-watch/watch-version";
import type {
  EvidenceWatchId,
  EvidenceWatchRecord,
  EvidenceWatchSummary,
  EvidenceWatchValidationIssue,
  EvidenceWatchValidationReport,
} from "@/lib/evidence-watch/watch-types";

const PROHIBITED_LANGUAGE_PATTERNS: readonly RegExp[] = [
  /\bscore\b/i,
  /\brank(?:ing|ed)?\b/i,
  /\brecommendation\b/i,
  /\bpredict(?:ion|ed|s)?\b/i,
  /\bwarning\b/i,
  /\balert\b/i,
  /\bseverity\b/i,
  /\brisk\b/i,
  /\bbetter\b/i,
  /\bworse\b/i,
  /\b\d+\s*%\b/i,
  /\blikely\b/i,
  /\bprobably\b/i,
];

function pushIssue(
  target: EvidenceWatchValidationIssue[],
  issue: EvidenceWatchValidationIssue,
): void {
  target.push(issue);
}

function scanProhibitedLanguage(
  text: string,
  watchId: EvidenceWatchId | undefined,
  errors: EvidenceWatchValidationIssue[],
): void {
  for (const pattern of PROHIBITED_LANGUAGE_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      pushIssue(errors, {
        code: "prohibited_language",
        severity: "error",
        message: `Prohibited evidence watch language: "${match[0]}".`,
        watchId,
        reference: match[0],
      });
    }
  }
}

/** Validate evidence watch record. */
export function validateEvidenceWatchRecord(
  record: EvidenceWatchRecord,
): EvidenceWatchValidationReport {
  const errors: EvidenceWatchValidationIssue[] = [];
  const warnings: EvidenceWatchValidationIssue[] = [];

  if (!isValidWatchIdFormat(record.watchId)) {
    pushIssue(errors, {
      code: "invalid_watch_id",
      severity: "error",
      message: `Watch ID "${record.watchId}" invalid.`,
      watchId: record.watchId,
    });
  }

  if (record.humanReviewRequired !== true) {
    pushIssue(errors, {
      code: "human_review_not_required",
      severity: "error",
      message: "humanReviewRequired must always be true.",
      watchId: record.watchId,
    });
  }

  if (!OFFICIAL_EVIDENCE_SOURCES.some((source) => source.id === record.sourceId)) {
    pushIssue(errors, {
      code: "unknown_source",
      severity: "error",
      message: `Unknown source "${record.sourceId}".`,
      watchId: record.watchId,
      reference: record.sourceId,
    });
  }

  if (record.connectorId && !findConnectorByIdString(record.connectorId)) {
    pushIssue(errors, {
      code: "unknown_connector",
      severity: "error",
      message: `Unknown connector "${record.connectorId}".`,
      watchId: record.watchId,
      reference: record.connectorId,
    });
  }

  if (record.changeTimestamp !== EVIDENCE_WATCH_REGISTRY_SNAPSHOT_AT) {
    pushIssue(errors, {
      code: "fabricated_timestamp",
      severity: "error",
      message: "changeTimestamp must match registry snapshot constant.",
      watchId: record.watchId,
      reference: record.changeTimestamp,
    });
  }

  const text = [
    record.methodologyReference.description,
    ...record.limitations,
  ].join(" ");

  scanProhibitedLanguage(text, record.watchId, errors);

  return {
    valid: errors.length === 0,
    issueCount: errors.length + warnings.length,
    errors,
    warnings,
  };
}

/** Validate evidence watch summary. */
export function validateEvidenceWatchSummary(
  summary: EvidenceWatchSummary,
): EvidenceWatchValidationReport {
  const errors: EvidenceWatchValidationIssue[] = [];
  const warnings: EvidenceWatchValidationIssue[] = [];

  scanProhibitedLanguage(flattenEvidenceWatchSummary(summary), summary.watchId, errors);

  return {
    valid: errors.length === 0,
    issueCount: errors.length + warnings.length,
    errors,
    warnings,
  };
}

/** Validate and throw if errors exist. */
export function assertEvidenceWatchRecordValid(record: EvidenceWatchRecord): void {
  const report = validateEvidenceWatchRecord(record);
  if (!report.valid) {
    const summary = report.errors.map((issue) => issue.message).join("; ");
    throw new Error(`Evidence watch validation failed: ${summary}`);
  }
}
