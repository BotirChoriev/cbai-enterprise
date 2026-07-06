/**
 * CBAI Legacy Build Integration — public API.
 *
 * Platform read model for BUILD-021–061 intelligence foundations.
 * Does not modify runtime, agents, reasoning, or lib/intelligence modules.
 */

export {
  LEGACY_BUILD_INTEGRATION_VERSION,
  type LegacyBuildRange,
  type LegacySessionRegistrySummary,
  type LegacyWorkerSummary,
  type LegacyObservabilitySummary,
  type LegacyPolicyRuleSummary,
  type LegacyPolicySummary,
  type LegacyTestHarnessSummary,
  type LegacyAgentTaskStoreSummary,
  type LegacyLocalAdapterSummary,
  type LegacyDiagnosticsPosture,
  type LegacyBuildIntegrationModel,
} from "@/lib/legacy-build-integration/integration-types";

export { collectLegacyBuildIntegrationModel } from "@/lib/legacy-build-integration/collect-legacy-integration";
