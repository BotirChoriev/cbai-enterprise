import { getIndicatorById } from "@/lib/indicator-framework";
import { findEntityById } from "@/lib/registry";
import { isValidGapIdFormat } from "@/lib/evidence-gap/gap-builder";
import { flattenEvidenceGapSummary } from "@/lib/evidence-gap/gap-summary";
import type {
  EntityEvidenceGapProfile,
  EvidenceGapId,
  EvidenceGapRecord,
  EvidenceGapSummary,
  EvidenceGapValidationIssue,
  EvidenceGapValidationReport,
} from "@/lib/evidence-gap/gap-types";

const PROHIBITED_LANGUAGE_PATTERNS: readonly RegExp[] = [
  /\blikely\b/i,
  /\bprobably\b/i,
  /\bestimated\b/i,
  /\bestimate\b/i,
  /\bgovernment failed\b/i,
  /\bdata hidden\b/i,
  /\bhidden data\b/i,
  /\brecommendation\b/i,
  /\bbest choice\b/i,
  /\binvest here\b/i,
  /\bgovernment should\b/i,
  /\bpredict(?:ion|ed|s)?\b/i,
  /\b\d+\s*%\b/,
];

function pushIssue(
  target: EvidenceGapValidationIssue[],
  issue: EvidenceGapValidationIssue,
): void {
  target.push(issue);
}

function scanProhibitedLanguage(
  text: string,
  gapId: EvidenceGapId | undefined,
  errors: EvidenceGapValidationIssue[],
): void {
  for (const pattern of PROHIBITED_LANGUAGE_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      pushIssue(errors, {
        code: "prohibited_language",
        severity: "error",
        message: `Prohibited gap language detected: "${match[0]}".`,
        gapId,
        reference: match[0],
      });
    }
  }
}

function validateGapRecord(gap: EvidenceGapRecord, errors: EvidenceGapValidationIssue[], warnings: EvidenceGapValidationIssue[]): void {
  if (!isValidGapIdFormat(gap.gapId)) {
    pushIssue(errors, {
      code: "invalid_gap_id",
      severity: "error",
      message: `Gap ID "${gap.gapId}" does not match required format.`,
      gapId: gap.gapId,
    });
  }

  if (gap.humanReviewRequired !== true) {
    pushIssue(errors, {
      code: "human_review_not_required",
      severity: "error",
      message: "humanReviewRequired must always be true.",
      gapId: gap.gapId,
    });
  }

  if (!findEntityById(gap.entityId)) {
    pushIssue(errors, {
      code: "unknown_entity",
      severity: "error",
      message: `Unknown entity "${gap.entityId}" on gap record.`,
      gapId: gap.gapId,
      reference: gap.entityId,
    });
  }

  if (!getIndicatorById(gap.indicatorId)) {
    pushIssue(errors, {
      code: "unknown_indicator",
      severity: "error",
      message: `Unknown indicator "${gap.indicatorId}" on gap record.`,
      gapId: gap.gapId,
      reference: gap.indicatorId,
    });
  }

  const combined = [
    gap.missingReason,
    gap.verificationBlocker,
    gap.nextPossibleStep,
    gap.requiredEvidence,
    gap.requiredMethodology,
  ]
    .filter(Boolean)
    .join(" ");

  scanProhibitedLanguage(combined, gap.gapId, errors);

  if (gap.currentStatus !== "available" && !gap.missingReason) {
    pushIssue(warnings, {
      code: "fabricated_gap",
      severity: "warning",
      message: `Gap "${gap.gapId}" is non-available but has no missing reason.`,
      gapId: gap.gapId,
    });
  }
}

/** Validate entity evidence gap profile. */
export function validateEvidenceGapProfile(
  profile: EntityEvidenceGapProfile,
): EvidenceGapValidationReport {
  const errors: EvidenceGapValidationIssue[] = [];
  const warnings: EvidenceGapValidationIssue[] = [];

  if (profile.humanReviewRequired !== true) {
    pushIssue(errors, {
      code: "human_review_not_required",
      severity: "error",
      message: "Profile must declare humanReviewRequired: true.",
    });
  }

  for (const gap of profile.gaps) {
    validateGapRecord(gap, errors, warnings);
  }

  const counted =
    profile.availableCount +
    profile.plannedCount +
    profile.missingCount +
    profile.blockedCount;

  if (counted !== profile.totalIndicators) {
    pushIssue(warnings, {
      code: "fabricated_gap",
      severity: "warning",
      message: "Gap counts do not match total indicator count.",
    });
  }

  const allIssues = [...errors, ...warnings];

  return {
    valid: errors.length === 0,
    issueCount: allIssues.length,
    errors,
    warnings,
  };
}

/** Validate gap summary for prohibited language. */
export function validateEvidenceGapSummary(summary: EvidenceGapSummary): EvidenceGapValidationReport {
  const errors: EvidenceGapValidationIssue[] = [];
  const warnings: EvidenceGapValidationIssue[] = [];

  scanProhibitedLanguage(flattenEvidenceGapSummary(summary), undefined, errors);

  return {
    valid: errors.length === 0,
    issueCount: errors.length + warnings.length,
    errors,
    warnings,
  };
}

/** Validate and throw if errors exist. */
export function assertEvidenceGapProfileValid(profile: EntityEvidenceGapProfile): void {
  const report = validateEvidenceGapProfile(profile);
  if (!report.valid) {
    const summary = report.errors.map((issue) => issue.message).join("; ");
    throw new Error(`Evidence gap validation failed: ${summary}`);
  }
}
