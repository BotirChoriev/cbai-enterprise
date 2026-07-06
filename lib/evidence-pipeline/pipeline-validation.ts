import { countries } from "@/lib/countries";
import { findConnectorByIdString } from "@/lib/connectors";
import { OFFICIAL_EVIDENCE_SOURCES } from "@/lib/evidence-infrastructure/sources/catalog";
import { getNormalizerById, NORMALIZER_CATALOG } from "@/lib/evidence-infrastructure/normalizers/catalog";
import { getIndicatorById } from "@/lib/indicator-framework";
import { findMissionByIdString } from "@/lib/missions";
import {
  isValidPipelineIdFormat,
  parsePipelineId,
} from "@/lib/evidence-pipeline/pipeline-builder";
import { getOrderedPipelineStages } from "@/lib/evidence-pipeline/pipeline-stage";
import type {
  EvidencePipelineRegistry,
  PipelineCompatibilityContext,
  PipelineCompatibilityResult,
  PipelineValidationIssue,
  PipelineValidationReport,
} from "@/lib/evidence-pipeline/pipeline-types";
import { PIPELINE_STAGE_IDS } from "@/lib/evidence-pipeline/pipeline-types";
import { REPORT_TYPE_IDS, WORKSPACE_IDS } from "@/lib/registry";

const KNOWN_SOURCE_IDS = new Set(OFFICIAL_EVIDENCE_SOURCES.map((source) => source.id));
const KNOWN_REPORT_IDS = new Set<string>(Object.values(REPORT_TYPE_IDS));
const KNOWN_WORKSPACE_IDS = new Set<string>(Object.values(WORKSPACE_IDS));
const KNOWN_COUNTRY_CODES = new Set(
  countries.flatMap((country) => [country.code.toUpperCase(), country.id.toUpperCase()]),
);
const KNOWN_NORMALIZER_IDS = new Set(NORMALIZER_CATALOG.map((normalizer) => normalizer.id));
const STAGE_SET = new Set<string>(PIPELINE_STAGE_IDS);

function pushIssue(
  target: PipelineValidationIssue[],
  issue: PipelineValidationIssue,
): void {
  target.push(issue);
}

/** Validate a built evidence pipeline registry snapshot. */
export function validateEvidencePipelineRegistry(
  registry: EvidencePipelineRegistry,
): PipelineValidationReport {
  const errors: PipelineValidationIssue[] = [];
  const warnings: PipelineValidationIssue[] = [];
  const seenIds = new Set<string>();
  const orderedStages = getOrderedPipelineStages();

  for (const pipeline of registry.pipelines) {
    if (!isValidPipelineIdFormat(pipeline.pipelineId)) {
      pushIssue(errors, {
        code: "invalid_pipeline_id_format",
        severity: "error",
        message: `Pipeline ID "${pipeline.pipelineId}" does not match required format.`,
        pipelineId: pipeline.pipelineId,
      });
    }

    if (seenIds.has(pipeline.pipelineId)) {
      pushIssue(errors, {
        code: "duplicate_pipeline_id",
        severity: "error",
        message: `Duplicate pipeline ID "${pipeline.pipelineId}".`,
        pipelineId: pipeline.pipelineId,
      });
    }
    seenIds.add(pipeline.pipelineId);

    if (!STAGE_SET.has(pipeline.currentStage)) {
      pushIssue(errors, {
        code: "unknown_stage",
        severity: "error",
        message: `Unknown current stage "${pipeline.currentStage}".`,
        pipelineId: pipeline.pipelineId,
        reference: pipeline.currentStage,
      });
    }

    for (const connectorId of pipeline.supportedConnectors) {
      if (!findConnectorByIdString(connectorId)) {
        pushIssue(warnings, {
          code: "unknown_connector",
          severity: "warning",
          message: `Connector "${connectorId}" not found in connector registry.`,
          pipelineId: pipeline.pipelineId,
          reference: connectorId,
        });
      }
    }

    for (const indicatorId of pipeline.supportedIndicators) {
      if (!getIndicatorById(indicatorId)) {
        pushIssue(errors, {
          code: "unknown_indicator",
          severity: "error",
          message: `Unknown indicator "${indicatorId}" on pipeline "${pipeline.pipelineId}".`,
          pipelineId: pipeline.pipelineId,
          reference: indicatorId,
        });
      }
    }

    for (const reportId of pipeline.supportedReports) {
      if (!KNOWN_REPORT_IDS.has(reportId)) {
        pushIssue(errors, {
          code: "unknown_report",
          severity: "error",
          message: `Unknown report "${reportId}" on pipeline "${pipeline.pipelineId}".`,
          pipelineId: pipeline.pipelineId,
          reference: reportId,
        });
      }
    }

    for (const workspaceId of pipeline.supportedWorkspaces) {
      if (!KNOWN_WORKSPACE_IDS.has(workspaceId)) {
        pushIssue(errors, {
          code: "unknown_workspace",
          severity: "error",
          message: `Unknown workspace "${workspaceId}" on pipeline "${pipeline.pipelineId}".`,
          pipelineId: pipeline.pipelineId,
          reference: workspaceId,
        });
      }
    }

    for (const normalizerId of pipeline.requiredNormalizers) {
      if (!KNOWN_NORMALIZER_IDS.has(normalizerId)) {
        pushIssue(warnings, {
          code: "missing_normalizer",
          severity: "warning",
          message: `Normalizer "${normalizerId}" declared but not yet in Evidence Infrastructure catalog.`,
          pipelineId: pipeline.pipelineId,
          reference: normalizerId,
        });
      } else if (!getNormalizerById(normalizerId)) {
        pushIssue(warnings, {
          code: "missing_normalizer",
          severity: "warning",
          message: `Normalizer "${normalizerId}" could not be resolved.`,
          pipelineId: pipeline.pipelineId,
          reference: normalizerId,
        });
      }
    }

    if (pipeline.validationRules.length === 0) {
      pushIssue(warnings, {
        code: "broken_stage_order",
        severity: "warning",
        message: `Pipeline "${pipeline.pipelineId}" declares no validation rules.`,
        pipelineId: pipeline.pipelineId,
      });
    }

    const parsed = parsePipelineId(pipeline.pipelineId);
    if (parsed && parsed.slug !== pipeline.pipelineId.replace(/^pipeline-/, "")) {
      pushIssue(errors, {
        code: "invalid_pipeline_id_format",
        severity: "error",
        message: `Pipeline slug mismatch for "${pipeline.pipelineId}".`,
        pipelineId: pipeline.pipelineId,
      });
    }

    if (orderedStages.length === 0) {
      pushIssue(errors, {
        code: "broken_stage_order",
        severity: "error",
        message: "Pipeline stage graph is empty.",
        pipelineId: pipeline.pipelineId,
      });
    }
  }

  return {
    valid: errors.length === 0,
    issueCount: errors.length + warnings.length,
    errors,
    warnings,
  };
}

