import { countries } from "@/lib/countries";
import { companies } from "@/lib/companies";
import { universities } from "@/lib/universities";
import { OFFICIAL_EVIDENCE_SOURCES } from "@/lib/evidence-infrastructure/sources/catalog";
import { getInfrastructureSummary } from "@/lib/evidence-infrastructure/registry";
import { INFRASTRUCTURE_VERSION } from "@/lib/evidence-infrastructure/types";
import {
  FRAMEWORK_VERSION,
  getIndicatorsForEntity,
} from "@/lib/indicator-framework";
import type { ApplicableEntity } from "@/lib/indicator-framework/types";
import { GOVERNANCE_VERSION } from "@/lib/governance/types";
import { explorerStatusClass } from "@/lib/evidence-explorer";

export const REPORTS_CENTER_VERSION = "1.0.0" as const;

export type ReportAvailabilityLabel =
  | "Not available"
  | "Registry facts only"
  | "Methodology definitions only";

export type ReportEvidenceLabel =
  | "Insufficient Evidence"
  | "Evidence Source Not Connected"
  | "Partial — local registry";

export type ReportMethodologyLabel =
  | "Defined in framework"
  | "Insufficient Evidence"
  | "Not applicable";

export type ReportExportLabel = "Not available" | "Planned";

export type ReportTypeDefinition = {
  id: string;
  title: string;
  description: string;
  audience: string;
  entityScope?: ApplicableEntity | "multi-entity";
  availableToday: ReportAvailabilityLabel;
  evidenceRequired: string;
  evidenceStatus: ReportEvidenceLabel;
  methodologyStatus: ReportMethodologyLabel;
  exportStatus: ReportExportLabel;
  relatedRoute?: string;
};

export type ExportFutureItem = {
  id: string;
  format: string;
  status: "Planned";
  description: string;
};

export type ReportPersona = {
  id: string;
  title: string;
  usefulReports: readonly string[];
};

export type ReportTrustPillar = {
  id: string;
  title: string;
  description: string;
};

export type ReportsCenterModel = {
  version: typeof REPORTS_CENTER_VERSION;
  frameworkVersion: typeof FRAMEWORK_VERSION;
  infrastructureVersion: typeof INFRASTRUCTURE_VERSION;
  governanceVersion: typeof GOVERNANCE_VERSION;
  summary: {
    reportTypes: number;
    availableTodayCount: number;
    connectedSources: number;
    totalSources: number;
    registryEntityCount: number;
  };
  reportTypes: readonly ReportTypeDefinition[];
  exportFuture: readonly ExportFutureItem[];
  personas: readonly ReportPersona[];
  trustPillars: readonly ReportTrustPillar[];
};

function assessEntityReport(
  entity: ApplicableEntity,
  entityLabel: string,
  registryCount: number,
): Pick<
  ReportTypeDefinition,
  "availableToday" | "evidenceRequired" | "evidenceStatus" | "methodologyStatus" | "exportStatus"
> {
  const indicators = getIndicatorsForEntity(entity);
  const connected = indicators.filter((i) => i.status === "connected").length;
  const connectedSources = OFFICIAL_EVIDENCE_SOURCES.filter(
    (s) => s.connectionStatus === "connected",
  ).length;

  const evidenceRequired = `${indicators.length} registered ${entityLabel.toLowerCase()} indicators with connected official sources`;

  if (connectedSources === 0) {
    return {
      availableToday: "Not available",
      evidenceRequired,
      evidenceStatus: "Evidence Source Not Connected",
      methodologyStatus: "Defined in framework",
      exportStatus: "Not available",
    };
  }

  if (connected === 0 && registryCount > 0) {
    return {
      availableToday: "Registry facts only",
      evidenceRequired,
      evidenceStatus: "Partial — local registry",
      methodologyStatus: "Defined in framework",
      exportStatus: "Not available",
    };
  }

  if (connected > 0 && connected < indicators.length) {
    return {
      availableToday: "Registry facts only",
      evidenceRequired,
      evidenceStatus: "Insufficient Evidence",
      methodologyStatus: "Defined in framework",
      exportStatus: "Not available",
    };
  }

  return {
    availableToday: "Not available",
    evidenceRequired,
    evidenceStatus: "Insufficient Evidence",
    methodologyStatus: "Defined in framework",
    exportStatus: "Not available",
  };
}

