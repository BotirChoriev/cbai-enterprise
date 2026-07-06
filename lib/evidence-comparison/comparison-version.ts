export const EVIDENCE_COMPARISON_FOUNDATION_VERSION = "1.0.0" as const;

export type EvidenceComparisonFoundationVersionInfo = {
  foundationVersion: typeof EVIDENCE_COMPARISON_FOUNDATION_VERSION;
  comparisonRecordVersion: "1.0.0";
  schema: "cbai-evidence-comparison-v1";
  scoringSupport: "none";
  rankingSupport: "none";
  crossEntityTypeSupport: false;
  humanReviewRequired: true;
};

export const EVIDENCE_COMPARISON_FOUNDATION_VERSION_INFO: EvidenceComparisonFoundationVersionInfo =
  {
    foundationVersion: EVIDENCE_COMPARISON_FOUNDATION_VERSION,
    comparisonRecordVersion: "1.0.0",
    schema: "cbai-evidence-comparison-v1",
    scoringSupport: "none",
    rankingSupport: "none",
    crossEntityTypeSupport: false,
    humanReviewRequired: true,
  };

export type ComparisonMigrationEntry = {
  fromVersion: string;
  toVersion: string;
  description: string;
  breaking: boolean;
};

export const COMPARISON_MIGRATION_MANIFEST: readonly ComparisonMigrationEntry[] = [
  {
    fromVersion: "1.0.0",
    toVersion: "1.1.0",
    description: "Reserved — per-entity evidence binding and cross-type scoping.",
    breaking: false,
  },
];
