export const DECISION_INTELLIGENCE_VERSION = "1.0.0" as const;

export type DecisionIntelligenceVersionInfo = {
  foundationVersion: typeof DECISION_INTELLIGENCE_VERSION;
  decisionRecordVersion: "1.0.0";
  schema: "cbai-decision-intelligence-v1";
  recommendationSupport: "none";
  predictionSupport: "none";
  humanReviewRequired: true;
};

export const DECISION_INTELLIGENCE_VERSION_INFO: DecisionIntelligenceVersionInfo = {
  foundationVersion: DECISION_INTELLIGENCE_VERSION,
  decisionRecordVersion: "1.0.0",
  schema: "cbai-decision-intelligence-v1",
  recommendationSupport: "none",
  predictionSupport: "none",
  humanReviewRequired: true,
};

export type DecisionMigrationEntry = {
  fromVersion: string;
  toVersion: string;
  description: string;
  breaking: boolean;
};

/** Future migration manifest — no migrations executed in v1. */
export const DECISION_MIGRATION_MANIFEST: readonly DecisionMigrationEntry[] = [
  {
    fromVersion: "1.0.0",
    toVersion: "1.1.0",
    description: "Reserved — runtime evidence binding and review workflow integration.",
    breaking: false,
  },
];

/** Declarative review lifecycle stages — foundation only in v1. */
export const DECISION_REVIEW_STAGES = [
  "context-built",
  "evidence-mapped",
  "readiness-assessed",
  "human-review-pending",
  "human-reviewed",
  "archived",
] as const;

export type DecisionReviewStage = (typeof DECISION_REVIEW_STAGES)[number];
