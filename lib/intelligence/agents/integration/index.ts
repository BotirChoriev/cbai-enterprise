/**
 * CBAI Intelligence — Agent Dispatch Integration (BUILD-053).
 *
 * Connects Agent Task Store and Agent Dispatcher for deterministic preparation.
 * Not wired to Runtime execution yet.
 *
 * @see docs/build-053-report.md
 */

export {
  AGENT_DISPATCH_INTEGRATION_VERSION,
  type AgentDispatchDiagnostics,
  type AgentDispatchPreparationResult,
  type AgentDispatchValidationResult,
} from "@/lib/intelligence/agents/integration/types";

export {
  buildAgentDispatchDiagnostics,
  copyAgentDispatchDiagnostics,
  isAgentDispatchReady,
} from "@/lib/intelligence/agents/integration/agent-dispatch-diagnostics";

export {
  applyDispatchToTask,
  buildAgentTaskDispatchMetadata,
  resolvePostDispatchTaskStatus,
} from "@/lib/intelligence/agents/integration/agent-dispatch-state";

export {
  DEFAULT_AGENT_DISPATCH_INTEGRATION_ID,
  DefaultAgentDispatchIntegration,
  defaultAgentDispatchIntegration,
  ensureTaskInStore,
  prepareAgentDispatch,
  type AgentDispatchIntegration,
  type AgentDispatchPreparationInput,
} from "@/lib/intelligence/agents/integration/agent-dispatch-integration";
