/**
 * Phase 8 — Enterprise reporting types.
 * Honest labels only; no fabricated metrics or secrets in exports.
 */

export const ENTERPRISE_REPORTING_VERSION = "1.0.0-phase8" as const;

export const ENTERPRISE_REPORT_TYPES = [
  "executive",
  "country",
  "company",
  "university",
  "investor",
  "mission",
  "evidence",
  "risk",
  "comparison",
  "scenario",
  "org_activity",
  "approval_history",
] as const;

export type EnterpriseReportType = (typeof ENTERPRISE_REPORT_TYPES)[number];

export const ENTERPRISE_REPORT_SECTIONS = [
  "methodology",
  "confidence",
  "missing_data",
  "sources",
  "audit",
] as const;

export type EnterpriseReportSectionId = (typeof ENTERPRISE_REPORT_SECTIONS)[number];

export type EnterpriseReportSection = {
  readonly id: EnterpriseReportSectionId;
  readonly title: string;
  readonly body: string;
};

export type EnterpriseReportSourceRef = {
  readonly label: string;
  readonly status: "device_local" | "authorized_store" | "planned" | "missing";
  readonly detail: string;
};

export type EnterpriseReportBuildInput = {
  readonly reportType: EnterpriseReportType;
  readonly title?: string;
  readonly organizationId?: string | null;
  readonly missionId?: string | null;
  readonly entityLabel?: string | null;
  readonly actorId?: string | null;
};

export type EnterpriseReportDocument = {
  readonly version: typeof ENTERPRISE_REPORTING_VERSION;
  readonly reportType: EnterpriseReportType;
  readonly title: string;
  readonly generatedAt: string;
  readonly availability: "device_local_stores" | "empty" | "partial";
  readonly summary: string;
  readonly sections: readonly EnterpriseReportSection[];
  readonly sources: readonly EnterpriseReportSourceRef[];
  readonly facts: readonly { readonly key: string; readonly value: string }[];
  readonly warnings: readonly string[];
};

export function isEnterpriseReportType(value: string): value is EnterpriseReportType {
  return (ENTERPRISE_REPORT_TYPES as readonly string[]).includes(value);
}

export function reportTypeLabel(type: EnterpriseReportType): string {
  switch (type) {
    case "org_activity":
      return "Org activity";
    case "approval_history":
      return "Approval history";
    default:
      return type.charAt(0).toUpperCase() + type.slice(1);
  }
}
