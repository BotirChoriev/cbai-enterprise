import { normalizeAgentCapabilities } from "@/lib/intelligence/agents/registry/agent-capabilities";
import type {
  AgentDefinition,
  AgentRegisterInput,
  AgentStatus,
  AgentUpdateInput,
} from "@/lib/intelligence/agents/registry/types";

/**
 * Returns true when an agent status represents an operable catalog entry.
 */
export function isEnabledAgentStatus(status: AgentStatus): boolean {
  return status === "enabled";
}

/**
 * Returns true when an agent status is terminal for catalog use.
 */
export function isDeprecatedAgentStatus(status: AgentStatus): boolean {
  return status === "deprecated";
}

/**
 * Validate required agent register input fields.
 */
export function validateAgentRegisterInput(
  input: AgentRegisterInput,
): { valid: true } | { valid: false; reason: string } {
  if (!input.id.trim()) {
    return { valid: false, reason: "Register reject: agent id is required." };
  }

  if (!input.name.trim()) {
    return { valid: false, reason: "Register reject: agent name is required." };
  }

  if (!input.version.trim()) {
    return { valid: false, reason: "Register reject: agent version is required." };
  }

  if (!input.category.trim()) {
    return { valid: false, reason: "Register reject: agent category is required." };
  }

  return { valid: true };
}

/**
 * Create a new agent definition from register input.
 */
export function createAgentDefinition(
  input: AgentRegisterInput,
  timestamp: string = new Date().toISOString(),
): AgentDefinition {
  const createdAt = input.createdAt ?? timestamp;

  return {
    id: input.id.trim(),
    name: input.name.trim(),
    version: input.version.trim(),
    description: input.description.trim(),
    category: input.category.trim(),
    status: input.status ?? "registered",
    capabilities: normalizeAgentCapabilities(input.capabilities),
    supportedEntityTypes: [...(input.supportedEntityTypes ?? [])],
    supportedIntelligenceTypes: [...(input.supportedIntelligenceTypes ?? [])],
    createdAt,
    updatedAt: createdAt,
  };
}

/**
 * Apply partial updates to an agent definition.
 */
export function applyAgentDefinitionUpdate(
  current: AgentDefinition,
  input: AgentUpdateInput,
  timestamp: string = new Date().toISOString(),
): AgentDefinition {
  const updatedAt = input.updatedAt ?? timestamp;

  return {
    id: current.id,
    name: input.name?.trim() ?? current.name,
    version: input.version?.trim() ?? current.version,
    description: input.description?.trim() ?? current.description,
    category: input.category?.trim() ?? current.category,
    status: input.status ?? current.status,
    capabilities:
      input.capabilities === undefined
        ? [...current.capabilities]
        : normalizeAgentCapabilities(input.capabilities),
    supportedEntityTypes:
      input.supportedEntityTypes === undefined
        ? [...current.supportedEntityTypes]
        : [...input.supportedEntityTypes],
    supportedIntelligenceTypes:
      input.supportedIntelligenceTypes === undefined
        ? [...current.supportedIntelligenceTypes]
        : [...input.supportedIntelligenceTypes],
    createdAt: current.createdAt,
    updatedAt,
  };
}

/**
 * Produce a shallow copy of an agent definition.
 */
export function copyAgentDefinition(agent: AgentDefinition): AgentDefinition {
  return {
    ...agent,
    capabilities: [...agent.capabilities],
    supportedEntityTypes: [...agent.supportedEntityTypes],
    supportedIntelligenceTypes: [...agent.supportedIntelligenceTypes],
  };
}

/**
 * Sort agent definitions deterministically by id.
 */
export function sortAgentDefinitions(
  agents: readonly AgentDefinition[],
): AgentDefinition[] {
  return [...agents]
    .map(copyAgentDefinition)
    .sort((a, b) => a.id.localeCompare(b.id));
}
