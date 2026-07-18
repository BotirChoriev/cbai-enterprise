import { timelineReadinessLabel } from "@/lib/timeline/timeline-readiness";
import {
  TIMELINE_EVIDENCE_NOT_CONNECTED_LABEL,
  TIMELINE_RECORD_VERSION,
  TIMELINE_YEAR_STRUCTURE_PREPARED_LABEL,
} from "@/lib/timeline/timeline-types";
import type {
  TimelineRecord,
  TimelineSummary,
  TimelineSummarySection,
} from "@/lib/timeline/timeline-types";

function buildVerifiedEvidenceSection(record: TimelineRecord): TimelineSummarySection {
  const verifiedYears = record.yearEntries.filter((entry) => entry.status === "verified");

  const content =
    verifiedYears.length === 0
      ? [TIMELINE_EVIDENCE_NOT_CONNECTED_LABEL]
      : verifiedYears.map(
          (entry) => `${entry.year}: ${entry.label}`,
        );

  return {
    id: "verified-evidence",
    heading: "Verified Evidence Timeline",
    content,
  };
}

function buildEvidenceCoverageSection(record: TimelineRecord): TimelineSummarySection {
  const verifiedYearCount = record.availableEvidenceYears.length;
  const content =
    verifiedYearCount === 0
      ? [
          TIMELINE_YEAR_STRUCTURE_PREPARED_LABEL,
          `${record.indicatorCoverage.filter((i) => i.statusLabel === "Connected").length} of ${record.indicatorCoverage.length} applicable indicators connected at framework level — year-level time-series evidence not connected.`,
          `Supported year range: ${record.supportedYears[0]}–${record.supportedYears[record.supportedYears.length - 1]} (structural slots only).`,
        ]
      : [
          `${verifiedYearCount} of ${record.supportedYears.length} year slots have connected time-series evidence.`,
          `${record.indicatorCoverage.filter((i) => i.statusLabel === "Connected").length} of ${record.indicatorCoverage.length} applicable indicators connected.`,
          `Supported year range: ${record.supportedYears[0]}–${record.supportedYears[record.supportedYears.length - 1]}.`,
        ];

  return {
    id: "evidence-coverage",
    heading: "Evidence Coverage Timeline",
    content,
  };
}

function buildMissingYearsSection(record: TimelineRecord): TimelineSummarySection {
  const content =
    record.availableEvidenceYears.length === 0
      ? record.supportedYears.map(
          (year) => `${year}: ${TIMELINE_EVIDENCE_NOT_CONNECTED_LABEL}`,
        )
      : record.missingEvidenceYears.length === 0
        ? ["All supported year slots have connected evidence."]
        : record.missingEvidenceYears.map((year) => `${year}: ${TIMELINE_EVIDENCE_NOT_CONNECTED_LABEL}`);

  return {
    id: "missing-years",
    heading: "Missing Years",
    content,
  };
}

function buildOfficialSourcesSection(record: TimelineRecord): TimelineSummarySection {
  const content = record.officialSources.map(
    (source) =>
      `${source.sourceName} (${source.sourceId}) — connection: ${source.connectionStatus}, verification: ${source.verificationStatus}.`,
  );

  return {
    id: "official-sources",
    heading: "Official Sources",
    content: content.length > 0 ? content : ["No official sources referenced."],
  };
}

function buildMethodologySection(record: TimelineRecord): TimelineSummarySection {
  const content =
    record.methodologyReferences.length === 0
      ? ["No methodology references resolved."]
      : record.methodologyReferences.map(
          (ref) =>
            `${ref.indicatorTitle}: ${ref.whyItExists} Required: ${ref.requiredEvidence}`,
        );

  return {
    id: "methodology",
    heading: "Methodology",
    content,
  };
}

function buildLimitationsSection(record: TimelineRecord): TimelineSummarySection {
  return {
    id: "limitations",
    heading: "Limitations",
    content: [...record.limitations],
  };
}

function buildHumanReviewSection(): TimelineSummarySection {
  return {
    id: "human-review",
    heading: "Human Review Notice",
    content: [
      "Human oversight is mandatory before using timeline data in any decision context.",
      "This timeline organizes evidence readiness only — not historical events or political interpretation.",
      "Reviewers must verify source applicability and year coverage independently.",
    ],
  };
}

/** Build factual timeline summary — structure and readiness only. */
export function buildTimelineSummary(record: TimelineRecord): TimelineSummary {
  return {
    timelineId: record.timelineId,
    entityLabel: record.entityLabel,
    readinessStatus: record.readinessStatus,
    readinessLabel: timelineReadinessLabel(record.readinessStatus),
    humanReviewRequired: true,
    sections: [
      buildVerifiedEvidenceSection(record),
      buildEvidenceCoverageSection(record),
      buildMissingYearsSection(record),
      buildOfficialSourcesSection(record),
      buildMethodologySection(record),
      buildLimitationsSection(record),
      buildHumanReviewSection(),
    ],
    limitations: record.limitations,
    version: TIMELINE_RECORD_VERSION,
  };
}

/** Flatten summary for validation scanning. */
export function flattenTimelineSummary(summary: TimelineSummary): string {
  return summary.sections.flatMap((section) => section.content).join("\n");
}
