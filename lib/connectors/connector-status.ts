/**
 * CBAI Official Evidence Connector Architecture — lifecycle status.
 * Declarative only — no health probes or network checks.
 */

export const CONNECTOR_STATUSES = [
  "planned",
  "ready",
  "connected",
  "maintenance",
  "deprecated",
] as const;

export type ConnectorStatus = (typeof CONNECTOR_STATUSES)[number];

export type ConnectorStatusDefinition = {
  status: ConnectorStatus;
  label: string;
  description: string;
  allowsFutureImplementation: boolean;
};

export const CONNECTOR_STATUS_DEFINITIONS: readonly ConnectorStatusDefinition[] = [
  {
    status: "planned",
    label: "Planned",
    description: "Connector defined; implementation not started.",
    allowsFutureImplementation: true,
  },
  {
    status: "ready",
    label: "Ready",
    description: "Contract validated; awaiting secure credential provisioning.",
    allowsFutureImplementation: true,
  },
  {
    status: "connected",
    label: "Connected",
    description: "Implementation active — local registry only in v1 architecture.",
    allowsFutureImplementation: true,
  },
  {
    status: "maintenance",
    label: "Maintenance",
    description: "Temporarily unavailable; definition retained for audit.",
    allowsFutureImplementation: false,
  },
  {
    status: "deprecated",
    label: "Deprecated",
    description: "Superseded; retained for migration and audit history.",
    allowsFutureImplementation: false,
  },
] as const;

const STATUS_SET = new Set<string>(CONNECTOR_STATUSES);

export function isConnectorStatus(value: string): value is ConnectorStatus {
  return STATUS_SET.has(value);
}

/** Statuses eligible for future HTTP/API implementation binding. */
export function isImplementableStatus(status: ConnectorStatus): boolean {
  const definition = CONNECTOR_STATUS_DEFINITIONS.find((entry) => entry.status === status);
  return definition?.allowsFutureImplementation ?? false;
}
