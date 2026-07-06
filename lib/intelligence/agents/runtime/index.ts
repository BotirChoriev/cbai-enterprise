/**
 * CBAI Intelligence — Agent Runtime Contract (BUILD-047).
 *
 * Provider-agnostic contract for future agent backends.
 * Stub declarations only — no execution or SDK calls.
 *
 * @see docs/build-047-report.md
 */

export {
  AGENT_RUNTIME_CONTRACT_ID_PREFIX,
  StubAnthropicAgentBackend,
  StubGeminiAgentBackend,
  StubLocalAgentBackend,
  StubOpenAIAgentBackend,
  STUB_AGENT_RUNTIME_CONTRACTS,
  createAgentRequest,
  listAgentRuntimeContracts,
  resolveAgentRuntimeContract,
  type AgentRequest,
  type AgentRuntimeContract,
} from "@/lib/intelligence/agents/runtime/agent-contract";

export {
  createAgentContext,
  createAgentContextId,
  copyAgentContext,
  resetAgentContextSequence,
  type AgentContext,
} from "@/lib/intelligence/agents/runtime/agent-context";

export {
  advanceToPrepared,
  advanceToReady,
  advanceToValidated,
  canExecuteAgentLifecycle,
  canMarkAgentReady,
  canPrepareAgentLifecycle,
  canValidateAgentLifecycle,
  isTerminalAgentLifecycle,
  type AgentLifecycleStatus,
} from "@/lib/intelligence/agents/runtime/agent-lifecycle";

export {
  copyAgentRequest,
  createAgentRequestEnvelopeId,
  resetAgentRequestSequence,
  validateAgentRequestEnvelope,
  withAgentRequestLifecycle,
} from "@/lib/intelligence/agents/runtime/agent-request";

export {
  copyAgentResponse,
  createAgentResponse,
  createAgentResponseEnvelopeId,
  createFailedAgentResponse,
  createUnsupportedExecutionResponse,
  resetAgentResponseSequence,
  type AgentResponse,
  type AgentResponseStatus,
} from "@/lib/intelligence/agents/runtime/agent-response";

export {
  ALL_PROVIDER_KINDS,
  PROVIDER_KIND_ANTHROPIC,
  PROVIDER_KIND_DESCRIPTIONS,
  PROVIDER_KIND_GEMINI,
  PROVIDER_KIND_LABELS,
  PROVIDER_KIND_LOCAL,
  PROVIDER_KIND_OPENAI,
  isProviderKind,
  type ProviderKind,
} from "@/lib/intelligence/agents/runtime/provider-kinds";

export type {
  AgentHealthResult,
  AgentHealthStatus,
  AgentOperationResult,
  AgentSupportResult,
} from "@/lib/intelligence/agents/runtime/types";

export { AGENT_RUNTIME_CONTRACT_VERSION } from "@/lib/intelligence/agents/runtime/types";
