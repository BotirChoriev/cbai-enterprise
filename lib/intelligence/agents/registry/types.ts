import type { EntityType } from "@/lib/entity/entity.types";
import type { IntelligenceType } from "@/lib/intelligence/request.types";

/** Agent lifecycle status in the registry (BUILD-046). */
export type AgentStatus = "registered" | "enabled" | "disabled" | "deprecated";

/**
 * Capability metadata identifiers — no execution semantics (BUILD-046).
 */
export type AgentCapability =
  | "research"
  | "reasoning"
  | "knowledge"
  | "search"
  | "graph"
  | "automation"
  | "analysis"
  | "planning"
  | "summarization";

/**
 * Metadata-only definition of an Intelligence Agent (BUILD-046).
 *
 * The registry stores catalog information only — agents are not executed here.
 */
export interface AgentDefinition {
  /** Unique agent identifier. */
  id: string;
  /** Human-readable agent name. */
  name: string;
  /** Semantic version string for the agent definition. */
  version: string;
  /** Factual description of agent purpose — no fabricated behavior. */
  description: string;
  /** Registry category for grouping and query. */
  category: string;
  /** Current lifecycle status. */
  status: AgentStatus;
  /** Declared capability metadata tags. */
  capabilities: readonly AgentCapability[];
  /** Entity types this agent declares support for. */
  supportedEntityTypes: readonly EntityType[];
  /** Intelligence product types this agent declares support for. */
  supportedIntelligenceTypes: readonly IntelligenceType[];
  /** ISO-8601 timestamp when the agent was registered. */
  createdAt: string;
  /** ISO-8601 timestamp when the agent was last updated. */
  updatedAt: string;
}

/**
 * Input for registering a new agent.
 */
export interface AgentRegisterInput {
  id: string;
  name: string;
  version: string;
  description: string;
  category: string;
  status?: AgentStatus;
  capabilities?: readonly AgentCapability[];
  supportedEntityTypes?: readonly EntityType[];
  supportedIntelligenceTypes?: readonly IntelligenceType[];
  createdAt?: string;
}

/**
 * Input for updating an existing agent definition.
 */
export interface AgentUpdateInput {
  name?: string;
  version?: string;
  description?: string;
  category?: string;
  status?: AgentStatus;
  capabilities?: readonly AgentCapability[];
  supportedEntityTypes?: readonly EntityType[];
  supportedIntelligenceTypes?: readonly IntelligenceType[];
  updatedAt?: string;
}

/**
 * Result of an agent register operation.
 */
export interface AgentRegisterResult {
  accepted: boolean;
  agent?: AgentDefinition;
  reason?: string;
}

/**
 * Result of an agent update operation.
 */
export interface AgentUpdateResult {
  updated: boolean;
  agent?: AgentDefinition;
  reason?: string;
}

/**
 * Immutable agent registry snapshot (BUILD-046).
 */
export interface AgentRegistrySnapshot {
  /** Total agents tracked by the registry. */
  total: number;
  /** Agents with enabled status. */
  enabled: number;
  /** Agents with disabled status. */
  disabled: number;
  /** Agents with deprecated status. */
  deprecated: number;
  /** Distinct categories present in the registry. */
  categories: readonly string[];
  /** Registry semantic version. */
  registryVersion: string;
}

/** Semantic version of the agent registry foundation. */
export const AGENT_REGISTRY_VERSION = "0.1.0-agent-registry";
