/**
 * CBAI Official Evidence Connector Architecture — capability vocabulary.
 * Declarative only — no runtime implementation.
 */

/** Data surfaces a connector may expose when implemented. */
export const CONNECTOR_CAPABILITIES = [
  "registry",
  "indicators",
  "evidence",
  "datasets",
  "reports",
  "timeline",
] as const;

export type ConnectorCapability = (typeof CONNECTOR_CAPABILITIES)[number];

export type ConnectorCapabilityDefinition = {
  id: ConnectorCapability;
  label: string;
  description: string;
};

export const CONNECTOR_CAPABILITY_DEFINITIONS: readonly ConnectorCapabilityDefinition[] = [
  {
    id: "registry",
    label: "Registry",
    description: "Entity registry lookups and cross-reference resolution.",
  },
  {
    id: "indicators",
    label: "Indicators",
    description: "Global Indicator Framework indicator value slots.",
  },
  {
    id: "evidence",
    label: "Evidence",
    description: "Verified evidence records tied to indicator requirements.",
  },
  {
    id: "datasets",
    label: "Datasets",
    description: "Structured official datasets with provenance metadata.",
  },
  {
    id: "reports",
    label: "Reports",
    description: "Official publications and periodic reporting outputs.",
  },
  {
    id: "timeline",
    label: "Timeline",
    description: "Time-series and historical revision tracking.",
  },
] as const;

const CAPABILITY_SET = new Set<string>(CONNECTOR_CAPABILITIES);

export function isConnectorCapability(value: string): value is ConnectorCapability {
  return CAPABILITY_SET.has(value);
}

/** Minimum capabilities required for a connector to be considered well-formed. */
export const REQUIRED_CONNECTOR_CAPABILITIES: readonly ConnectorCapability[] = [
  "evidence",
] as const;
