/**
 * Phase 7 — Planned official connector adapters.
 * Metadata + health + auth + provenance contracts only.
 * No live fetches. No fabricated observations. Only World Bank WDI may be Connected
 * after verified retrieval elsewhere in the foundation.
 */

import type {
  ConnectorHealthState,
  FoundationConnectionStatus,
  FoundationSourceType,
  ProvenanceMetadata,
} from "@/lib/official-connector-foundation/types";
import { plannedHealthSnapshot } from "@/lib/official-connector-foundation/health";

export type ConnectorAuthRequirement =
  | "none_public"
  | "api_key_required"
  | "oauth_required"
  | "registration_required"
  | "unknown";

export type PlannedConnectorAdapter = {
  readonly connectorId: string;
  readonly sourceSlug: string;
  readonly title: string;
  readonly description: string;
  readonly version: string;
  readonly connectionStatus: Extract<FoundationConnectionStatus, "planned" | "missing">;
  readonly health: ConnectorHealthState;
  readonly liveEnabled: false;
  readonly authRequirement: ConnectorAuthRequirement;
  readonly authNotes: string;
  readonly supportedEntities: readonly ("country" | "company" | "university")[];
  readonly officialSourceUrl: string;
  readonly sourceType: FoundationSourceType;
  /** Provenance field contract — values filled only after a future verified live fetch. */
  readonly provenanceFields: readonly (keyof ProvenanceMetadata)[];
  readonly healthMessage: string;
};

const PROVENANCE_FIELDS: readonly (keyof ProvenanceMetadata)[] = [
  "sourceName",
  "sourceType",
  "officialSourceUrl",
  "datasetOrEndpoint",
  "indicatorName",
  "jurisdiction",
  "referencePeriod",
  "retrievedAt",
  "lastCheckedAt",
  "publicationDate",
  "unit",
  "transformationNotes",
  "verificationState",
  "freshnessState",
  "connectorHealth",
] as const;

export const PLANNED_CONNECTOR_ADAPTERS: readonly PlannedConnectorAdapter[] = [
  {
    connectorId: "fconn-un-sdg",
    sourceSlug: "united-nations",
    title: "UN SDG Connector",
    description: "Planned adapter for United Nations Statistics / SDG datasets.",
    version: "0.1.0-phase7",
    connectionStatus: "planned",
    health: "planned",
    liveEnabled: false,
    authRequirement: "none_public",
    authNotes: "Public UN data endpoints expected; no credentials configured in this build.",
    supportedEntities: ["country"],
    officialSourceUrl: "https://unstats.un.org",
    sourceType: "international_org",
    provenanceFields: PROVENANCE_FIELDS,
    healthMessage: "Planned — not live; no fetch performed",
  },
  {
    connectorId: "fconn-oecd-member",
    sourceSlug: "oecd",
    title: "OECD Member Connector",
    description: "Planned adapter for OECD member-economy statistics.",
    version: "0.1.0-phase7",
    connectionStatus: "planned",
    health: "planned",
    liveEnabled: false,
    authRequirement: "none_public",
    authNotes: "OECD SDMX / data portal — public access expected; not verified in this build.",
    supportedEntities: ["country"],
    officialSourceUrl: "https://data.oecd.org",
    sourceType: "international_org",
    provenanceFields: PROVENANCE_FIELDS,
    healthMessage: "Planned — not live; no fetch performed",
  },
  {
    connectorId: "fconn-us-census",
    sourceSlug: "us-census",
    title: "U.S. Census Bureau Connector",
    description: "Planned adapter for U.S. Census Bureau APIs.",
    version: "0.1.0-phase7",
    connectionStatus: "planned",
    health: "planned",
    liveEnabled: false,
    authRequirement: "api_key_required",
    authNotes: "Census API key required for live use — not stored or configured here (no secrets).",
    supportedEntities: ["country"],
    officialSourceUrl: "https://www.census.gov",
    sourceType: "national_statistics",
    provenanceFields: PROVENANCE_FIELDS,
    healthMessage: "Planned — Missing live verification; no fetch performed",
  },
  {
    connectorId: "fconn-us-bea",
    sourceSlug: "us-bea",
    title: "U.S. BEA Connector",
    description: "Planned adapter for U.S. Bureau of Economic Analysis.",
    version: "0.1.0-phase7",
    connectionStatus: "planned",
    health: "planned",
    liveEnabled: false,
    authRequirement: "api_key_required",
    authNotes: "BEA UserID / API key required for live use — not stored here (no secrets).",
    supportedEntities: ["country"],
    officialSourceUrl: "https://www.bea.gov",
    sourceType: "national_statistics",
    provenanceFields: PROVENANCE_FIELDS,
    healthMessage: "Planned — Missing live verification; no fetch performed",
  },
  {
    connectorId: "fconn-imf-data",
    sourceSlug: "imf",
    title: "IMF Data Connector",
    description: "Planned adapter for International Monetary Fund data services.",
    version: "0.1.0-phase7",
    connectionStatus: "planned",
    health: "planned",
    liveEnabled: false,
    authRequirement: "registration_required",
    authNotes: "IMF data access may require registration; no credentials configured (no secrets).",
    supportedEntities: ["country"],
    officialSourceUrl: "https://data.imf.org",
    sourceType: "international_org",
    provenanceFields: PROVENANCE_FIELDS,
    healthMessage: "Planned — Missing live verification; no fetch performed",
  },
] as const;

export function listPlannedConnectorAdapters(): readonly PlannedConnectorAdapter[] {
  return PLANNED_CONNECTOR_ADAPTERS;
}

export function getPlannedConnectorAdapter(connectorId: string): PlannedConnectorAdapter | undefined {
  return PLANNED_CONNECTOR_ADAPTERS.find((a) => a.connectorId === connectorId);
}

/** Planned adapters must never claim live fetch capability. */
export function assertPlannedAdaptersAreNotLive(): void {
  for (const adapter of PLANNED_CONNECTOR_ADAPTERS) {
    if (adapter.liveEnabled !== false) {
      throw new Error(`Planned adapter must not be live: ${adapter.connectorId}`);
    }
    if (adapter.connectionStatus !== "planned" && adapter.connectionStatus !== "missing") {
      throw new Error(`Planned adapter status invalid: ${adapter.connectorId}`);
    }
    if (adapter.health !== "planned") {
      throw new Error(`Planned adapter health must stay planned: ${adapter.connectorId}`);
    }
  }
}

/**
 * Honest refusal — planned connectors do not perform network fetches.
 * Call sites must not invent observations for these adapters.
 */
export function refusePlannedConnectorFetch(connectorId: string): {
  readonly ok: false;
  readonly status: "Planned" | "Missing";
  readonly reason: string;
  readonly health: ReturnType<typeof plannedHealthSnapshot>;
} {
  const adapter = getPlannedConnectorAdapter(connectorId);
  const status = adapter?.connectionStatus === "missing" ? "Missing" : "Planned";
  return {
    ok: false,
    status,
    reason: adapter
      ? `${adapter.title} is ${status} — no live fetch in this build.`
      : `Unknown planned connector ${connectorId} — no live fetch.`,
    health: plannedHealthSnapshot(connectorId),
  };
}
