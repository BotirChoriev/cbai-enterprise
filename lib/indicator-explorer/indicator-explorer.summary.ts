import { coverageStatusLabel } from "@/lib/indicator-explorer/indicator-explorer.query";
import {
  INDICATOR_EXPLORER_RECORD_VERSION,
  type IndicatorExplorerRecord,
  type IndicatorExplorerSummary,
  type IndicatorExplorerSummarySection,
} from "@/lib/indicator-explorer/indicator-explorer.types";

function buildDefinitionSection(record: IndicatorExplorerRecord): IndicatorExplorerSummarySection {
  return {
    id: "definition",
    heading: "Indicator Definition",
    content: [
      `${record.indicatorName} (${record.indicatorId}) in domain ${record.domain}.`,
      record.description,
    ],
  };
}

function buildMethodologySection(record: IndicatorExplorerRecord): IndicatorExplorerSummarySection {
  const m = record.methodologyReferences;
  return {
    id: "methodology",
    heading: "Methodology",
    content: [
      `Why it exists: ${m.whyItExists}`,
      `Required evidence: ${m.requiredEvidence}`,
      `Missing evidence: ${m.missingEvidence}`,
      `Reference: ${m.standardReference}`,
    ],
  };
}

function buildSourcesSection(record: IndicatorExplorerRecord): IndicatorExplorerSummarySection {
  const content =
    record.officialSources.length === 0
      ? ["No official sources mapped."]
      : record.officialSources.map(
          (source) =>
            `${source.sourceName} (${source.sourceId}) — ${source.connectionStatus}, verification ${source.verificationStatus}${source.required ? ", required" : ""}.`,
        );

  return {
    id: "sources",
    heading: "Official Sources",
    content,
  };
}

function buildConnectorsSection(record: IndicatorExplorerRecord): IndicatorExplorerSummarySection {
  const content =
    record.plannedConnectors.length === 0
      ? ["No connectors mapped to official sources."]
      : record.plannedConnectors.map(
          (connector) =>
            `${connector.connectorName} (${connector.connectorId}) — status ${connector.status}.`,
        );

  return {
    id: "connectors",
    heading: "Planned Connectors",
    content,
  };
}

function buildDependenciesSection(record: IndicatorExplorerRecord): IndicatorExplorerSummarySection {
  return {
    id: "dependencies",
    heading: "Dependencies",
    content: [
      `Entities: ${record.supportedEntities.join(", ") || "None"}.`,
      `Missions: ${record.supportedMissions.length} mission(s) depend on this indicator.`,
      `Reports: ${record.supportedReports.length} report type(s) consume this indicator scope.`,
    ],
  };
}

function buildCoverageSection(record: IndicatorExplorerRecord): IndicatorExplorerSummarySection {
  return {
    id: "coverage",
    heading: "Coverage Status",
    content: [
      `Status: ${coverageStatusLabel(record.coverageStatus)}.`,
      `${record.officialSources.filter((s) => s.connectionStatus === "connected").length} of ${record.officialSources.length} official source(s) connected.`,
    ],
  };
}

function buildLimitationsSection(record: IndicatorExplorerRecord): IndicatorExplorerSummarySection {
  return {
    id: "limitations",
    heading: "Limitations",
    content: [...record.limitations],
  };
}

function buildHumanReviewSection(): IndicatorExplorerSummarySection {
  return {
    id: "human-review",
    heading: "Human Review Required",
    content: [
      "Human oversight is mandatory before using indicator definitions in decision support.",
      "Indicator Explorer explains structure and dependencies — not ordinals, evaluative metrics, or predictions.",
    ],
  };
}

/** Build factual indicator explorer summary. */
export function buildIndicatorExplorerSummary(
  record: IndicatorExplorerRecord,
): IndicatorExplorerSummary {
  return {
    indicatorExplorerId: record.indicatorExplorerId,
    indicatorName: record.indicatorName,
    coverageStatus: record.coverageStatus,
    coverageLabel: coverageStatusLabel(record.coverageStatus),
    sections: [
      buildDefinitionSection(record),
      buildMethodologySection(record),
      buildSourcesSection(record),
      buildConnectorsSection(record),
      buildDependenciesSection(record),
      buildCoverageSection(record),
      buildLimitationsSection(record),
      buildHumanReviewSection(),
    ],
    limitations: record.limitations,
    humanReviewRequired: true,
    version: INDICATOR_EXPLORER_RECORD_VERSION,
  };
}

export function flattenIndicatorExplorerSummary(summary: IndicatorExplorerSummary): string {
  return summary.sections.flatMap((section) => section.content).join("\n");
}