function buildReportTypes(): ReportTypeDefinition[] {
  const countryAssessment = assessEntityReport(
    "country",
    "country",
    countries.length,
  );
  const companyAssessment = assessEntityReport(
    "company",
    "company",
    companies.length,
  );
  const universityAssessment = assessEntityReport(
    "university",
    "university",
    universities.length,
  );

  const anyConnectedSource =
    OFFICIAL_EVIDENCE_SOURCES.filter((s) => s.connectionStatus === "connected").length > 0;

  return [
    {
      id: "country-intelligence",
      title: "Country Intelligence Report",
      description:
        "Evidence-based country profile compiled from connected sources and indicator methodology.",
      audience: "Analysts, government, researchers",
      entityScope: "country",
      relatedRoute: "/countries",
      ...countryAssessment,
    },
    {
      id: "company-intelligence",
      title: "Company Intelligence Report",
      description:
        "Company registry facts and indicator coverage — no market scores until evidence connects.",
      audience: "Investors, analysts, procurement",
      entityScope: "company",
      relatedRoute: "/companies",
      ...companyAssessment,
    },
    {
      id: "university-intelligence",
      title: "University Intelligence Report",
      description:
        "University registry and education indicator readiness — not league tables.",
      audience: "Students, academics, government",
      entityScope: "university",
      relatedRoute: "/universities",
      ...universityAssessment,
    },
    {
      id: "investor-brief",
      title: "Investor Brief",
      description:
        "Cross-entity evidence summary for due diligence scoping — requires connected fiscal and market sources.",
      audience: "Investors",
      entityScope: "multi-entity",
      availableToday: "Not available",
      evidenceRequired:
        "Connected fiscal, procurement, and company indicators across official sources",
      evidenceStatus: anyConnectedSource ? "Insufficient Evidence" : "Evidence Source Not Connected",
      methodologyStatus: "Defined in framework",
      exportStatus: "Not available",
    },
    {
      id: "government-brief",
      title: "Government Brief",
      description:
        "Evidence gap analysis by domain for publication prioritization — not political ratings.",
      audience: "Government officials",
      entityScope: "multi-entity",
      availableToday: "Registry facts only",
      evidenceRequired:
        "Domain-level indicator coverage with methodology gaps documented",
      evidenceStatus: "Partial — local registry",
      methodologyStatus: "Defined in framework",
      exportStatus: "Not available",
      relatedRoute: "/knowledge",
    },
    {
      id: "research-brief",
      title: "Research Brief",
      description:
        "Indicator definitions, source slugs, and connection status for reproducible scoping.",
      audience: "Researchers",
      entityScope: "multi-entity",
      availableToday: "Methodology definitions only",
      evidenceRequired:
        "Exportable indicator registry with source attribution and status labels",
      evidenceStatus: anyConnectedSource ? "Partial — local registry" : "Evidence Source Not Connected",
      methodologyStatus: "Defined in framework",
      exportStatus: "Planned",
      relatedRoute: "/knowledge",
    },
    {
      id: "academic-methodology",
      title: "Academic Methodology Report",
      description:
        "Citable indicator methodology blocks and evidence requirements from the Global Indicator Framework.",
      audience: "Academics",
      entityScope: "multi-entity",
      availableToday: "Methodology definitions only",
      evidenceRequired:
        "Complete four-field methodology per indicator with version reference",
      evidenceStatus: "Insufficient Evidence",
      methodologyStatus: "Defined in framework",
      exportStatus: "Planned",
    },
  ];
}

