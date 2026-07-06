export const EVIDENCE_GAP_FOUNDATION_VERSION = "1.0.0" as const;

export type EvidenceGapFoundationVersionInfo = {
  foundationVersion: typeof EVIDENCE_GAP_FOUNDATION_VERSION;
  gapRecordVersion: "1.0.0";
  schema: "cbai-evidence-gap-v1";
  analyticsSupport: "none";
  predictionSupport: "none";
  humanReviewRequired: true;
};

export const EVIDENCE_GAP_FOUNDATION_VERSION_INFO: EvidenceGapFoundationVersionInfo = {
  foundationVersion: EVIDENCE_GAP_FOUNDATION_VERSION,
  gapRecordVersion: "1.0.0",
  schema: "cbai-evidence-gap-v1",
  analyticsSupport: "none",
  predictionSupport: "none",
  humanReviewRequired: true,
};

export type EvidenceGapMigrationEntry = {
  fromVersion: string;
  toVersion: string;
  description: string;
  breaking: boolean;
};

export const EVIDENCE_GAP_MIGRATION_MANIFEST: readonly EvidenceGapMigrationEntry[] = [
  {
    fromVersion: "1.0.0",
    toVersion: "1.1.0",
    description: "Reserved — live connector binding and verification workflow integration.",
    breaking: false,
  },
];
