import type { RuleCategory } from "@/lib/governance/types";
import type { RuleCheckStatus } from "@/lib/governance/validation/types";
import { GOVERNANCE_VERSION } from "@/lib/governance/types";

/** Overall compliance status for a module audit report. */
export type ComplianceOverallStatus =
  | "compliant"
  | "non_compliant"
  | "partial"
  | "not_evaluated";

/** Result for a single rule check — populated by future validators or manual audits. */
export type RuleCheckResult = {
  ruleId: string;
  ruleCategory: RuleCategory;
  status: RuleCheckStatus;
  message?: string;
  evidence?: string;
  checkedAt?: string;
};

/** Reusable compliance report — structural type for audits and future CI output. */
export type ComplianceReport = {
  id: string;
  version: typeof GOVERNANCE_VERSION;
  moduleId: string;
  moduleName: string;
  targetRoute?: string;
  evaluatedAt: string;
  evaluatedBy: string;
  overallStatus: ComplianceOverallStatus;
  passedRules: readonly RuleCheckResult[];
  failedRules: readonly RuleCheckResult[];
  warnings: readonly RuleCheckResult[];
  recommendations: readonly string[];
  notes?: string;
};

/** Summary counts derived from a compliance report. */
export type ComplianceReportSummary = {
  totalChecks: number;
  passedCount: number;
  failedCount: number;
  warningCount: number;
  skippedCount: number;
  criticalFailures: number;
};

/** Input for creating an empty report template — no validation executed. */
export type ComplianceReportTemplateInput = {
  moduleId: string;
  moduleName: string;
  targetRoute?: string;
  evaluatedBy?: string;
};
