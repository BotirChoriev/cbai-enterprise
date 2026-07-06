export const CONNECTOR_REGISTRY_VERSION = "1.0.0" as const;

export type ConnectorRegistryVersionInfo = {
  registryVersion: typeof CONNECTOR_REGISTRY_VERSION;
  connectorRecordVersion: "1.0.0";
  schema: "cbai-official-evidence-connector-v1";
  implementationSupport: "none";
};

export const CONNECTOR_REGISTRY_VERSION_INFO: ConnectorRegistryVersionInfo = {
  registryVersion: CONNECTOR_REGISTRY_VERSION,
  connectorRecordVersion: "1.0.0",
  schema: "cbai-official-evidence-connector-v1",
  implementationSupport: "none",
};

/** Future migration manifest — no migrations executed in v1. */
export type ConnectorMigrationEntry = {
  fromVersion: string;
  toVersion: string;
  description: string;
  breaking: boolean;
};

export const CONNECTOR_MIGRATION_MANIFEST: readonly ConnectorMigrationEntry[] = [
  {
    fromVersion: "1.0.0",
    toVersion: "1.1.0",
    description: "Reserved — secure credential vault binding and health probes.",
    breaking: false,
  },
  {
    fromVersion: "1.1.0",
    toVersion: "2.0.0",
    description: "Reserved — live API client interfaces and adapter pipelines.",
    breaking: true,
  },
];

/** Declarative connector lifecycle stages — architecture only in v1. */
export const CONNECTOR_LIFECYCLE_STAGES = [
  "defined",
  "validated",
  "readiness-checked",
  "credential-provisioned",
  "implementable",
  "active",
  "maintenance",
  "deprecated",
  "archived",
] as const;

export type ConnectorLifecycleStage = (typeof CONNECTOR_LIFECYCLE_STAGES)[number];
