/**
 * Missing-source status model — professional fields without inventing availability dates.
 */

import type { EvidenceGapRecord } from "@/lib/evidence-gap";
import { OFFICIAL_EVIDENCE_SOURCES } from "@/lib/evidence-infrastructure/sources/catalog";
import { CONNECTOR_CATALOG } from "@/lib/evidence-infrastructure/connectors/catalog";
import { plainMissingReason } from "@/components/shared/plain-gap-copy";

export type IntegrationStatusLabel =
  | "Connected"
  | "Planned"
  | "Not connected"
  | "Verification pending"
  | "Blocked";

export type MissingSourcePriority = "Required" | "Planned" | "Blocked" | "Not prioritized";

export type MissingSourceStatusModel = {
  indicatorTitle: string;
  expectedSource: string;
  integrationStatus: IntegrationStatusLabel;
  lastChecked: string;
  nextPlannedUpdate: string;
  whyMissing: string;
  priority: MissingSourcePriority;
  estimatedAvailability: string;
  connectEnabled: false;
  connectLabel: string;
};

function resolveLastChecked(expectedSourceId: string | null): string {
  if (!expectedSourceId) {
    return "Not checked";
  }
  const source = OFFICIAL_EVIDENCE_SOURCES.find((s) => s.id === expectedSourceId);
  if (!source) {
    return "Not checked";
  }
  const connector = CONNECTOR_CATALOG.find((c) => c.metadata.sourceSlug === source.slug);
  if (connector?.health.lastCheckedAt) {
    return connector.health.lastCheckedAt;
  }
  return "Not checked — awaiting official source";
}

function resolveIntegrationStatus(gap: EvidenceGapRecord): IntegrationStatusLabel {
  switch (gap.currentStatus) {
    case "available":
      return "Connected";
    case "planned":
      return "Planned";
    case "blocked":
      return "Blocked";
    case "missing":
    default:
      if (gap.missingReason === "Verification pending") return "Verification pending";
      return "Not connected";
  }
}

function resolvePriority(gap: EvidenceGapRecord): MissingSourcePriority {
  switch (gap.currentStatus) {
    case "blocked":
      return "Blocked";
    case "planned":
      return "Planned";
    case "missing":
      return "Required";
    default:
      return "Not prioritized";
  }
}

export function buildMissingSourceStatus(gap: EvidenceGapRecord): MissingSourceStatusModel {
  const why =
    plainMissingReason(gap.missingReason) ??
    gap.missingReason ??
    "Official information for this topic is not available yet.";

  return {
    indicatorTitle: gap.indicatorTitle,
    expectedSource: gap.expectedSource || "Official source not designated",
    integrationStatus: resolveIntegrationStatus(gap),
    lastChecked: resolveLastChecked(gap.expectedSourceId),
    nextPlannedUpdate: "Not scheduled — awaiting official source integration",
    whyMissing: why,
    priority: resolvePriority(gap),
    estimatedAvailability: "Awaiting official source — no date invented",
    connectEnabled: false,
    connectLabel: "Connect Source",
  };
}
