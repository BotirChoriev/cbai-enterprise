export const INDICATOR_EXPLORER_VERSION = "1.0.0" as const;

export type IndicatorExplorerVersionInfo = {
  explorerVersion: typeof INDICATOR_EXPLORER_VERSION;
  explorerRecordVersion: "1.0.0";
  schema: "cbai-indicator-explorer-v1";
  analyticsSupport: "none";
  scoringSupport: "none";
  humanReviewRequired: true;
};

export const INDICATOR_EXPLORER_VERSION_INFO: IndicatorExplorerVersionInfo = {
  explorerVersion: INDICATOR_EXPLORER_VERSION,
  explorerRecordVersion: "1.0.0",
  schema: "cbai-indicator-explorer-v1",
  analyticsSupport: "none",
  scoringSupport: "none",
  humanReviewRequired: true,
};

export type IndicatorExplorerMigrationEntry = {
  fromVersion: string;
  toVersion: string;
  description: string;
  breaking: boolean;
};

export const INDICATOR_EXPLORER_MIGRATION_MANIFEST: readonly IndicatorExplorerMigrationEntry[] =
  [
    {
      fromVersion: "1.0.0",
      toVersion: "1.1.0",
      description: "Reserved — live evidence binding and per-entity coverage overlays.",
      breaking: false,
    },
  ];
