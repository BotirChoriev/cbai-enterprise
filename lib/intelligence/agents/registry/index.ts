/**
 * CBAI Intelligence — Agent Registry (BUILD-046).
 *
 * Central catalog of Intelligence Agent metadata.
 * No agent execution, external APIs, or runtime integration.
 *
 * @see docs/build-046-report.md
 */

export {
  DEFAULT_AGENT_REGISTRY_ID,
  DefaultAgentRegistry,
  defaultAgentRegistry,
  queryByCapability,
  queryByCategory,
  queryByStatus,
  type AgentRegistry,
} from "@/lib/intelligence/agents/registry/agent-registry";

export {
  applyAgentDefinitionUpdate,
  copyAgentDefinition,
  createAgentDefinition,
  isDeprecatedAgentStatus,
  isEnabledAgentStatus,
  sortAgentDefinitions,
  validateAgentRegisterInput,
} from "@/lib/intelligence/agents/registry/agent-definition";

export {
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
  agentHasCapability,
  isAgentCapability,
  normalizeAgentCapabilities,
} from "@/lib/intelligence/agents/registry/agent-capabilities";

export {
  buildAgentRegistrySnapshot,
  collectAgentCategories,
  countAgentsByStatus,
  filterAgentsByCapability,
  filterAgentsByCategory,
  filterAgentsByStatus,
} from "@/lib/intelligence/agents/registry/agent-state";

export type {
  AgentCapability,
  AgentDefinition,
  AgentRegisterInput,
  AgentRegisterResult,
  AgentRegistrySnapshot,
  AgentStatus,
  AgentUpdateInput,
  AgentUpdateResult,
} from "@/lib/intelligence/agents/registry/types";

export { AGENT_REGISTRY_VERSION } from "@/lib/intelligence/agents/registry/types";