/** Assert registry validity — throws on validation errors. */
export function assertEvidencePipelineRegistryValid(
  registry: EvidencePipelineRegistry,
): void {
  const report = validateEvidencePipelineRegistry(registry);
  if (!report.valid) {
    const summary = report.errors.map((issue) => issue.message).join("; ");
    throw new Error(`Evidence pipeline registry validation failed: ${summary}`);
  }
}

/** Evaluate compatibility context against pipeline validation rules — no execution. */
export function evaluatePipelineCompatibility(
  context: PipelineCompatibilityContext,
): PipelineCompatibilityResult {
  const passedRules: string[] = [];
  const failedRules: string[] = [];
  const warnings: string[] = [];

  if (findConnectorByIdString(context.connectorId)) {
    passedRules.push("connector_registered");
  } else {
    failedRules.push("connector_registered");
  }

  if (getIndicatorById(context.indicatorId)) {
    passedRules.push("indicator_mapped");
  } else {
    failedRules.push("indicator_mapped");
  }

  if (KNOWN_SOURCE_IDS.has(context.evidenceSourceId)) {
    passedRules.push("evidence_source_registered");
  } else {
    failedRules.push("evidence_source_registered");
  }

  if (context.countryCode) {
    if (KNOWN_COUNTRY_CODES.has(context.countryCode.trim().toUpperCase())) {
      passedRules.push("country_exists");
    } else {
      failedRules.push("country_exists");
    }
  }

  if (context.missionId) {
    const mission = findMissionByIdString(context.missionId);
    if (mission) {
      const indicatorOk = mission.requiredIndicators.includes(context.indicatorId);
      const sourceOk = mission.requiredSources.includes(context.evidenceSourceId);
      if (indicatorOk && sourceOk) {
        passedRules.push("mission_compatibility");
      } else {
        warnings.push("mission_compatibility");
      }
    } else {
      warnings.push("mission_compatibility");
    }
  }

  if (context.workspaceId) {
    if (KNOWN_WORKSPACE_IDS.has(context.workspaceId)) {
      passedRules.push("workspace_compatibility");
    } else {
      failedRules.push("workspace_compatibility");
    }
  }

  if (context.reportId && !KNOWN_REPORT_IDS.has(context.reportId)) {
    warnings.push("report_readiness");
  }

  return {
    compatible: failedRules.length === 0,
    passedRules,
    failedRules,
    warnings,
  };
}

export function summarizePipelineValidationReport(
  report: PipelineValidationReport,
): string {
  if (report.valid && report.warnings.length === 0) {
    return "Evidence pipeline registry valid — no issues.";
  }

  const parts: string[] = [];
  if (report.errors.length > 0) parts.push(`${report.errors.length} error(s)`);
  if (report.warnings.length > 0) parts.push(`${report.warnings.length} warning(s)`);
  return `Evidence pipeline validation: ${parts.join(", ")}.`;
}
