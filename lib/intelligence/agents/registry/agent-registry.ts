import {
  applyAgentDefinitionUpdate,
  copyAgentDefinition,
  createAgentDefinition,
  sortAgentDefinitions,
  validateAgentRegisterInput,
} from "@/lib/intelligence/agents/registry/agent-definition";
import {
  buildAgentRegistrySnapshot,
  filterAgentsByCapability,
  filterAgentsByCategory,
  filterAgentsByStatus,
} from "@/lib/intelligence/agents/registry/agent-state";
import type {
  AgentDefinition,
  AgentRegisterInput,
  AgentRegisterResult,
  AgentRegistrySnapshot,
  AgentStatus,
  AgentUpdateInput,
  AgentUpdateResult,
} from "@/lib/intelligence/agents/registry/types";
import type { AgentCapability } from "@/lib/intelligence/agents/registry/types";

/** Stable identifier for the default agent registry. */
export const DEFAULT_AGENT_REGISTRY_ID = "default-agent-registry";

/**
 * Contract for the CBAI Agent Registry (BUILD-046).
 *
 * Central catalog of Intelligence Agent metadata.
 * Does not execute agents or connect to external services.
 */
export interface AgentRegistry {
  /** Register a new agent definition. */
  register(input: AgentRegisterInput): AgentRegisterResult;

  /** Update an existing agent definition. */
  update(agentId: string, input: AgentUpdateInput): AgentUpdateResult;

  /** Remove an agent from the registry. */
  remove(agentId: string): AgentDefinition | null;

  /** Retrieve an agent by id. */
  get(agentId: string): AgentDefinition | null;

  /** List all agents in deterministic id order. */
  list(): readonly AgentDefinition[];

  /** Immutable registry snapshot. */
  snapshot(): AgentRegistrySnapshot;

  /** Remove all agents from the registry. */
  clear(): void;
}

/**
 * Query agents by capability.
 */
export function queryByCapability(
  registry: AgentRegistry,
  capability: AgentCapability,
): AgentDefinition[] {
  return sortAgentDefinitions(filterAgentsByCapability(registry.list(), capability));
}

/**
 * Query agents by lifecycle status.
 */
export function queryByStatus(
  registry: AgentRegistry,
  status: AgentStatus,
): AgentDefinition[] {
  return sortAgentDefinitions(filterAgentsByStatus(registry.list(), status));
}

/**
 * Query agents by category.
 */
export function queryByCategory(
  registry: AgentRegistry,
  category: string,
): AgentDefinition[] {
  return sortAgentDefinitions(filterAgentsByCategory(registry.list(), category));
}

/**
 * Default in-memory agent registry (BUILD-046).
 */
export class DefaultAgentRegistry implements AgentRegistry {
  private agents = new Map<string, AgentDefinition>();

  register(input: AgentRegisterInput): AgentRegisterResult {
    const validation = validateAgentRegisterInput(input);

    if (!validation.valid) {
      return { accepted: false, reason: validation.reason };
    }

    const agentId = input.id.trim();

    if (this.agents.has(agentId)) {
      return {
        accepted: false,
        reason: `Register reject: agent id "${agentId}" is already registered.`,
      };
    }

    const agent = createAgentDefinition(input);
    this.agents.set(agent.id, agent);

    return { accepted: true, agent: copyAgentDefinition(agent) };
  }

  update(agentId: string, input: AgentUpdateInput): AgentUpdateResult {
    const existing = this.agents.get(agentId);

    if (!existing) {
      return {
        updated: false,
        reason: `Update reject: agent id "${agentId}" is not registered.`,
      };
    }

    const agent = applyAgentDefinitionUpdate(existing, input);
    this.agents.set(agentId, agent);

    return { updated: true, agent: copyAgentDefinition(agent) };
  }

  remove(agentId: string): AgentDefinition | null {
    const agent = this.agents.get(agentId);

    if (!agent) {
      return null;
    }

    this.agents.delete(agentId);
    return copyAgentDefinition(agent);
  }

  get(agentId: string): AgentDefinition | null {
    const agent = this.agents.get(agentId);
    return agent ? copyAgentDefinition(agent) : null;
  }

  list(): readonly AgentDefinition[] {
    return sortAgentDefinitions([...this.agents.values()]);
  }

  snapshot(): AgentRegistrySnapshot {
    return buildAgentRegistrySnapshot(this.list());
  }

  clear(): void {
    this.agents.clear();
  }
}

/** Shared default agent registry singleton. */
export const defaultAgentRegistry = new DefaultAgentRegistry();
