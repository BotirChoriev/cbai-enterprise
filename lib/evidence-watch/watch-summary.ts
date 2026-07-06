import { changeTypeLabel } from "@/lib/evidence-watch/watch-query";
import {
  WATCH_RECORD_VERSION,
  type EvidenceWatchRecord,
  type EvidenceWatchSummary,
  type EvidenceWatchSummarySection,
} from "@/lib/evidence-watch/watch-types";

function buildChangeDescriptionSection(
  record: EvidenceWatchRecord,
): EvidenceWatchSummarySection {
  return {
    id: "change-description",
    heading: "What Changed",
    content: [
      `Change type: ${changeTypeLabel(record.changeType)}.`,
      `Timestamp: ${record.changeTimestamp} (registry snapshot).`,
      `Official source: ${record.sourceId}.`,
      record.connectorId
        ? `Connector: ${record.connectorId}.`
        : "Connector: none mapped.",
      record.methodologyReference.description,
    ],
  };
}

function buildAffectedEntitiesSection(
  record: EvidenceWatchRecord,
): EvidenceWatchSummarySection {
  return {
    id: "affected-entities",
    heading: "Affected Entities",
    content:
      record.entityIds.length === 0
        ? ["No registry entities mapped to affected indicators."]
        : [
            `${record.entityIds.length} registry entit${record.entityIds.length === 1 ? "y" : "ies"} affected.`,
            ...record.entityIds.slice(0, 8).map((entityId) => entityId),
            ...(record.entityIds.length > 8
              ? [`${record.entityIds.length - 8} additional entity ID(s) in catalog.`]
              : []),
          ],
  };
}

function buildAffectedIndicatorsSection(
  record: EvidenceWatchRecord,
): EvidenceWatchSummarySection {
  return {
    id: "affected-indicators",
    heading: "Affected Indicators",
    content:
      record.indicatorIds.length === 0
        ? ["No indicators mapped."]
        : record.indicatorIds.map((indicatorId) => indicatorId),
  };
}

function buildAffectedReportsSection(
  record: EvidenceWatchRecord,
): EvidenceWatchSummarySection {
  return {
    id: "affected-reports",
    heading: "Affected Reports",
    content:
      record.affectedReports.length === 0
        ? ["No report types mapped."]
        : record.affectedReports.map((reportId) => reportId),
  };
}

function buildAffectedMissionsSection(
  record: EvidenceWatchRecord,
): EvidenceWatchSummarySection {
  return {
    id: "affected-missions",
    heading: "Affected Missions & Workspaces",
    content: [
      `${record.affectedMissions.length} mission(s): ${record.affectedMissions.join(", ") || "none"}.`,
      `${record.affectedWorkspaces.length} workspace(s): ${record.affectedWorkspaces.join(", ") || "none"}.`,
    ],
  };
}

function buildMethodologySection(record: EvidenceWatchRecord): EvidenceWatchSummarySection {
  return {
    id: "methodology",
    heading: "Methodology Reference",
    content: [
      record.methodologyReference.standardReference,
      record.methodologyReference.description,
      `Registry version: ${record.methodologyReference.registryVersion}.`,
    ],
  };
}

function buildLimitationsSection(record: EvidenceWatchRecord): EvidenceWatchSummarySection {
  return {
    id: "limitations",
    heading: "Limitations",
    content: [...record.limitations],
  };
}

function buildHumanReviewSection(): EvidenceWatchSummarySection {
  return {
    id: "human-review",
    heading: "Human Review Required",
    content: [
      "Evidence Watch records describe official evidence posture — not interpreted outcomes.",
      "Human oversight is mandatory before using change records in decision support.",
    ],
  };
}

/** Build factual evidence watch summary. */
export function buildEvidenceWatchSummary(record: EvidenceWatchRecord): EvidenceWatchSummary {
  return {
    watchId: record.watchId,
    changeType: record.changeType,
    changeTypeLabel: changeTypeLabel(record.changeType),
    changeTimestamp: record.changeTimestamp,
    sections: [
      buildChangeDescriptionSection(record),
      buildAffectedEntitiesSection(record),
      buildAffectedIndicatorsSection(record),
      buildAffectedReportsSection(record),
      buildAffectedMissionsSection(record),
      buildMethodologySection(record),
      buildLimitationsSection(record),
      buildHumanReviewSection(),
    ],
    limitations: record.limitations,
    humanReviewRequired: true,
    version: WATCH_RECORD_VERSION,
  };
}

export function flattenEvidenceWatchSummary(summary: EvidenceWatchSummary): string {
  return summary.sections.flatMap((section) => section.content).join("\n");
}
