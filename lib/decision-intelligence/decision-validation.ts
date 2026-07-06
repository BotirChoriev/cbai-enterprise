import { getIndicatorById } from "@/lib/indicator-framework";
import { OFFICIAL_EVIDENCE_SOURCES } from "@/lib/evidence-infrastructure/sources/catalog";
import { findEntityById, type EntityId } from "@/lib/registry";
import { findMissionByIdString } from "@/lib/missions";
import { flattenDecisionSummary } from "@/lib/decision-intelligence/decision-summary";
import { isValidDecisionContextIdFormat } from "@/lib/decision-intelligence/decision-context";
import type {
  DecisionContextId,
  DecisionContextRecord,
  DecisionSummary,
  DecisionValidationIssue,
  DecisionValidationReport,
} from "@/lib/decision-intelligence/decision-types";

const KNOWN_SOURCE_IDS = new Set(
  OFFICIAL_EVIDENCE_SOURCES.map((source) => source.id),
);

/** Prohibited language patterns — constitutional decision intelligence constraints. */
const PROHIBITED_LANGUAGE_PATTERNS: readonly RegExp[] = [
  /\brecommendation\b/i,
  /\bbest choice\b/i,
  /\binvest here\b/i,
  /\bsupport this policy\b/i,
  /\breject this policy\b/i,
  /\bgovernment should\b/i,
  /\binvestor should\b/i,
  /\bcitizen should\b/i,
  /\bwe recommend\b/i,
  /\byou should\b/i,
  /\bstrong buy\b/i,
  /\bstrong sell\b/i,
  /\bpolicy advice\b/i,
  /\bpredict(?:ion|ed|s)?\b/i,
];

function pushIssue(
  target: DecisionValidationIssue[],
  issue: DecisionValidationIssue,
): void {
  target.push(issue);
}

function scanProhibitedLanguage(
  text: string,
  decisionContextId: DecisionContextId,
  errors: DecisionValidationIssue[],
): void {
  for (const pattern of PROHIBITED_LANGUAGE_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      pushIssue(errors, {
        code: "prohibited_language",
        severity: "error",
        message: `Prohibited language detected: "${match[0]}". Decision Intelligence must not output recommendations or directives.`,
        decisionContextId,
        reference: match[0],
      });
    }
  }
}

