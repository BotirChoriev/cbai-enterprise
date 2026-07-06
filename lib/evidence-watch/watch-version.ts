export const EVIDENCE_WATCH_FOUNDATION_VERSION = "1.0.0" as const;

/** Static registry snapshot timestamp — not live monitoring or fabricated event times. */
export const EVIDENCE_WATCH_REGISTRY_SNAPSHOT_AT = "2026-07-01T00:00:00.000Z" as const;

export type EvidenceWatchFoundationVersionInfo = {
  foundationVersion: typeof EVIDENCE_WATCH_FOUNDATION_VERSION;
  watchRecordVersion: "1.0.0";
  schema: "cbai-evidence-watch-v1";
  notificationSupport: "none";
  predictionSupport: "none";
  humanReviewRequired: true;
  registrySnapshotAt: typeof EVIDENCE_WATCH_REGISTRY_SNAPSHOT_AT;
};

export const EVIDENCE_WATCH_FOUNDATION_VERSION_INFO: EvidenceWatchFoundationVersionInfo = {
  foundationVersion: EVIDENCE_WATCH_FOUNDATION_VERSION,
  watchRecordVersion: "1.0.0",
  schema: "cbai-evidence-watch-v1",
  notificationSupport: "none",
  predictionSupport: "none",
  humanReviewRequired: true,
  registrySnapshotAt: EVIDENCE_WATCH_REGISTRY_SNAPSHOT_AT,
};

export type EvidenceWatchMigrationEntry = {
  fromVersion: string;
  toVersion: string;
  description: string;
  breaking: boolean;
};

export const EVIDENCE_WATCH_MIGRATION_MANIFEST: readonly EvidenceWatchMigrationEntry[] = [
  {
    fromVersion: "1.0.0",
    toVersion: "1.1.0",
    description: "Reserved — live connector diff ingestion and notification routing.",
    breaking: false,
  },
] as const;
