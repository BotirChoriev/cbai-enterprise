/**
 * Honest global status for enterprise surfaces.
 * Coverage % is registry connection math only — never a quality or confidence score.
 */

import { getInfrastructureSummary } from "@/lib/evidence-infrastructure/registry";
import { CONNECTOR_CATALOG } from "@/lib/evidence-infrastructure/connectors/catalog";

export type EvidenceHealthLabel =
  | "Healthy — registry connected"
  | "Partial — local registry only"
  | "Planned — awaiting official sources"
  | "Insufficient Evidence";

export type ConfidenceLabel = "Not assessed" | "Partial — verified sources registered";

export type GlobalStatusModel = {
  connectedSources: number;
  missingSources: number;
  plannedSources: number;
  totalSources: number;
  /** Registry connection rate (connected indicators / total), or null when unknown. */
  coveragePercent: number | null;
  coverageBasis: string;
  confidence: ConfidenceLabel;
  lastUpdated: string;
  evidenceHealth: EvidenceHealthLabel;
};

export type CoverageCountsInput = {
  connected?: number;
  planned?: number;
  notConnected?: number;
  verificationPending?: number;
  total?: number;
  connectedSources?: number;
  totalSources?: number;
};

function formatLastChecked(): string {
  const checked = CONNECTOR_CATALOG.map((c) => c.health.lastCheckedAt).filter(
    (value): value is string => typeof value === "string" && value.length > 0,
  );
  if (checked.length === 0) {
    return "Not checked — awaiting official source integration";
  }
  const latest = [...checked].sort().at(-1);
  return latest ?? "Not checked — awaiting official source integration";
}

function resolveEvidenceHealth(input: {
  connectedIndicators: number;
  connectedSources: number;
  plannedSources: number;
}): EvidenceHealthLabel {
  if (input.connectedIndicators > 0 && input.connectedSources > 1) {
    return "Healthy — registry connected";
  }
  if (input.connectedSources > 0) {
    return "Partial — local registry only";
  }
  if (input.plannedSources > 0) {
    return "Planned — awaiting official sources";
  }
  return "Insufficient Evidence";
}

/** Build page-level status from infrastructure + optional entity coverage counts. */
export function buildGlobalStatus(coverage?: CoverageCountsInput): GlobalStatusModel {
  const infra = getInfrastructureSummary();
  const connectedSources = coverage?.connectedSources ?? infra.connectedSources;
  const totalSources = coverage?.totalSources ?? infra.sourceCount;
  const plannedSources = infra.plannedSources;
  const missingSources = Math.max(0, totalSources - connectedSources);

  const connectedIndicators = coverage?.connected ?? 0;
  const totalIndicators = coverage?.total ?? 0;
  const coveragePercent =
    totalIndicators > 0
      ? Math.round((connectedIndicators / totalIndicators) * 100)
      : totalSources > 0
        ? Math.round((connectedSources / totalSources) * 100)
        : null;

  const coverageBasis =
    totalIndicators > 0
      ? `${connectedIndicators} of ${totalIndicators} registered indicators connected`
      : `${connectedSources} of ${totalSources} registered sources connected`;

  return {
    connectedSources,
    missingSources,
    plannedSources,
    totalSources,
    coveragePercent,
    coverageBasis,
    confidence:
      infra.verifiedSources > 0
        ? "Partial — verified sources registered"
        : "Not assessed",
    lastUpdated: formatLastChecked(),
    evidenceHealth: resolveEvidenceHealth({
      connectedIndicators,
      connectedSources,
      plannedSources,
    }),
  };
}

/** Professional list-card evidence label — plural-aware, no generic filler. */
export function formatIndicatorCoverageLabel(connected: number, total: number): string {
  if (connected <= 0) {
    return total > 0 ? `0 / ${total} indicators connected` : "Registry available";
  }
  const noun = connected === 1 ? "indicator" : "indicators";
  return total > 0
    ? `${connected} / ${total} ${noun} connected`
    : `${connected} ${noun} connected`;
}
