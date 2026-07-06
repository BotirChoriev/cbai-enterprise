import {
  COMPARISON_RECORD_VERSION,
  type ComparisonReadinessStatus,
  type ComparisonSummary,
  type ComparisonSummarySection,
  type EvidenceComparisonRecord,
} from "@/lib/evidence-comparison/comparison-types";
import { comparisonReadinessLabel } from "@/lib/evidence-comparison/comparison-query";

function buildCoverageSection(record: EvidenceComparisonRecord): ComparisonSummarySection {
  return {
    id: "coverage-summary",
    heading: "Coverage Summary",
    content: [
      `${record.leftEntityLabel}: ${record.leftAvailableEvidence.length} indicator(s) with connected evidence.`,
      `${record.rightEntityLabel}: ${record.rightAvailableEvidence.length} indicator(s) with connected evidence.`,
      `${record.sharedIndicators.length} shared applicable indicator(s).`,
    ],
  };
}

function buildSharedIndicatorsSection(record: EvidenceComparisonRecord): ComparisonSummarySection {
  const sameCount = record.indicatorRows.filter(
    (row) => row.note === "same evidence status",
  ).length;
  const differsCount = record.indicatorRows.length - sameCount;

  return {
    id: "shared-indicators",
    heading: "Shared Indicators",
    content: [
      `${record.sharedIndicators.length} indicators apply to both entities.`,
      `${sameCount} indicator(s) with same evidence status.`,
      `${differsCount} indicator(s) where evidence gap differs.`,
    ],
  };
}

function buildGapsSection(record: EvidenceComparisonRecord): ComparisonSummarySection {
  return {
    id: "evidence-gaps",
    heading: "Evidence Gaps",
    content: [
      `${record.leftEntityLabel} gaps: ${record.leftEvidenceGaps.length} indicator(s).`,
      `${record.rightEntityLabel} gaps: ${record.rightEvidenceGaps.length} indicator(s).`,
    ],
  };
}

function buildSourcesSection(record: EvidenceComparisonRecord): ComparisonSummarySection {
  return {
    id: "sources",
    heading: "Official Sources",
    content: [
      `${record.sharedSources.length} shared official source reference(s).`,
      `${record.missingSources.length} source(s) not connected on one or both entities.`,
    ],
  };
}

function buildMethodologySection(record: EvidenceComparisonRecord): ComparisonSummarySection {
  const content =
    record.methodologyReferences.length === 0
      ? ["No methodology references resolved."]
      : record.methodologyReferences.map(
          (ref) => `${ref.indicatorTitle}: ${ref.whyItExists}`,
        );

  return {
    id: "methodology",
    heading: "Methodology",
    content,
  };
}

function buildLimitationsSection(record: EvidenceComparisonRecord): ComparisonSummarySection {
  return {
    id: "limitations",
    heading: "Limitations",
    content: [...record.limitations],
  };
}

function buildHumanReviewSection(): ComparisonSummarySection {
  return {
    id: "human-review",
    heading: "Human Review Required",
    content: [
      "Human oversight is mandatory before using comparison output in any decision context.",
      "Comparison describes evidence readiness differences only — not ordinals, evaluative metrics, or recommendations.",
    ],
  };
}

/** Build factual comparison summary — no winner or score language. */
export function buildComparisonSummary(
  record: EvidenceComparisonRecord,
): ComparisonSummary {
  return {
    comparisonId: record.comparisonId,
    leftEntityLabel: record.leftEntityLabel,
    rightEntityLabel: record.rightEntityLabel,
    readinessStatus: record.readinessStatus,
    readinessLabel: comparisonReadinessLabel(record.readinessStatus),
    sections: [
      buildCoverageSection(record),
      buildSharedIndicatorsSection(record),
      buildGapsSection(record),
      buildSourcesSection(record),
      buildMethodologySection(record),
      buildLimitationsSection(record),
      buildHumanReviewSection(),
    ],
    limitations: record.limitations,
    humanReviewRequired: true,
    version: COMPARISON_RECORD_VERSION,
  };
}

export function flattenComparisonSummary(summary: ComparisonSummary): string {
  return summary.sections.flatMap((section) => section.content).join("\n");
}

export function unsupportedComparisonSummary(
  leftLabel: string,
  message: string,
): ComparisonSummary {
  return {
    comparisonId: null,
    leftEntityLabel: leftLabel,
    rightEntityLabel: "—",
    readinessStatus: "unsupported",
    readinessLabel: comparisonReadinessLabel("unsupported"),
    sections: [
      {
        id: "limitations",
        heading: "Comparison Unavailable",
        content: [message],
      },
    ],
    limitations: [message],
    humanReviewRequired: true,
    version: COMPARISON_RECORD_VERSION,
  };
}

export type { ComparisonReadinessStatus };
