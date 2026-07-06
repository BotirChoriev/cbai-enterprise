/**
 * CBAI Intelligence — Agent Execution Foundation (BUILD-054).
 *
 * Connects dispatch-ready tasks to runtime contract preparation.
 * Never invokes execute() or provider SDKs.
 *
 * @see docs/build-054-report.md
 */

export {
  AGENT_EXECUTION_FOUNDATION_VERSION,
  type AgentExecutionInput,
  type AgentExecutionResult,
  type ExecutionState,
} from "@/lib/intelligence/agents/execution/types";

export {
  appendExecutionErrors,
  appendExecutionWarnings,
  copyAgentExecutionContext,
  createAgentExecutionContext,
  type AgentExecutionContext,
} from "@/lib/intelligence/agents/execution/execution-context";

export {
  formatExecutionState,
  isBlockedExecutionState,
  isReadyExecutionState,
  resolveExecutionReady,
  resolveStateAfterHealth,
  resolveStateAfterPrepare,
  resolveStateAfterValidate,
} from "@/lib/intelligence/agents/execution/execution-state";

export {
  copyAgentExecutionResult,
  createAgentExecutionResult,
  formatAgentExecutionSummary,
} from "@/lib/intelligence/agents/execution/execution-result";

export {
  DEFAULT_AGENT_EXECUTION_COORDINATOR_ID,
  DefaultAgentExecutionCoordinator,
  defaultAgentExecutionCoordinator,
  buildExecutionAgentRequest,
  isTaskExecutionEligible,
  resolveExecutionProviderKind,
  runAgentExecutionFoundation,
  runAgentExecutionPipeline,
  wrapUnhealthyAgentRuntimeContract,
  wrapFailingValidateAgentRuntimeContract,
  type AgentExecutionCoordinator,
  type AgentRuntimeContractResolver,
} from "@/lib/intelligence/agents/execution/execution-coordinator";
