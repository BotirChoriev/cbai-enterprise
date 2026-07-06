/**
 * CBAI Intelligence Engine — Local Test Harness (BUILD-039).
 *
 * Deterministic scenario-based testing against existing local entity data.
 * No Jest/Vitest, CLI, UI, external services, or fabricated intelligence.
 *
 * @see docs/build-039-report.md
 */

export {
  DefaultIntelligenceTestHarness,
  INTELLIGENCE_TEST_HARNESS_VERSION,
  defaultIntelligenceTestHarness,
  runIntelligenceTestSuite,
  runIntelligenceTestSuiteSummary,
  type IntelligenceTestHarness,
} from "@/lib/intelligence/testing/test-harness";

export {
  INTELLIGENCE_TEST_SCENARIOS,
  INTELLIGENCE_TEST_SCENARIOS_VERSION,
  TEST_COMPANY_ENTITY_ID,
  TEST_COUNTRY_ENTITY_ID,
  TEST_MISSING_ENTITY_ID,
  TEST_UNIVERSITY_ENTITY_ID,
  createTestRequest,
  getIntelligenceTestScenario,
  resetTestRequestSequence,
} from "@/lib/intelligence/testing/test-scenarios";

export {
  buildIntelligenceTestReport,
  buildScenarioReport,
  extractBlockingIssues,
  formatIntelligenceTestReportSummary,
  resolveTestOutcome,
} from "@/lib/intelligence/testing/test-reporter";

export type {
  IntelligenceTestOutcome,
  IntelligenceTestReport,
  IntelligenceTestScenario,
  IntelligenceTestScenarioReport,
  IntelligenceTestValidationContext,
  IntelligenceTestValidationResult,
  IntelligenceTestValidator,
} from "@/lib/intelligence/testing/types";
