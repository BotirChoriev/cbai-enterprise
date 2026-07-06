/**
 * CBAI Intelligence — Agents Layer (BUILD-046+).
 *
 * Agent catalog, registry, and runtime contract foundations.
 * No agent execution in this build phase.
 *
 * @see docs/build-046-report.md
 * @see docs/build-047-report.md
 * @see docs/build-048-report.md
 * @see docs/build-049-report.md
 */

export {
  AGENT_REGISTRY_VERSION,
  AGENT_CAPABILITY_ANALYSIS,
  AGENT_CAPABILITY_AUTOMATION,
  AGENT_CAPABILITY_GRAPH,
  AGENT_CAPABILITY_KNOWLEDGE,
  AGENT_CAPABILITY_LABELS,
  AGENT_CAPABILITY_PLANNING,
  AGENT_CAPABILITY_REASONING,
  AGENT_CAPABILITY_RESEARCH,
  AGENT_CAPABILITY_SEARCH,
  AGENT_CAPABILITY_SUMMARIZATION,
  ALL_AGENT_CAPABILITIES,
  DEFAULT_AGENT_REGISTRY_ID,
  DefaultAgentRegistry,
  agentHasCapability,
  applyAgentDefinitionUpdate,
  buildAgentRegistrySnapshot,
  copyAgentDefinition,
  createAgentDefinition,
  defaultAgentRegistry,
  isAgentCapability,
  isDeprecatedAgentStatus,
  isEnabledAgentStatus,
  normalizeAgentCapabilities,
  queryByCapability,
  queryByCategory,
  queryByStatus,
  type AgentCapability,
  type AgentDefinition,
  type AgentRegisterInput,
  type AgentRegistry,
  type AgentRegistrySnapshot,
  type AgentStatus,
} from "@/lib/intelligence/agents/registry";

export type {
  AgentRegisterResult,
  AgentUpdateInput,
  AgentUpdateResult,
} from "@/lib/intelligence/agents/registry";

export {
  AGENT_RUNTIME_CONTRACT_ID_PREFIX,
  AGENT_RUNTIME_CONTRACT_VERSION,
  ALL_PROVIDER_KINDS,
  PROVIDER_KIND_ANTHROPIC,
  PROVIDER_KIND_DESCRIPTIONS,
  PROVIDER_KIND_GEMINI,
  PROVIDER_KIND_LABELS,
  PROVIDER_KIND_LOCAL,
  PROVIDER_KIND_OPENAI,
  STUB_AGENT_RUNTIME_CONTRACTS,
  StubAnthropicAgentBackend,
  StubGeminiAgentBackend,
  StubLocalAgentBackend,
  StubOpenAIAgentBackend,
  createAgentContext,
  createAgentRequest,
  createAgentResponse,
  listAgentRuntimeContracts,
  resolveAgentRuntimeContract,
  validateAgentRequestEnvelope,
  type AgentContext,
  type AgentRequest,
  type AgentResponse,
  type AgentRuntimeContract,
  type ProviderKind,
} from "@/lib/intelligence/agents/runtime";

export {
  AGENT_TASK_MODEL_VERSION,
  AGENT_TASK_STORE_VERSION,
  ALL_TASK_PRIORITIES,
  DEFAULT_AGENT_TASK_STORE_ID,
  DefaultAgentTaskStore,
  defaultAgentTaskStore,
  buildAgentTaskStoreSnapshot,
  createAgentTask,
  createPendingTaskResult,
  createTaskRequest,
  createTaskResultFromStatus,
  queryActiveTasks as queryActiveAgentTasks,
  queryByAgentId as queryTasksByAgentId,
  queryByPriority as queryTasksByPriority,
  queryByRequestId as queryTasksByRequestId,
  queryByRuntimeSessionId as queryTasksByRuntimeSessionId,
  queryByStatus as queryTasksByStatus,
  queryByTaskId,
  queryTerminalTasks,
  sortAgentTasks,
  validateAgentTask,
  validateTaskLifecycleTransition,
  validateTaskRequest,
  validateTaskResult,
  withAgentTaskStatus,
  type AgentTask,
  type AgentTaskStore,
  type AgentTaskStoreSnapshot,
  type AgentTaskDispatchMetadata,
  type TaskPriority,
  type TaskRequest,
  type TaskResult,
  type TaskStatus,
  type TaskStoreAddResult,
  type TaskStoreUpdateResult,
} from "@/lib/intelligence/agents/tasks";

export {
  AGENT_DISPATCH_VERSION,
  DEFAULT_AGENT_DISPATCHER_ID,
  DEFAULT_DISPATCH_POLICY,
  DefaultAgentDispatcher,
  defaultAgentDispatcher,
  evaluateAgentEligibility,
  explainAgentSelection,
  selectAgentByPolicy,
  type AgentDispatcher,
  type DispatchPolicy,
  type DispatchResult,
} from "@/lib/intelligence/agents/dispatch";

export {
  AGENT_DISPATCH_INTEGRATION_VERSION,
  DEFAULT_AGENT_DISPATCH_INTEGRATION_ID,
  DefaultAgentDispatchIntegration,
  defaultAgentDispatchIntegration,
  prepareAgentDispatch,
  buildAgentDispatchDiagnostics,
  isAgentDispatchReady,
  type AgentDispatchIntegration,
  type AgentDispatchDiagnostics,
  type AgentDispatchPreparationInput,
  type AgentDispatchPreparationResult,
  type AgentDispatchValidationResult,
} from "@/lib/intelligence/agents/integration";
