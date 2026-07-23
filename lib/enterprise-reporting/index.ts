/**
 * Phase 8 — Enterprise reporting public API.
 */

export {
  ENTERPRISE_REPORTING_VERSION,
  ENTERPRISE_REPORT_TYPES,
  ENTERPRISE_REPORT_SECTIONS,
  isEnterpriseReportType,
  reportTypeLabel,
} from "@/lib/enterprise-reporting/types";
export type {
  EnterpriseReportType,
  EnterpriseReportSectionId,
  EnterpriseReportSection,
  EnterpriseReportSourceRef,
  EnterpriseReportBuildInput,
  EnterpriseReportDocument,
} from "@/lib/enterprise-reporting/types";

export { buildEnterpriseReport } from "@/lib/enterprise-reporting/builder";
export type { ReportBuilderDeps } from "@/lib/enterprise-reporting/builder";

export {
  exportReportToHtml,
  exportReportToCsv,
  assertExportHasNoSecrets,
} from "@/lib/enterprise-reporting/export";
