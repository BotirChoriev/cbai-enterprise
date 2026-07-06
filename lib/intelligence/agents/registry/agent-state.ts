import type { AgentDefinition, AgentRegistrySnapshot, AgentStatus } from "@/lib/intelligence/agents/registry/types";
import { AGENT_REGISTRY_VERSION } from "@/lib/intelligence/agents/registry/types";

/**
 * Count agents by lifecycle status.
 */
export function countAgentsByStatus(
  agents: readonly AgentDefinition[],
  status: AgentStatus,
): number {
  return agents.filter((agent) => agent.status === status).length;
}

/**
 * Collect distinct categories from agent definitions.
 */
export function collectAgentCategories(agents: readonly AgentDefinition[]): string[] {
  const categories = new Set<string>();

  for (const agent of agents) {
    categories.add(agent.category);
  }

  return [...categories].sort((a, b) => a.localeCompare(b));
}

/**
 * Build an immutable agent registry snapshot.
 */
export function buildAgentRegistrySnapshot(
  agents: readonly AgentDefinition[],
): AgentRegistrySnapshot {
  return {
    total: agents.length,
    enabled: countAgentsByStatus(agents, "enabled"),
    disabled: countAgentsByStatus(agents, "disabled"),
    deprecated: countAgentsByStatus(agents, "deprecated"),
    categories: collectAgentCategories(agents),
    registryVersion: AGENT_REGISTRY_VERSION,
  };
}

/**
 * Filter agents by capability.
 */
export function filterAgentsByCapability(
  agents: readonly AgentDefinition[],
  capability: AgentDefinition["capabilities"][number],
): AgentDefinition[] {
  return agents.filter((agent) => agent.capabilities.includes(capability));
}

/**
 * Filter agents by lifecycle status.
 */
export function filterAgentsByStatus(
  agents: readonly AgentDefinition[],
  status: AgentStatus,
): AgentDefinition[] {
  return agents.filter((agent) => agent.status === status);
}

/**
 * Filter agents by category.
 */
export function filterAgentsByCategory(
  agents: readonly AgentDefinition[],
  category: string,
): AgentDefinition[] {
  const normalized = category.trim();

  return agents.filter((agent) => agent.category === normalized);
}
