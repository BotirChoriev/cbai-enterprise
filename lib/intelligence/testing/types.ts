import type { ConfidenceBand } from "@/lib/intelligence/confidence.types";
import type { RunHealth } from "@/lib/intelligence/diagnostics/types";
import type { IntelligenceRequest } from "@/lib/intelligence/request.types";
import type { IntelligenceResult } from "@/lib/intelligence/result.types";
import type { TrustLevel } from "@/lib/intelligence/trust.types";

/** Outcome of a single scenario validation. */
export type IntelligenceTestOutcome = "pass" | "fail";

/**
 * Context passed to scenario validators after a pipeline run.
 */
export interface IntelligenceTestValidationContext {
  request: IntelligenceRequest;
  result: IntelligenceResult | null;
  error?: string;
}

/**
 * Deterministic validator for a test scenario — structural checks only.
 */
export type IntelligenceTestValidator = (
  context: IntelligenceTestValidationContext,
) => IntelligenceTestValidationResult;

/**
 * Result of running a scenario validator.
 */
export interface IntelligenceTestValidationResult {
  pass: boolean;
  failures: string[];
}

/**
 * Definition of a deterministic intelligence engine test scenario.
 */
export interface IntelligenceTestScenario {
  /** Stable scenario identifier. */
  id: string;
  /** Short human-readable scenario name. */
  name: string;
  /** Scenario purpose and scope. */
  description: string;
  /** Build the intelligence request for this scenario. */
  buildRequest: () => IntelligenceRequest;
  /** Validate pipeline output against expected structural signals. */
  validate?: IntelligenceTestValidator;
  /** Async validator — used when validation requires await (e.g. execution pipeline). */
  validateAsync?: (
    context: IntelligenceTestValidationContext,
  ) => Promise<IntelligenceTestValidationResult>;
}

/**
 * Structured report for a single scenario execution.
 */
export interface IntelligenceTestScenarioReport {
  scenarioId: string;
  scenarioName: string;
  outcome: IntelligenceTestOutcome;
  evidenceCount: number;
  confidenceBand: ConfidenceBand | "unknown";
  trustLevel: TrustLevel | "unknown";
  diagnosticsHealth: RunHealth | "unknown";
  warnings: string[];
  blockingIssues: string[];
  failures: string[];
  error?: string;
  durationMs: number;
}

/**
 * Aggregated report from a harness run.
 */
export interface IntelligenceTestReport {
  /** Harness semantic version. */
  harnessVersion: string;
  /** ISO-8601 timestamp when the run started. */
  startedAt: string;
  /** ISO-8601 timestamp when the run completed. */
  completedAt: string;
  /** Total wall-clock duration in milliseconds. */
  totalDurationMs: number;
  /** Number of scenarios executed. */
  scenarioCount: number;
  /** Number of scenarios that passed validation. */
  passCount: number;
  /** Number of scenarios that failed validation. */
  failCount: number;
  /** Per-scenario reports in deterministic order. */
  scenarios: IntelligenceTestScenarioReport[];
  /** Overall outcome — pass only when all scenarios pass. */
  outcome: IntelligenceTestOutcome;
}
