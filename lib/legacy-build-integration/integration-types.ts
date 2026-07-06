/**
 * CBAI Legacy Build Integration — platform read model types.
 * Reads BUILD-021–061 intelligence foundations without modifying them.
 */

export const LEGACY_BUILD_INTEGRATION_VERSION = "1.0.0" as const;

export type LegacyBuildRange = {
  from: string;
  to: string;
  label: string;
};

export type LegacySessionRegistrySummary = {
  total: number;
  active: number;
  completed: number;
  failed: number;
  statusLabel: string;
};

export type LegacyWorkerSummary = {
  workerState: string;
  processedItems: number;
  lastTick: string | null;
  statusLabel: string;
};

export type LegacyObservabilitySummary = {
  version: string;
  health: string;
  warningsCount: number;
  blockingIssuesCount: number;
  recommendedNextAction: string;
};

export type LegacyPolicyRuleSummary = {
  ruleId: string;
  label: string;
};

export type LegacyPolicySummary = {
  engineVersion: string;
  ruleCount: number;
  rules: readonly LegacyPolicyRuleSummary[];
  recentDecisions: readonly string[];
  statusLabel: string;
};

export type LegacyTestHarnessSummary = {
  harnessVersion: string;
  scenarioCount: number;
  statusLabel: string;
  executionLabel: string;
};

export type LegacyAgentTaskStoreSummary = {
  total: number;
  active: number;
  completed: number;
  failed: number;
  statusLabel: string;
};

export type LegacyLocalAdapterSummary = {
  available: boolean;
  statusLabel: string;
  description: string;
};

export type LegacyDiagnosticsPosture = {
  builderVersion: string;
  graphStatus: string;
  memoryStatus: string;
  documentStatus: string;
  runActivityLabel: string;
};

export type LegacyBuildIntegrationModel = {
  version: typeof LEGACY_BUILD_INTEGRATION_VERSION;
  buildRange: LegacyBuildRange;
  collectedAt: string;
  hasRuntimeActivity: boolean;
  observability: LegacyObservabilitySummary;
  sessionRegistry: LegacySessionRegistrySummary;
  worker: LegacyWorkerSummary;
  agentTaskStore: LegacyAgentTaskStoreSummary;
  localAdapter: LegacyLocalAdapterSummary;
  policy: LegacyPolicySummary;
  testHarness: LegacyTestHarnessSummary;
  diagnostics: LegacyDiagnosticsPosture;
};
