import type {
  IntelligenceTestOutcome,
  IntelligenceTestReport,
  IntelligenceTestScenarioReport,
  IntelligenceTestValidationContext,
  IntelligenceTestValidationResult,
} from "@/lib/intelligence/testing/types";
import type { IntelligenceResult } from "@/lib/intelligence/result.types";

/**
 * Extract blocking issue messages from diagnostics.
 */
export function extractBlockingIssues(result: IntelligenceResult | null): string[] {
  if (!result?.diagnostics) {
    return [];
  }

  return result.diagnostics.issues
    .filter((issue) => issue.severity === "blocking")
    .map((issue) => issue.message);
}

/**
 * Build a structured scenario report from execution output.
 */
export function buildScenarioReport(input: {
  scenarioId: string;
  scenarioName: string;
  validation: IntelligenceTestValidationResult;
  context: IntelligenceTestValidationContext;
  durationMs: number;
}): IntelligenceTestScenarioReport {
  const result = input.context.result;

  return {
    scenarioId: input.scenarioId,
    scenarioName: input.scenarioName,
    outcome: input.validation.pass ? "pass" : "fail",
    evidenceCount: result?.evidence.items.length ?? 0,
    confidenceBand: result?.confidence.band ?? "unknown",
    trustLevel: result?.trust.trustLevel ?? "unknown",
    diagnosticsHealth: result?.diagnostics?.runHealth ?? "unknown",
    warnings: result?.warnings ?? [],
    blockingIssues: extractBlockingIssues(result),
    failures: input.validation.failures,
    error: input.context.error,
    durationMs: input.durationMs,
  };
}

/**
 * Aggregate scenario reports into a harness run report.
 */
export function buildIntelligenceTestReport(input: {
  harnessVersion: string;
  startedAt: string;
  completedAt: string;
  scenarios: IntelligenceTestScenarioReport[];
}): IntelligenceTestReport {
  const passCount = input.scenarios.filter((scenario) => scenario.outcome === "pass").length;
  const failCount = input.scenarios.length - passCount;
  const startedMs = Date.parse(input.startedAt);
  const completedMs = Date.parse(input.completedAt);
  const totalDurationMs =
    Number.isFinite(startedMs) && Number.isFinite(completedMs)
      ? Math.max(0, completedMs - startedMs)
      : 0;

  return {
    harnessVersion: input.harnessVersion,
    startedAt: input.startedAt,
    completedAt: input.completedAt,
    totalDurationMs,
    scenarioCount: input.scenarios.length,
    passCount,
    failCount,
    scenarios: input.scenarios,
    outcome: failCount === 0 ? "pass" : "fail",
  };
}

/**
 * Format a concise textual summary of a harness report for logging.
 */
export function formatIntelligenceTestReportSummary(
  report: IntelligenceTestReport,
): string {
  const lines = [
    `Intelligence Test Harness ${report.harnessVersion}`,
    `Outcome: ${report.outcome.toUpperCase()} (${report.passCount}/${report.scenarioCount} passed)`,
    `Duration: ${report.totalDurationMs}ms`,
    "",
    ...report.scenarios.map(
      (scenario) =>
        `[${scenario.outcome.toUpperCase()}] ${scenario.scenarioId} — evidence=${scenario.evidenceCount}, confidence=${scenario.confidenceBand}, trust=${scenario.trustLevel}, diagnostics=${scenario.diagnosticsHealth}`,
    ),
  ];

  return lines.join("\n");
}

/**
 * Resolve overall outcome from pass/fail counts.
 */
export function resolveTestOutcome(passCount: number, failCount: number): IntelligenceTestOutcome {
  return failCount === 0 ? "pass" : "fail";
}
