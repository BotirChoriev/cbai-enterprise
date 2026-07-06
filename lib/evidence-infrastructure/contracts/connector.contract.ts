import type { ConnectorContract } from "@/lib/evidence-infrastructure/types";

export type { ConnectorContract };

/** Required connector surface — metadata, health, version, supportedEntities, supportedIndicators. */
export const CONNECTOR_CONTRACT_REQUIRED_KEYS = [
  "metadata",
  "health",
  "version",
  "supportedEntities",
  "supportedIndicators",
  "schemaVersion",
] as const satisfies readonly (keyof ConnectorContract)[];

/**
 * Connector contract documentation.
 * Future connectors implement runtime behavior; this module defines the shape only.
 */
export const CONNECTOR_CONTRACT_SPEC = {
  metadata: "Connector identity, source binding, maintainer, documentation URL",
  health: "Status snapshot — unknown until runtime monitoring exists",
  version: "Connector semver independent of infrastructure version",
  supportedEntities: "Entity types this connector can supply evidence for",
  supportedIndicators: "Indicator slugs from lib/indicator-framework",
  schemaVersion: "Evidence schema version emitted by adapter chain",
} as const;
