import { getIndicatorById } from "@/lib/indicator-framework";
import { OFFICIAL_EVIDENCE_SOURCES } from "@/lib/evidence-infrastructure/sources/catalog";
import {
  MISSION_SUPPORTED_ENTITY_TYPES,
  type MissionCatalog,
  type MissionId,
  type MissionValidationIssue,
  type MissionValidationReport,
} from "@/lib/missions/mission-types";
import { isValidMissionIdFormat, parseMissionId } from "@/lib/missions/mission-builder";
import { REPORT_TYPE_IDS, WORKSPACE_IDS } from "@/lib/registry";

const KNOWN_WORKSPACE_IDS = new Set<string>(Object.values(WORKSPACE_IDS));
const KNOWN_REPORT_IDS = new Set<string>(Object.values(REPORT_TYPE_IDS));
const KNOWN_SOURCE_IDS = new Set(OFFICIAL_EVIDENCE_SOURCES.map((source) => source.id));
const KNOWN_ENTITY_TYPES = new Set<string>(MISSION_SUPPORTED_ENTITY_TYPES);

function pushIssue(
  target: MissionValidationIssue[],
  issue: MissionValidationIssue,
): void {
  target.push(issue);
}

/** Validate a built mission catalog snapshot. */
export function validateMissionCatalog(catalog: MissionCatalog): MissionValidationReport {
  const errors: MissionValidationIssue[] = [];
  const warnings: MissionValidationIssue[] = [];
  const seenIds = new Set<string>();

  for (const mission of catalog.missions) {
    if (!isValidMissionIdFormat(mission.missionId)) {
      pushIssue(errors, {
        code: "invalid_mission_id_format",
        severity: "error",
        message: `Mission ID "${mission.missionId}" does not match required format.`,
        missionId: mission.missionId,
      });
    }

    if (seenIds.has(mission.missionId)) {
      pushIssue(errors, {
        code: "duplicate_mission_id",
        severity: "error",
        message: `Duplicate mission ID "${mission.missionId}".`,
        missionId: mission.missionId,
      });
    }
    seenIds.add(mission.missionId);

    const parsed = parseMissionId(mission.missionId);
    if (parsed && parsed.persona !== mission.persona) {
      pushIssue(errors, {
        code: "invalid_mission_id_format",
        severity: "error",
        message: `Mission persona "${mission.persona}" does not match ID persona "${parsed.persona}".`,
        missionId: mission.missionId,
      });
    }

    for (const entityType of mission.supportedEntities) {
      if (!KNOWN_ENTITY_TYPES.has(entityType)) {
        pushIssue(errors, {
          code: "unknown_entity_type",
          severity: "error",
          message: `Unknown entity type "${entityType}" on mission "${mission.missionId}".`,
          missionId: mission.missionId,
          reference: entityType,
        });
      }
    }

    for (const indicatorId of mission.requiredIndicators) {
      if (!getIndicatorById(indicatorId)) {
        pushIssue(errors, {
          code: "unknown_indicator",
          severity: "error",
          message: `Unknown indicator "${indicatorId}" on mission "${mission.missionId}".`,
          missionId: mission.missionId,
          reference: indicatorId,
        });
      }
    }

    for (const evidenceId of mission.requiredEvidence) {
      if (!evidenceId.startsWith("evidence-")) {
        pushIssue(errors, {
          code: "unknown_evidence",
          severity: "error",
          message: `Invalid evidence anchor format "${evidenceId}".`,
          missionId: mission.missionId,
          reference: evidenceId,
        });
      }
    }

    for (const sourceId of mission.requiredSources) {
      if (!KNOWN_SOURCE_IDS.has(sourceId)) {
        pushIssue(errors, {
          code: "unknown_source",
          severity: "error",
          message: `Unknown source "${sourceId}" on mission "${mission.missionId}".`,
          missionId: mission.missionId,
          reference: sourceId,
        });
      }
    }

    for (const workspaceId of mission.requiredWorkspaces) {
      if (!KNOWN_WORKSPACE_IDS.has(workspaceId)) {
        pushIssue(errors, {
          code: "broken_workspace_reference",
          severity: "error",
          message: `Unknown workspace "${workspaceId}" on mission "${mission.missionId}".`,
          missionId: mission.missionId,
          reference: workspaceId,
        });
      }
    }

    for (const reportId of mission.requiredReports) {
      if (!KNOWN_REPORT_IDS.has(reportId)) {
        pushIssue(errors, {
          code: "unknown_report",
          severity: "error",
          message: `Unknown report "${reportId}" on mission "${mission.missionId}".`,
          missionId: mission.missionId,
          reference: reportId,
        });
      }
    }

    if (mission.requiredIndicators.length === 0) {
      pushIssue(warnings, {
        code: "unknown_indicator",
        severity: "warning",
        message: `Mission "${mission.missionId}" has no required indicators.`,
        missionId: mission.missionId,
      });
    }
  }

  const allIssues = [...errors, ...warnings];

  return {
    valid: errors.length === 0,
    issueCount: allIssues.length,
    errors,
    warnings,
  };
}

/** Validate catalog and throw if errors exist — for CI hooks. */
export function assertMissionCatalogValid(catalog: MissionCatalog): void {
  const report = validateMissionCatalog(catalog);
  if (!report.valid) {
    const summary = report.errors.map((issue) => issue.message).join("; ");
    throw new Error(`Mission catalog validation failed: ${summary}`);
  }
}

export type { MissionId };