function buildExportFuture(): ExportFutureItem[] {
  return [
    {
      id: "pdf",
      format: "PDF",
      status: "Planned",
      description:
        "Static export of verified evidence and methodology — not generated until readiness criteria met.",
    },
    {
      id: "csv",
      format: "CSV",
      status: "Planned",
      description:
        "Structured indicator and source status export for research reproducibility.",
    },
    {
      id: "api",
      format: "API",
      status: "Planned",
      description:
        "Programmatic access to report-ready data — requires governance release review.",
    },
    {
      id: "mobile",
      format: "Mobile",
      status: "Planned",
      description:
        "Mobile-readable report views after accessibility validation in release pipeline.",
    },
  ];
}

function buildPersonas(): ReportPersona[] {
  return [
    {
      id: "citizen",
      title: "Citizen",
      usefulReports: ["Country Intelligence Report", "Government Brief"],
    },
    {
      id: "investor",
      title: "Investor",
      usefulReports: ["Company Intelligence Report", "Investor Brief"],
    },
    {
      id: "government",
      title: "Government",
      usefulReports: ["Government Brief", "Country Intelligence Report"],
    },
    {
      id: "student",
      title: "Student",
      usefulReports: ["University Intelligence Report"],
    },
    {
      id: "researcher",
      title: "Researcher",
      usefulReports: ["Research Brief", "Country Intelligence Report"],
    },
    {
      id: "academic",
      title: "Academic",
      usefulReports: ["Academic Methodology Report", "Research Brief"],
    },
  ];
}

function buildTrustPillars(): ReportTrustPillar[] {
  return [
    {
      id: "evidence-first",
      title: "Evidence First",
      description:
        "Reports compile only from connected sources — no fabricated documents or metrics.",
    },
    {
      id: "source-attribution",
      title: "Source Attribution",
      description:
        "Every report section will trace to registered source slugs and verification status.",
    },
    {
      id: "methodology-version",
      title: "Methodology Version",
      description:
        "Report headers will include framework and methodology version references.",
    },
    {
      id: "reproducibility",
      title: "Reproducibility",
      description:
        "Export formats designed for audit — indicator IDs, sources, and status preserved.",
    },
    {
      id: "no-fabricated-metrics",
      title: "No Fabricated Metrics",
      description:
        "No charts, KPIs, usage stats, or growth curves until evidence and methodology exist.",
    },
  ];
}

/** Build the Reports Center model from platform foundations. */
export function buildReportsCenterModel(): ReportsCenterModel {
  const infra = getInfrastructureSummary();
  const reportTypes = buildReportTypes();
  const availableTodayCount = reportTypes.filter(
    (r) => r.availableToday !== "Not available",
  ).length;

  return {
    version: REPORTS_CENTER_VERSION,
    frameworkVersion: FRAMEWORK_VERSION,
    infrastructureVersion: INFRASTRUCTURE_VERSION,
    governanceVersion: GOVERNANCE_VERSION,
    summary: {
      reportTypes: reportTypes.length,
      availableTodayCount,
      connectedSources: infra.connectedSources,
      totalSources: infra.sourceCount,
      registryEntityCount: countries.length + companies.length + universities.length,
    },
    reportTypes,
    exportFuture: buildExportFuture(),
    personas: buildPersonas(),
    trustPillars: buildTrustPillars(),
  };
}

export function reportStatusClass(label: string): string {
  if (
    label === "Insufficient Evidence" ||
    label === "Evidence Source Not Connected" ||
    label === "Not available"
  ) {
    return "text-zinc-400 bg-zinc-800/50 border-zinc-700/50";
  }
  if (label === "Planned" || label === "Partial — local registry") {
    return "text-violet-400 bg-violet-500/10 border-violet-500/20";
  }
  if (
    label === "Registry facts only" ||
    label === "Methodology definitions only" ||
    label === "Defined in framework"
  ) {
    return "text-amber-400 bg-amber-500/10 border-amber-500/20";
  }
  return explorerStatusClass(label);
}
