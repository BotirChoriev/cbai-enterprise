export const REGISTRY_VERSION = "1.0.0" as const;

export type RegistryVersionInfo = {
  registryVersion: typeof REGISTRY_VERSION;
  entityRecordVersion: "1.0.0";
  schema: "cbai-global-registry-v1";
  migrationSupport: "declarative";
};

export const REGISTRY_VERSION_INFO: RegistryVersionInfo = {
  registryVersion: REGISTRY_VERSION,
  entityRecordVersion: "1.0.0",
  schema: "cbai-global-registry-v1",
  migrationSupport: "declarative",
};

/** Future migration manifest entry shape — no migrations executed in v1. */
export type RegistryMigrationEntry = {
  fromVersion: string;
  toVersion: string;
  description: string;
  breaking: boolean;
};

export const REGISTRY_MIGRATION_MANIFEST: readonly RegistryMigrationEntry[] = [
  {
    fromVersion: "1.0.0",
    toVersion: "1.1.0",
    description: "Reserved — future entity types (government, organization, institution).",
    breaking: false,
  },
];
