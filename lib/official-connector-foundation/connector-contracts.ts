/**
 * Foundation connector contracts.
 * Only World Bank WDI may become liveEnabled at runtime after verified retrieval.
 */

import type { ConnectorContract } from "@/lib/official-connector-foundation/types";
import { getWorldBankRuntimeStatus } from "@/lib/official-connector-foundation/runtime-status";

const STATIC_CONTRACTS: readonly ConnectorContract[] = [
  {
    connectorId: "fconn-world-bank-wdi",
    sourceSlug: "world-bank",
    title: "World Bank WDI Connector",
    description: "World Development Indicators — first live foundation connector.",
    version: "1.0.0",
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
      message: "Awaiting verified WDI retrieval",
    },
  },
  {
    connectorId: "fconn-un-sdg",
    sourceSlug: "united-nations",
    title: "UN SDG Connector (planned)",
    description: "Contract only — not live.",
    version: "0.1.0-phase1",
    supportedEntities: ["country"],
    supportedIndicatorCodes: [],
    liveEnabled: false,
    health: {
      state: "planned",
      lastCheckedAt: null,
      message: "Planned — not live",
    },
  },
  {
    connectorId: "fconn-oecd-member",
    sourceSlug: "oecd",
    title: "OECD Member Connector (planned)",
    description: "Contract only — not live.",
    version: "0.1.0-phase1",
    supportedEntities: ["country"],
    supportedIndicatorCodes: [],
    liveEnabled: false,
    health: {
      state: "planned",
      lastCheckedAt: null,
      message: "Planned — not live",
    },
  },
  {
    connectorId: "fconn-us-census",
    sourceSlug: "us-census",
    title: "U.S. Census Bureau Connector (planned)",
    description: "Contract only — Planned until verified live retrieval. Auth: API key required.",
    version: "0.1.0-phase7",
    supportedEntities: ["country"],
    supportedIndicatorCodes: [],
    liveEnabled: false,
    health: {
      state: "planned",
      lastCheckedAt: null,
      message: "Planned — Missing live verification",
    },
  },
  {
    connectorId: "fconn-us-bea",
    sourceSlug: "us-bea",
    title: "U.S. BEA Connector (planned)",
    description: "Contract only — Planned until verified live retrieval. Auth: API key required.",
    version: "0.1.0-phase7",
    supportedEntities: ["country"],
    supportedIndicatorCodes: [],
    liveEnabled: false,
    health: {
      state: "planned",
      lastCheckedAt: null,
      message: "Planned — Missing live verification",
    },
  },
  {
    connectorId: "fconn-imf-data",
    sourceSlug: "imf",
    title: "IMF Data Connector (planned)",
    description: "Contract only — Planned until verified live retrieval. Auth: registration may be required.",
    version: "0.1.0-phase7",
    supportedEntities: ["country"],
    supportedIndicatorCodes: [],
    liveEnabled: false,
    health: {
      state: "planned",
      lastCheckedAt: null,
      message: "Planned — Missing live verification",
    },
  },
  {
    connectorId: "fconn-us-bls",
    sourceSlug: "us-bls",
    title: "U.S. BLS Connector (planned)",
    description: "Contract only — not live in this build.",
    version: "0.1.0-phase1",
    supportedEntities: ["country"],
    supportedIndicatorCodes: ["LNS14000000"],
    liveEnabled: false,
    health: {
      state: "planned",
      lastCheckedAt: null,
      message: "Planned — not live",
    },
  },
  {
    connectorId: "fconn-us-sec",
    sourceSlug: "us-sec",
    title: "U.S. SEC Connector (planned)",
    description: "Contract only — not live in this build.",
    version: "0.1.0-phase1",
    supportedEntities: ["company"],
    supportedIndicatorCodes: ["sec-ticker"],
    liveEnabled: false,
    health: {
      state: "planned",
      lastCheckedAt: null,
      message: "Planned — not live",
    },
  },
] as const;

export function getFoundationConnectorContracts(): readonly ConnectorContract[] {
  const wb = getWorldBankRuntimeStatus();
  return STATIC_CONTRACTS.map((contract) => {
    if (contract.connectorId !== "fconn-world-bank-wdi") return contract;
    return {
      ...contract,
      liveEnabled: wb.liveEnabled,
      health: {
        state: wb.health,
        lastCheckedAt: wb.lastCheckedAt,
        message: wb.message,
      },
    };
  });
}

/** @deprecated Prefer getFoundationConnectorContracts() for runtime-aware status. */
export const FOUNDATION_CONNECTOR_CONTRACTS = STATIC_CONTRACTS;

export function getFoundationConnectorById(connectorId: string): ConnectorContract | undefined {
  return getFoundationConnectorContracts().find((c) => c.connectorId === connectorId);
}

/** Unrelated connectors must remain non-live. World Bank may be live after verified retrieval. */
export function assertUnrelatedConnectorsRemainPlanned(): void {
  for (const connector of getFoundationConnectorContracts()) {
    if (connector.connectorId === "fconn-world-bank-wdi") continue;
    if (connector.liveEnabled !== false) {
      throw new Error(`Unrelated connector must stay planned: ${connector.connectorId}`);
    }
  }
}

/** @deprecated Use assertUnrelatedConnectorsRemainPlanned */
export function assertNoLiveConnectors(): void {
  assertUnrelatedConnectorsRemainPlanned();
}
