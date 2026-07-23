/**
 * Phase 1 connector contracts — liveEnabled is always false.
 */

import type { ConnectorContract } from "@/lib/official-connector-foundation/types";

export const FOUNDATION_CONNECTOR_CONTRACTS: readonly ConnectorContract[] = [
  {
    connectorId: "fconn-world-bank-wdi",
    sourceSlug: "world-bank",
    title: "World Bank WDI Connector (Phase 1 contract)",
    description: "Contract for future WDI retrieval — not live in Phase 1.",
    version: "0.1.0-phase1",
    supportedEntities: ["country"],
    supportedIndicatorCodes: [
      "NY.GDP.MKTP.CD",
      "SP.POP.TOTL",
      "FP.CPI.TOTL.ZG",
      "SL.UEM.TOTL.ZS",
    ],
    liveEnabled: false,
    health: {
      state: "planned",
      lastCheckedAt: null,
      message: "Phase 1 — connector contract only; not live",
    },
  },
  {
    connectorId: "fconn-un-sdg",
    sourceSlug: "united-nations",
    title: "UN SDG Connector (Phase 1 contract)",
    description: "Contract for future UN SDG retrieval — not live in Phase 1.",
    version: "0.1.0-phase1",
    supportedEntities: ["country"],
    supportedIndicatorCodes: [],
    liveEnabled: false,
    health: {
      state: "planned",
      lastCheckedAt: null,
      message: "Phase 1 — connector contract only; not live",
    },
  },
  {
    connectorId: "fconn-oecd-member",
    sourceSlug: "oecd",
    title: "OECD Member Connector (Phase 1 contract)",
    description: "Contract for member-country OECD datasets — not live in Phase 1.",
    version: "0.1.0-phase1",
    supportedEntities: ["country"],
    supportedIndicatorCodes: [],
    liveEnabled: false,
    health: {
      state: "planned",
      lastCheckedAt: null,
      message: "Phase 1 — connector contract only; not live",
    },
  },
  {
    connectorId: "fconn-us-bls",
    sourceSlug: "us-bls",
    title: "U.S. BLS Connector (Phase 1 contract)",
    description: "Contract for BLS publicAPI — not live in Phase 1.",
    version: "0.1.0-phase1",
    supportedEntities: ["country"],
    supportedIndicatorCodes: ["LNS14000000"],
    liveEnabled: false,
    health: {
      state: "planned",
      lastCheckedAt: null,
      message: "Phase 1 — connector contract only; not live",
    },
  },
  {
    connectorId: "fconn-us-sec",
    sourceSlug: "us-sec",
    title: "U.S. SEC Connector (Phase 1 contract)",
    description: "Contract for SEC public disclosures — not live in Phase 1.",
    version: "0.1.0-phase1",
    supportedEntities: ["company"],
    supportedIndicatorCodes: ["sec-ticker"],
    liveEnabled: false,
    health: {
      state: "planned",
      lastCheckedAt: null,
      message: "Phase 1 — connector contract only; not live",
    },
  },
] as const;

export function getFoundationConnectorById(connectorId: string): ConnectorContract | undefined {
  return FOUNDATION_CONNECTOR_CONTRACTS.find((c) => c.connectorId === connectorId);
}

export function assertNoLiveConnectors(): void {
  for (const connector of FOUNDATION_CONNECTOR_CONTRACTS) {
    if (connector.liveEnabled !== false) {
      throw new Error(`Phase 1 violation: ${connector.connectorId} must not be live`);
    }
  }
}
