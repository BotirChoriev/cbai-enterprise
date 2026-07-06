import type { IntelligenceEngine } from "@/lib/intelligence/engine.types";
import { defaultIntelligenceEngine } from "@/lib/intelligence/engine/engine";
import {
  INTELLIGENCE_TEST_SCENARIOS,
  resetTestRequestSequence,
} from "@/lib/intelligence/testing/test-scenarios";
import {
  buildIntelligenceTestReport,
  buildScenarioReport,
  formatIntelligenceTestReportSummary,
} from "@/lib/intelligence/testing/test-reporter";
import type {
  IntelligenceTestReport,
  IntelligenceTestScenario,
  IntelligenceTestScenarioReport,
} from "@/lib/intelligence/testing/types";

/** Semantic version of the intelligence test harness. */
export const INTELLIGENCE_TEST_HARNESS_VERSION = "0.1.0-test-harness";

/**
 * Contract for running intelligence engine test scenarios (BUILD-039).
 *
 * Framework-agnostic — no Jest, Vitest, or CLI required.
 */
export interface IntelligenceTestHarness {
  /**
   * Run a single scenario against the intelligence engine.
   */
  runScenario(scenario: IntelligenceTestScenario): Promise<IntelligenceTestScenarioReport>;

  /**
   * Run all built-in or supplied scenarios and return an aggregated report.
   */
  runAll(scenarios?: IntelligenceTestScenario[]): Promise<IntelligenceTestReport>;
}

/**
 * Deterministic local test harness for the CBAI Intelligence Engine (BUILD-039).
 *
 * Executes predefined scenarios against {@link DefaultIntelligenceEngine}
 * using existing local entity data — no external services or fabricated intelligence.
 */
export class DefaultIntelligenceTestHarness implements IntelligenceTestHarness {
  private readonly engine: IntelligenceEngine;

  constructor(engine: IntelligenceEngine = defaultIntelligenceEngine) {
    this.engine = engine;
  }

  /**
   * Run one scenario and return a structured report entry.
   */
  async runScenario(
    scenario: IntelligenceTestScenario,
  ): Promise<IntelligenceTestScenarioReport> {
    const startedMs = Date.now();
    const request = scenario.buildRequest();

    try {
      const result = await this.engine.run(request);
      const validation = scenario.validate({ request, result });

      return buildScenarioReport({
        scenarioId: scenario.id,
        scenarioName: scenario.name,
        validation,
        context: { request, result },
        durationMs: Math.max(0, Date.now() - startedMs),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown harness error";
      const validation = scenario.validate({ request, result: null, error: message });

      return buildScenarioReport({
        scenarioId: scenario.id,
        scenarioName: scenario.name,
        validation,
        context: { request, result: null, error: message },
        durationMs: Math.max(0, Date.now() - startedMs),
      });
    }
  }

  /**
   * Run scenarios sequentially and aggregate results.
   */
  async runAll(
    scenarios: IntelligenceTestScenario[] = INTELLIGENCE_TEST_SCENARIOS,
  ): Promise<IntelligenceTestReport> {
    resetTestRequestSequence();

    const startedAt = new Date().toISOString();
    const reports: IntelligenceTestScenarioReport[] = [];

    for (const scenario of scenarios) {
      reports.push(await this.runScenario(scenario));
    }

    const completedAt = new Date().toISOString();

    return buildIntelligenceTestReport({
      harnessVersion: INTELLIGENCE_TEST_HARNESS_VERSION,
      startedAt,
      completedAt,
      scenarios: reports,
    });
  }
}

/** Shared default test harness singleton. */
export const defaultIntelligenceTestHarness = new DefaultIntelligenceTestHarness();

/**
 * Convenience helper — run all built-in scenarios and return the report.
 */
export async function runIntelligenceTestSuite(
  harness: IntelligenceTestHarness = defaultIntelligenceTestHarness,
): Promise<IntelligenceTestReport> {
  return harness.runAll();
}

/**
 * Convenience helper — run all scenarios and return a formatted summary string.
 */
export async function runIntelligenceTestSuiteSummary(
  harness: IntelligenceTestHarness = defaultIntelligenceTestHarness,
): Promise<string> {
  const report = await runIntelligenceTestSuite(harness);
  return formatIntelligenceTestReportSummary(report);
}
