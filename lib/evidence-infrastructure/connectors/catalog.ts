import type { ConnectorContract } from "@/lib/evidence-infrastructure/types";

/** Creates a declarative connector contract — health unknown until future runtime. */
function defineConnector(
  input: Omit<ConnectorContract, "health"> & {
    health?: Partial<ConnectorContract["health"]>;
  },
): ConnectorContract {
  return {
    ...input,
    health: {
      status: "unknown",
      lastCheckedAt: null,
      message: "Connector not implemented — architecture definition only",
      ...input.health,
    },
  };
}

/**
 * Connector catalog — declarative contracts for future official source connectors.
 * No HTTP, fetch, or credentials.
 */
export const CONNECTOR_CATALOG: readonly ConnectorContract[] = [
  defineConnector({
    metadata: {
      connectorId: "conn-cbai-local-registry",
      sourceSlug: "cbai-local-registry",
      title: "CBAI Local Registry Connector",
      description: "Reads on-platform entity catalogs — only connected connector today.",
      maintainer: "CBAI Platform",
    },
    version: "1.0.0",
    supportedEntities: ["country", "company", "university"],
    supportedIndicators: [
      "industry-classification",
      "education-enrollment-statistics",
      "research-output-disclosure",
    ],
    schemaVersion: "v1",
    health: {
      status: "healthy",
      lastCheckedAt: null,
      message: "Local registry — no external network required",
    },
  }),
  defineConnector({
    metadata: {
      connectorId: "conn-world-bank-wdi",
      sourceSlug: "world-bank",
      title: "World Bank WDI Connector",
      description: "Future connector for World Development Indicators — planned only.",
      maintainer: "CBAI Platform",
      documentationUrl: "https://datahelpdesk.worldbank.org/",
    },
    version: "0.0.0-planned",
    supportedEntities: ["country"],
    supportedIndicators: ["national-accounts", "energy-mix-disclosure"],
    schemaVersion: "v1",
  }),
  defineConnector({
    metadata: {
      connectorId: "conn-un-data",
      sourceSlug: "united-nations",
      title: "UN Data Connector",
      description: "Future connector for UN statistical and treaty datasets — planned only.",
      maintainer: "CBAI Platform",
      documentationUrl: "https://data.un.org/",
    },
    version: "0.0.0-planned",
    supportedEntities: ["country", "government", "institution"],
    supportedIndicators: [
      "institutional-framework",
      "human-rights-treaty-reporting",
      "trade-flow-disclosure",
      "ndc-submission",
    ],
    schemaVersion: "v1",
  }),
  defineConnector({
    metadata: {
      connectorId: "conn-ocds-procurement",
      sourceSlug: "open-contracting-partnership",
      title: "OCDS Procurement Connector",
      description: "Future connector for Open Contracting Data Standard feeds — planned only.",
      maintainer: "CBAI Platform",
      documentationUrl: "https://standard.open-contracting.org/",
    },
    version: "0.0.0-planned",
    supportedEntities: ["country", "government", "institution"],
    supportedIndicators: ["procurement-disclosure-coverage"],
    schemaVersion: "v1",
  }),
  defineConnector({
    metadata: {
      connectorId: "conn-unesco-uis",
      sourceSlug: "unesco",
      title: "UNESCO UIS Connector",
      description: "Future connector for UNESCO Institute for Statistics — planned only.",
      maintainer: "CBAI Platform",
      documentationUrl: "http://uis.unesco.org/",
    },
    version: "0.0.0-planned",
    supportedEntities: ["country", "university", "institution"],
    supportedIndicators: [
      "education-enrollment-statistics",
      "research-output-disclosure",
    ],
    schemaVersion: "v1",
  }),
] as const;

export function getConnectorById(
  connectorId: string,
): ConnectorContract | undefined {
  return CONNECTOR_CATALOG.find((c) => c.metadata.connectorId === connectorId);
}

export function getConnectorsBySourceSlug(
  sourceSlug: string,
): ConnectorContract[] {
  return CONNECTOR_CATALOG.filter((c) => c.metadata.sourceSlug === sourceSlug);
}
