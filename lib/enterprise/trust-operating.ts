/**
 * Trust operating dashboard — derived only from registered official sources.
 * No invented trust scores; score is connection rate of the catalog.
 */

import { OFFICIAL_EVIDENCE_SOURCES } from "@/lib/evidence-infrastructure/sources/catalog";
import { CONNECTOR_CATALOG } from "@/lib/evidence-infrastructure/connectors/catalog";
import { getInfrastructureSummary } from "@/lib/evidence-infrastructure/registry";
import { PLATFORM_VERSION } from "@/lib/platform-home";

export type TrustSourceRow = {
  id: string;
  name: string;
  organization: string;
  connectionStatus: string;
  verificationStatus: string;
  updateFrequency: string;
  officialWebsite: string;
  lastChecked: string;
};

export type TrustOperatingModel = {
  connectedOfficialSources: readonly TrustSourceRow[];
  missingOfficialSources: readonly TrustSourceRow[];
  sourceHealth: {
    healthy: number;
    unknown: number;
    degraded: number;
    unavailable: number;
  };
  verificationTimeline: readonly {
    id: string;
    label: string;
    status: string;
  }[];
  /** Honest catalog connection rate — not a quality grade. */
  trustScoreLabel: string;
  trustScoreBasis: string;
  auditTrail: readonly string[];
  evidenceFreshness: string;
  reviewHistory: readonly string[];
  platformVersion: string;
};

function sourceRow(source: (typeof OFFICIAL_EVIDENCE_SOURCES)[number]): TrustSourceRow {
  const connector = CONNECTOR_CATALOG.find((c) => c.metadata.sourceSlug === source.slug);
  return {
    id: source.id,
    name: source.name,
    organization: source.organization,
    connectionStatus: source.connectionStatus,
    verificationStatus: source.verificationStatus,
    updateFrequency: source.updateFrequency,
    officialWebsite: source.officialWebsite,
    lastChecked: connector?.health.lastCheckedAt ?? "Not checked",
  };
}

export function buildTrustOperatingModel(): TrustOperatingModel {
  const infra = getInfrastructureSummary();
  const connected = OFFICIAL_EVIDENCE_SOURCES.filter((s) => s.connectionStatus === "connected").map(
    sourceRow,
  );
  const missing = OFFICIAL_EVIDENCE_SOURCES.filter((s) => s.connectionStatus !== "connected").map(
    sourceRow,
  );

  const health = { healthy: 0, unknown: 0, degraded: 0, unavailable: 0 };
  for (const connector of CONNECTOR_CATALOG) {
    health[connector.health.status] += 1;
  }

  const rate =
    infra.sourceCount > 0
      ? Math.round((infra.connectedSources / infra.sourceCount) * 100)
      : 0;

  return {
    connectedOfficialSources: connected,
    missingOfficialSources: missing,
    sourceHealth: health,
    verificationTimeline: [
      {
        id: "registered",
        label: "Sources registered in evidence infrastructure",
        status: `${infra.sourceCount} registered`,
      },
      {
        id: "connected",
        label: "Sources connected",
        status: `${infra.connectedSources} connected`,
      },
      {
        id: "verified",
        label: "Sources verified",
        status: `${infra.verifiedSources} verified`,
      },
      {
        id: "planned",
        label: "Sources planned",
        status: `${infra.plannedSources} planned`,
      },
    ],
    trustScoreLabel: `${rate}% catalog connection`,
    trustScoreBasis:
      "Trust Score reflects connected registered sources ÷ total registered sources. It is not an evidence quality grade.",
    auditTrail: [
      `Evidence infrastructure version ${infra.version}`,
      `${infra.connectorCount} connectors declared`,
      `${infra.adapterCount} adapters declared`,
      "Human review remains required before operational decisions.",
    ],
    evidenceFreshness:
      CONNECTOR_CATALOG.some((c) => c.health.lastCheckedAt)
        ? "Partial — some connectors report last-checked timestamps"
        : "Not checked — official connectors have not reported freshness yet",
    reviewHistory: [
      "No completed human review cycles are recorded for external official sources yet.",
      "Local registry verification status is available for connected platform sources.",
    ],
    platformVersion: PLATFORM_VERSION,
  };
}
