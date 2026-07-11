import type { EntityEvidenceGapProfile } from "@/lib/evidence-gap";
import { getNonAvailableGaps } from "@/lib/evidence-gap";
import type { ProductStatus } from "@/lib/product-status";

export type EntityDecisionReviewSummary = {
  entityName: string;
  availableCount: number;
  missingTopicsCount: number;
  connectedSources: number;
  totalSources: number;
};

type CoverageWithIndicators = {
  indicatorsByDomain: readonly {
    indicators: readonly {
      statusLabel: string;
      title: string;
    }[];
  }[];
  sources: readonly {
    statusLabel: string;
  }[];
};

const REGISTRY_SOURCE_LABEL = "Available — CBAI Local Registry";
const INSUFFICIENT_EVIDENCE_LABEL = "Insufficient Evidence";

export function plainAvailableInformation(sourceLabel: string): string {
  if (sourceLabel === REGISTRY_SOURCE_LABEL) {
    return "Official information available.";
  }
  if (sourceLabel === INSUFFICIENT_EVIDENCE_LABEL) {
    return "Official information is not available yet.";
  }
  return sourceLabel;
}

export function getConnectedAvailableItems(coverage: CoverageWithIndicators): string[] {
  return coverage.indicatorsByDomain
    .flatMap((group) => group.indicators)
    .filter((item) => item.statusLabel === "Connected")
    .map((item) => item.title);
}

export function countConnectedSources(coverage: CoverageWithIndicators): number {
  return coverage.sources.filter((source) => source.statusLabel === "Connected").length;
}

/** Overall entity data status — real registry facts are always live; sourced evidence may not be. */
export function resolveEntityDataStatus(sourceConnectedCount: number, totalSources: number): ProductStatus {
  if (sourceConnectedCount > 0) {
    return sourceConnectedCount >= totalSources ? "live" : "partial";
  }
  return "waiting_for_verified_data";
}

export function buildEntityReviewSummary(
  entityName: string,
  evidenceGaps: EntityEvidenceGapProfile,
  sourceConnectedCount: number,
  totalSources: number,
): EntityDecisionReviewSummary {
  return {
    entityName,
    availableCount: evidenceGaps.availableCount,
    missingTopicsCount: getNonAvailableGaps(evidenceGaps).length,
    connectedSources: sourceConnectedCount,
    totalSources,
  };
}
