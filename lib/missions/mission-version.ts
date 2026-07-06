export const MISSION_CATALOG_VERSION = "1.0.0" as const;

export type MissionCatalogVersionInfo = {
  catalogVersion: typeof MISSION_CATALOG_VERSION;
  missionRecordVersion: "1.0.0";
  schema: "cbai-mission-catalog-v1";
  executionSupport: "none";
};

export const MISSION_CATALOG_VERSION_INFO: MissionCatalogVersionInfo = {
  catalogVersion: MISSION_CATALOG_VERSION,
  missionRecordVersion: "1.0.0",
  schema: "cbai-mission-catalog-v1",
  executionSupport: "none",
};

/** Future migration manifest — no migrations executed in v1. */
export type MissionMigrationEntry = {
  fromVersion: string;
  toVersion: string;
  description: string;
  breaking: boolean;
};

export const MISSION_MIGRATION_MANIFEST: readonly MissionMigrationEntry[] = [
  {
    fromVersion: "1.0.0",
    toVersion: "1.1.0",
    description: "Reserved — mission execution binding and readiness gates.",
    breaking: false,
  },
];

/** Declarative mission lifecycle stages — catalog only in v1. */
export const MISSION_LIFECYCLE_STAGES = [
  "defined",
  "validated",
  "readiness-checked",
  "executable",
  "running",
  "completed",
  "archived",
] as const;

export type MissionLifecycleStage = (typeof MISSION_LIFECYCLE_STAGES)[number];
