/**
 * CBAI Intelligence — Agents Layer (BUILD-046).
 *
 * Agent catalog and registry foundations.
 * No agent execution in this build phase.
 *
 * @see docs/build-046-report.md
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
