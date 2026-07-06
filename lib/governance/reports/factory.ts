import type {
  ComplianceReport,
  ComplianceReportSummary,
  ComplianceReportTemplateInput,
  RuleCheckResult,
} from "@/lib/governance/reports/types";
import { GOVERNANCE_VERSION } from "@/lib/governance/types";

function generateReportId(moduleId: string): string {
  return `report-${moduleId}-${Date.now()}`;
}

/**
 * Creates an empty compliance report template.
 * Does not execute validation — for manual audits and future CI output scaffolding.
 */
export function createComplianceReportTemplate(
  input: ComplianceReportTemplateInput,
): ComplianceReport {
  return {
    id: generateReportId(input.moduleId),
    version: GOVERNANCE_VERSION,
    moduleId: input.moduleId,
    moduleName: input.moduleName,
    targetRoute: input.targetRoute,
    evaluatedAt: new Date().toISOString(),
    evaluatedBy: input.evaluatedBy ?? "not-evaluated",
    overallStatus: "not_evaluated",
    passedRules: [],
    failedRules: [],
    warnings: [],
    recommendations: [],
    notes:
      "Template only — populate via manual audit or future CI validator. This framework does not execute checks.",
  };
}

/** Derives summary counts from a populated report — pure aggregation, no validation. */
export function summarizeComplianceReport(
  report: ComplianceReport,
): ComplianceReportSummary {
  const all: RuleCheckResult[] = [
    ...report.passedRules,
    ...report.failedRules,
    ...report.warnings,
  ];
  const skippedCount = all.filter((r) => r.status === "skipped").length;

  return {
    totalChecks: all.length,
    passedCount: report.passedRules.length,
    failedCount: report.failedRules.length,
    warningCount: report.warnings.length,
    skippedCount,
    criticalFailures: report.failedRules.length,
  };
}

/** Merges rule results into a report — structural helper for future validators. */
export function mergeRuleResultsIntoReport(
  report: ComplianceReport,
  results: readonly RuleCheckResult[],
): ComplianceReport {
  const passedRules: RuleCheckResult[] = [...report.passedRules];
  const failedRules: RuleCheckResult[] = [...report.failedRules];
  const warnings: RuleCheckResult[] = [...report.warnings];

  for (const result of results) {
    switch (result.status) {
      case "passed":
        passedRules.push(result);
        break;
      case "failed":
        failedRules.push(result);
        break;
      case "warning":
      case "skipped":
        warnings.push(result);
        break;
    }
  }

  const overallStatus = deriveOverallStatus(passedRules, failedRules, warnings);

  return {
    ...report,
    passedRules,
    failedRules,
    warnings,
    overallStatus,
  };
}

function deriveOverallStatus(
  passed: readonly RuleCheckResult[],
  failed: readonly RuleCheckResult[],
  warnings: readonly RuleCheckResult[],
): ComplianceReport["overallStatus"] {
  if (passed.length === 0 && failed.length === 0 && warnings.length === 0) {
    return "not_evaluated";
  }
  if (failed.length > 0) {
    return passed.length > 0 ? "partial" : "non_compliant";
  }
  if (warnings.length > 0 && passed.length > 0) {
    return "partial";
  }
  if (passed.length > 0 && failed.length === 0) {
    return "compliant";
  }
  return "not_evaluated";
}

/** Standard recommendation templates for common failure patterns. */
export const STANDARD_RECOMMENDATIONS = {
  removeFakeScores:
    "Remove fabricated scores and replace with not-connected labels referencing required indicators.",
  addPersonaBlocks:
    "Add all six persona sections with honest capability scoping per docs/standards/07-persona-standard.md.",
  registerIndicators:
    "Map evaluation dimensions to lib/indicator-framework registry IDs — do not invent ad hoc indicators.",
  addEvidenceStatus:
    "Add evidence status badges to all intelligence blocks per docs/standards/02-evidence-standard.md.",
  goldenRuleAlignment:
    "Align module with /countries Golden Rule reference pattern per docs/standards/04-entity-standard.md.",
  removeAiWording:
    "Remove misleading AI marketing copy; use honest pipeline or stub labels.",
  accessibilityAudit:
    "Run WCAG AA audit: keyboard navigation, contrast, screen reader labels per docs/standards/09-accessibility-standard.md.",
} as const;

export function appendRecommendations(
  report: ComplianceReport,
  recommendations: readonly string[],
): ComplianceReport {
  return {
    ...report,
    recommendations: [...report.recommendations, ...recommendations],
  };
}
