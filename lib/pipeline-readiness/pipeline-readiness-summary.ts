import { buildReportsCenterModel } from "@/lib/reports-center";
import { getAllConnectors } from "@/lib/connectors";
import type {
  EntityPipelineReadinessModel,
  PipelineReadinessState,
  ReportPipelineReadinessItem,
  ReportPipelineReadinessModel,
} from "@/lib/pipeline-readiness/pipeline-readiness.types";
import { PIPELINE_READINESS_VERSION } from "@/lib/pipeline-readiness/pipeline-readiness.types";
import { getOfficialEvidencePipeline } from "@/lib/evidence-pipeline";
import {
  getIndicatorsForEntity,
} from "@/lib/indicator-framework";
import type { PipelineSupportedEntityType } from "@/lib/evidence-pipeline";
import {
  buildCountryCoverageProfile,
} from "@/lib/countries.coverage";
import {
  buildCompanyCoverageProfile,
} from "@/lib/companies.coverage";
import {
  buildUniversityCoverageProfile,
} from "@/lib/universities.coverage";
import type { Country } from "@/lib/countries";
import type { Company } from "@/lib/companies";
import type { University } from "@/lib/universities";

function mapReportEvidenceToPipelineState(
  evidenceStatus: string,
): PipelineReadinessState {
  if (evidenceStatus === "Partial — local registry") return "partial";
  if (evidenceStatus === "Evidence Source Not Connected") return "planned";
  if (evidenceStatus === "Insufficient Evidence") return "partial";
  return "planned";
}

function connectorDependencyLabel(): string {
  const connected = getAllConnectors().filter((c) => c.status === "connected").length;
  const planned = getAllConnectors().filter((c) => c.status === "planned").length;
  if (connected === 0) {
    return `${planned} official connectors planned — none connected`;
  }
  return `${connected} connected · ${planned} planned official connectors`;
}

/** Build report pipeline readiness for Reports Center. */
export function buildReportPipelineReadiness(): ReportPipelineReadinessModel {
  const reportsModel = buildReportsCenterModel();
  const pipeline = getOfficialEvidencePipeline();

  const reports: ReportPipelineReadinessItem[] = reportsModel.reportTypes.map((report) => ({
    reportId: report.id,
    title: report.title,
    pipelineState: mapReportEvidenceToPipelineState(report.evidenceStatus),
    evidenceLabel: report.evidenceStatus,
    connectorDependency: connectorDependencyLabel(),
    exportLabel: report.exportStatus,
  }));

  return {
    version: PIPELINE_READINESS_VERSION,
    pipelineId: pipeline.pipelineId,
    pipelineName: pipeline.pipelineName,
    currentStatus: "partial",
    reports,
    exportStatus: "Planned",
    limitations: [
      "Report export through the evidence pipeline is not available.",
      "Report readiness reflects connected sources — not generated output.",
      "No charts, KPIs, or fabricated progress metrics.",
    ],
    nextSteps: [
      "Connect official evidence sources through validated connector pipeline.",
      "Meet per-report indicator and methodology criteria before export.",
      "Enable export only after governance verification gates pass.",
    ],
  };
}

function resolveEntityFlowStatus(
  connectedSources: number,
  indicatorsConnected: number,
): PipelineReadinessState {
  if (connectedSources === 0 && indicatorsConnected === 0) return "planned";
  if (connectedSources > 0 && indicatorsConnected === 0) return "partial";
  if (indicatorsConnected > 0) return "partial";
  return "planned";
}

function buildEntityReadinessFromCoverage(
  entityType: PipelineSupportedEntityType,
  entityLabel: string,
  connectedSourceCount: number,
  totalSourceCount: number,
  indicatorsConnected: number,
  indicatorsTotal: number,
): EntityPipelineReadinessModel {
  const pipeline = getOfficialEvidencePipeline();
  const entityConnectors = getAllConnectors().filter((connector) =>
    connector.supportedEntities.includes(entityType),
  );
  const connectedConnectorCount = entityConnectors.filter(
    (c) => c.status === "connected",
  ).length;
  const plannedConnectorCount = entityConnectors.filter(
    (c) => c.status === "planned" || c.status === "ready",
  ).length;

  const flowStatus = resolveEntityFlowStatus(connectedSourceCount, indicatorsConnected);

  let indicatorReadinessLabel = "Evidence source not connected";
  if (indicatorsConnected > 0) {
    indicatorReadinessLabel = `${indicatorsConnected} of ${indicatorsTotal} indicators connected`;
  } else if (connectedSourceCount > 0) {
    indicatorReadinessLabel = "Registry facts only — indicators not connected";
  }

  let sourceReadinessLabel = "Evidence source not connected";
  if (connectedSourceCount > 0) {
    sourceReadinessLabel = `${connectedSourceCount} of ${totalSourceCount} sources connected`;
  } else if (totalSourceCount > 0) {
    sourceReadinessLabel = "Evidence source planned";
  }

  return {
    version: PIPELINE_READINESS_VERSION,
    entityType,
    entityLabel,
    pipelineId: pipeline.pipelineId,
    evidenceFlowStatus: flowStatus,
    connectedSourceCount,
    totalSourceCount,
    plannedConnectorCount,
    connectedConnectorCount,
    indicatorsConnected,
    indicatorsTotal,
    indicatorReadinessLabel,
    sourceReadinessLabel,
    limitations: [
      "No score without evidence — registry facts only until sources connect.",
      "Evidence flow is architectural readiness — live processing not active.",
    ],
  };
}

export function buildCountryPipelineReadiness(country: Country): EntityPipelineReadinessModel {
  const coverage = buildCountryCoverageProfile(country);
  const indicators = getIndicatorsForEntity("country");
  const indicatorsConnected = indicators.filter((i) => i.status === "connected").length;
  const connectedSourceCount = coverage.sources.filter(
    (s) => s.statusLabel === "Connected",
  ).length;

  return buildEntityReadinessFromCoverage(
    "country",
    country.name,
    connectedSourceCount,
    coverage.sources.length,
    indicatorsConnected,
    indicators.length,
  );
}

export function buildCompanyPipelineReadiness(company: Company): EntityPipelineReadinessModel {
  const coverage = buildCompanyCoverageProfile(company);
  const indicators = getIndicatorsForEntity("company");
  const indicatorsConnected = indicators.filter((i) => i.status === "connected").length;
  const connectedSourceCount = coverage.sources.filter(
    (s) => s.statusLabel === "Connected",
  ).length;

  return buildEntityReadinessFromCoverage(
    "company",
    company.name,
    connectedSourceCount,
    coverage.sources.length,
    indicatorsConnected,
    indicators.length,
  );
}

export function buildUniversityPipelineReadiness(
  university: University,
): EntityPipelineReadinessModel {
  const coverage = buildUniversityCoverageProfile(university);
  const indicators = getIndicatorsForEntity("university");
  const indicatorsConnected = indicators.filter((i) => i.status === "connected").length;
  const connectedSourceCount = coverage.sources.filter(
    (s) => s.statusLabel === "Connected",
  ).length;

  return buildEntityReadinessFromCoverage(
    "university",
    university.name,
    connectedSourceCount,
    coverage.sources.length,
    indicatorsConnected,
    indicators.length,
  );
}
