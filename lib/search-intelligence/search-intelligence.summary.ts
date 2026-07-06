import { entityTypeLabel } from "@/lib/search-intelligence/search-intelligence.query";
import {
  SEARCH_INTELLIGENCE_RECORD_VERSION,
  type SearchIntelligenceRecord,
  type SearchIntelligenceSummary,
  type SearchIntelligenceSummarySection,
} from "@/lib/search-intelligence/search-intelligence.types";

function buildOverviewSection(record: SearchIntelligenceRecord): SearchIntelligenceSummarySection {
  const availableEvidenceCount = record.availableEvidence.filter(
    (entry) => entry.gapStatus === "Available",
  ).length;

  return {
    id: "overview",
    heading: "Overview",
    content: [
      `${record.displayName} (${record.entityId}) — ${entityTypeLabel(record.entityType)} registry entity.`,
      `${record.availableIndicators.length} applicable indicator(s) in Global Indicator Framework.`,
      `${availableEvidenceCount} of ${record.availableEvidence.length} indicator gap(s) marked available.`,
      `${record.availableComparisons.length} same-type comparison target(s) in registry.`,
    ],
  };
}

function buildModulesSection(record: SearchIntelligenceRecord): SearchIntelligenceSummarySection {
  const content =
    record.availableModules.length === 0
      ? ["No navigation modules mapped."]
      : record.availableModules.map(
          (module) =>
            `${module.label} (${module.moduleId}) — ${module.available ? "available" : "not applicable"}: ${module.href}`,
        );

  return {
    id: "modules",
    heading: "Available Modules",
    content,
  };
}

function buildEvidenceSection(record: SearchIntelligenceRecord): SearchIntelligenceSummarySection {
  const content =
    record.availableEvidence.length === 0
      ? ["No evidence gap records mapped."]
      : record.availableEvidence.slice(0, 8).map(
          (entry) =>
            `${entry.indicatorName} (${entry.indicatorId}) — ${entry.gapStatus}, source ${entry.expectedSource}.`,
        );

  if (record.availableEvidence.length > 8) {
    content.push(
      `${record.availableEvidence.length - 8} additional indicator gap record(s) on entity profile.`,
    );
  }

  return {
    id: "evidence",
    heading: "Evidence",
    content,
  };
}

function buildIndicatorsSection(
  record: SearchIntelligenceRecord,
): SearchIntelligenceSummarySection {
  const content =
    record.availableIndicators.length === 0
      ? ["No indicators applicable to this entity type."]
      : record.availableIndicators.slice(0, 8).map(
          (entry) =>
            `${entry.indicatorName} (${entry.indicatorId}) — domain ${entry.domain}, explorer ${entry.explorerCoverageStatus}.`,
        );

  if (record.availableIndicators.length > 8) {
    content.push(
      `${record.availableIndicators.length - 8} additional indicator(s) in framework catalog.`,
    );
  }

  return {
    id: "indicators",
    heading: "Indicators",
    content,
  };
}

function buildSourcesSection(record: SearchIntelligenceRecord): SearchIntelligenceSummarySection {
  const content =
    record.officialSources.length === 0
      ? ["No official sources mapped to applicable indicators."]
      : record.officialSources.map(
          (source) =>
            `${source.sourceName} (${source.sourceId}) — ${source.connectionStatus}, verification ${source.verificationStatus}, ${source.indicatorCount} indicator link(s).`,
        );

  return {
    id: "sources",
    heading: "Official Sources",
    content,
  };
}

function buildDecisionReadinessSection(
  record: SearchIntelligenceRecord,
): SearchIntelligenceSummarySection {
  const content =
    record.availableDecisionContexts.length === 0
      ? ["No Decision Intelligence templates support this entity type."]
      : record.availableDecisionContexts.map(
          (entry) => `${entry.title} (${entry.templateSlug}) — ${entry.readinessLabel}.`,
        );

  if (record.availableTimeline) {
    content.unshift(
      `Timeline: ${record.availableTimeline.readinessLabel}${record.availableTimeline.timelineId ? ` (${record.availableTimeline.timelineId})` : ""}.`,
    );
  }

  return {
    id: "decision-readiness",
    heading: "Decision Readiness",
    content,
  };
}

function buildLimitationsSection(
  record: SearchIntelligenceRecord,
): SearchIntelligenceSummarySection {
  return {
    id: "limitations",
    heading: "Limitations",
    content: [...record.limitations],
  };
}

function buildHumanReviewSection(): SearchIntelligenceSummarySection {
  return {
    id: "human-review",
    heading: "Human Review Required",
    content: [
      "Search intelligence organizes registry navigation — not evaluative metrics or AI-generated answers.",
      "Human oversight is mandatory before using search results in decision support.",
    ],
  };
}

/** Build factual search intelligence summary. */
export function buildSearchIntelligenceSummary(
  record: SearchIntelligenceRecord,
): SearchIntelligenceSummary {
  return {
    searchIntelligenceId: record.searchIntelligenceId,
    displayName: record.displayName,
    entityType: record.entityType,
    sections: [
      buildOverviewSection(record),
      buildModulesSection(record),
      buildEvidenceSection(record),
      buildIndicatorsSection(record),
      buildSourcesSection(record),
      buildDecisionReadinessSection(record),
      buildLimitationsSection(record),
      buildHumanReviewSection(),
    ],
    limitations: record.limitations,
    humanReviewRequired: true,
    version: SEARCH_INTELLIGENCE_RECORD_VERSION,
  };
}

export function flattenSearchIntelligenceSummary(summary: SearchIntelligenceSummary): string {
  return summary.sections.flatMap((section) => section.content).join("\n");
}