/** Validate a built decision context against registry and constitutional rules. */
export function validateDecisionContext(
  context: DecisionContextRecord,
): DecisionValidationReport {
  const errors: DecisionValidationIssue[] = [];
  const warnings: DecisionValidationIssue[] = [];

  if (!isValidDecisionContextIdFormat(context.decisionContextId)) {
    pushIssue(errors, {
      code: "invalid_decision_context_id",
      severity: "error",
      message: `Decision context ID "${context.decisionContextId}" does not match required format.`,
      decisionContextId: context.decisionContextId,
    });
  }

  if (context.humanReviewRequired !== true) {
    pushIssue(errors, {
      code: "human_review_not_required",
      severity: "error",
      message: "humanReviewRequired must always be true per CBAI Constitution.",
      decisionContextId: context.decisionContextId,
    });
  }

  for (const entityId of context.entityIds) {
    const entity = findEntityById(entityId);
    if (!entity) {
      pushIssue(errors, {
        code: "unknown_entity",
        severity: "error",
        message: `Unknown entity "${entityId}" in decision context.`,
        decisionContextId: context.decisionContextId,
        reference: entityId,
      });
      continue;
    }

    for (const relatedId of entity.relatedEntityIds) {
      if (!findEntityById(relatedId)) {
        pushIssue(errors, {
          code: "broken_registry_link",
          severity: "error",
          message: `Entity "${entityId}" references missing related entity "${relatedId}".`,
          decisionContextId: context.decisionContextId,
          reference: relatedId,
        });
      }
    }
  }

  for (const indicatorId of context.indicatorIds) {
    const indicator = getIndicatorById(indicatorId);
    if (!indicator) {
      pushIssue(errors, {
        code: "unknown_indicator",
        severity: "error",
        message: `Unknown indicator "${indicatorId}" in decision context.`,
        decisionContextId: context.decisionContextId,
        reference: indicatorId,
      });
    }
  }

  for (const sourceId of context.sourceIds) {
    if (!KNOWN_SOURCE_IDS.has(sourceId)) {
      pushIssue(errors, {
        code: "unknown_source",
        severity: "error",
        message: `Unknown source "${sourceId}" in decision context.`,
        decisionContextId: context.decisionContextId,
        reference: sourceId,
      });
    }
  }

  for (const missionId of context.missionIds) {
    if (!findMissionByIdString(missionId)) {
      pushIssue(errors, {
        code: "unknown_mission",
        severity: "error",
        message: `Unknown mission "${missionId}" in decision context.`,
        decisionContextId: context.decisionContextId,
        reference: missionId,
      });
    }
  }

  if (context.methodologyReferences.length === 0 && context.indicatorIds.length > 0) {
    pushIssue(warnings, {
      code: "missing_methodology",
      severity: "warning",
      message: "Decision context has indicators but no resolved methodology references.",
      decisionContextId: context.decisionContextId,
    });
  }

  for (const indicatorId of context.indicatorIds) {
    const indicator = getIndicatorById(indicatorId);
    if (!indicator) continue;

    const evidenceId = `evidence-${indicator.slug}`;
    if (!context.evidenceIds.includes(evidenceId)) {
      pushIssue(warnings, {
        code: "missing_evidence",
        severity: "warning",
        message: `Evidence anchor "${evidenceId}" not listed for indicator "${indicatorId}".`,
        decisionContextId: context.decisionContextId,
        reference: evidenceId,
      });
    }
  }

  if (context.evidenceCoverage.missingCount > 0) {
    pushIssue(warnings, {
      code: "missing_evidence",
      severity: "warning",
      message: `${context.evidenceCoverage.missingCount} required evidence slot(s) are missing.`,
      decisionContextId: context.decisionContextId,
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

/** Validate decision summary for prohibited language and constitutional compliance. */
export function validateDecisionSummary(
  summary: DecisionSummary,
): DecisionValidationReport {
  const errors: DecisionValidationIssue[] = [];
  const warnings: DecisionValidationIssue[] = [];

  if (summary.humanReviewRequired !== true) {
    pushIssue(errors, {
      code: "human_review_not_required",
      severity: "error",
      message: "Decision summary must declare humanReviewRequired: true.",
      decisionContextId: summary.decisionContextId,
    });
  }

  const text = flattenDecisionSummary(summary);
  scanProhibitedLanguage(text, summary.decisionContextId, errors);

  return {
    valid: errors.length === 0,
    issueCount: errors.length + warnings.length,
    errors,
    warnings,
  };
}

/** Validate context and throw if errors exist — for CI hooks. */
export function assertDecisionContextValid(context: DecisionContextRecord): void {
  const report = validateDecisionContext(context);
  if (!report.valid) {
    const summary = report.errors.map((issue) => issue.message).join("; ");
    throw new Error(`Decision context validation failed: ${summary}`);
  }
}

/** Validate multiple contexts and detect duplicate IDs. */
export function validateDecisionContextBatch(
  contexts: readonly DecisionContextRecord[],
): DecisionValidationReport {
  const errors: DecisionValidationIssue[] = [];
  const warnings: DecisionValidationIssue[] = [];
  const seenIds = new Set<string>();

  for (const context of contexts) {
    const report = validateDecisionContext(context);
    errors.push(...report.errors);
    warnings.push(...report.warnings);

    if (seenIds.has(context.decisionContextId)) {
      pushIssue(errors, {
        code: "duplicate_decision_context_id",
        severity: "error",
        message: `Duplicate decision context ID "${context.decisionContextId}".`,
        decisionContextId: context.decisionContextId,
      });
    }
    seenIds.add(context.decisionContextId);
  }

  const allIssues = [...errors, ...warnings];

  return {
    valid: errors.length === 0,
    issueCount: allIssues.length,
    errors,
    warnings,
  };
}

export type { EntityId };
