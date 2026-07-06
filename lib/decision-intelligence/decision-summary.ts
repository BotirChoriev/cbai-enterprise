import {
  decisionReadinessLabel,
} from "@/lib/decision-intelligence/decision-readiness";
import type {
  DecisionContextRecord,
  DecisionSummary,
  DecisionSummarySection,
} from "@/lib/decision-intelligence/decision-types";
import { DECISION_RECORD_VERSION } from "@/lib/decision-intelligence/decision-types";

function formatPercent(ratio: number): string {
  return `${Math.round(ratio * 100)}%`;
}

function buildEvidenceAvailableSection(context: DecisionContextRecord): DecisionSummarySection {
  const lines =
    context.evidenceCoverage.available.length === 0
      ? ["No required evidence is currently available for the declared indicators."]
      : context.evidenceCoverage.available.map(
          (slot) =>
            `${slot.indicatorTitle} (${slot.indicatorId}) — evidence anchor ${slot.evidenceId} marked available.`,
        );

  return {
    id: "evidence-available",
    heading: "Evidence Currently Available",
    content: lines,
  };
}

function buildEvidenceMissingSection(context: DecisionContextRecord): DecisionSummarySection {
  const missingLines = context.evidenceCoverage.missing.map(
    (slot) =>
      `${slot.indicatorTitle} (${slot.indicatorId}) — evidence anchor ${slot.evidenceId} not connected.`,
  );
  const plannedLines = context.evidenceCoverage.planned.map(
    (slot) =>
      `${slot.indicatorTitle} (${slot.indicatorId}) — evidence anchor ${slot.evidenceId} planned, not yet connected.`,
  );

  const content =
    missingLines.length + plannedLines.length === 0
      ? ["All declared indicators have evidence anchors in connected or planned state."]
      : [...missingLines, ...plannedLines];

  return {
    id: "evidence-missing",
    heading: "Evidence Currently Missing",
    content,
  };
}

function buildEvidenceCoverageSection(context: DecisionContextRecord): DecisionSummarySection {
  const { evidenceCoverage } = context;

  return {
    id: "evidence-coverage",
    heading: "Evidence Coverage",
    content: [
      `${evidenceCoverage.availableCount} of ${evidenceCoverage.totalRequired} required evidence slots available (${formatPercent(evidenceCoverage.coverageRatio)} coverage ratio).`,
      `${evidenceCoverage.missingCount} missing, ${evidenceCoverage.plannedCount} planned.`,
      `${context.entityIds.length} entity reference(s), ${context.indicatorIds.length} indicator(s), ${context.sourceIds.length} official source reference(s).`,
    ],
  };
}

function buildMethodologySection(context: DecisionContextRecord): DecisionSummarySection {
  const content =
    context.methodologyReferences.length === 0
      ? ["No methodology references resolved — indicator IDs may be unknown or empty."]
      : context.methodologyReferences.map(
          (ref) =>
            `${ref.indicatorTitle}: ${ref.whyItExists} Required: ${ref.requiredEvidence} Missing: ${ref.missingEvidence} Reference: ${ref.standardReference}.`,
        );

  return {
    id: "methodology",
    heading: "Methodology References",
    content,
  };
}

function buildOfficialSourcesSection(context: DecisionContextRecord): DecisionSummarySection {
  const content =
    context.evidenceCoverage.officialSources.length === 0
      ? ["No official sources referenced by declared indicators."]
      : context.evidenceCoverage.officialSources.map(
          (source) =>
            `${source.sourceName} (${source.sourceId}) — connection: ${source.connectionStatus}, verification: ${source.verificationStatus}. Official site: ${source.officialWebsite}.`,
        );

  return {
    id: "official-sources",
    heading: "Official Sources",
    content,
  };
}

function buildHumanReviewSection(): DecisionSummarySection {
  return {
    id: "human-review",
    heading: "Human Review Required",
    content: [
      "Human oversight is mandatory before any decision use.",
      "This summary organizes evidence posture only — it does not recommend actions, policies, or investments.",
      "Reviewers must verify methodology, source applicability, and entity scope independently.",
    ],
  };
}

function buildLimitationsSection(context: DecisionContextRecord): DecisionSummarySection {
  return {
    id: "limitations",
    heading: "Evidence Limitations",
    content: [...context.limitations],
  };
}

export type BuildDecisionSummaryOptions = {
  title: string;
};

/**
 * Build a factual decision support summary.
 * Outputs evidence posture only — never recommendations or conclusions.
 */
export function buildDecisionSummary(
  context: DecisionContextRecord,
  options: BuildDecisionSummaryOptions,
): DecisionSummary {
  return {
    decisionContextId: context.decisionContextId,
    title: options.title,
    readinessStatus: context.readinessStatus,
    readinessLabel: decisionReadinessLabel(context.readinessStatus),
    humanReviewRequired: true,
    sections: [
      buildEvidenceAvailableSection(context),
      buildEvidenceMissingSection(context),
      buildEvidenceCoverageSection(context),
      buildLimitationsSection(context),
      buildMethodologySection(context),
      buildOfficialSourcesSection(context),
      buildHumanReviewSection(),
    ],
    limitations: context.limitations,
    version: DECISION_RECORD_VERSION,
  };
}

/** Flatten summary sections to plain text lines for validation scanning. */
export function flattenDecisionSummary(summary: DecisionSummary): string {
  return summary.sections.flatMap((section) => section.content).join("\n");
}
