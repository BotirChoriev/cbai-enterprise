import type { AgentCapability } from "@/lib/intelligence/agents/registry/types";

/** Capability: research. */
export const AGENT_CAPABILITY_RESEARCH = "research" as const;

/** Capability: reasoning. */
export const AGENT_CAPABILITY_REASONING = "reasoning" as const;

/** Capability: knowledge. */
export const AGENT_CAPABILITY_KNOWLEDGE = "knowledge" as const;

/** Capability: search. */
export const AGENT_CAPABILITY_SEARCH = "search" as const;

/** Capability: graph. */
export const AGENT_CAPABILITY_GRAPH = "graph" as const;

/** Capability: automation. */
export const AGENT_CAPABILITY_AUTOMATION = "automation" as const;

/** Capability: analysis. */
export const AGENT_CAPABILITY_ANALYSIS = "analysis" as const;

/** Capability: planning. */
export const AGENT_CAPABILITY_PLANNING = "planning" as const;

/** Capability: summarization. */
export const AGENT_CAPABILITY_SUMMARIZATION = "summarization" as const;

/** All supported agent capability identifiers. */
export const ALL_AGENT_CAPABILITIES: readonly AgentCapability[] = [
  AGENT_CAPABILITY_RESEARCH,
  AGENT_CAPABILITY_REASONING,
  AGENT_CAPABILITY_KNOWLEDGE,
  AGENT_CAPABILITY_SEARCH,
  AGENT_CAPABILITY_GRAPH,
  AGENT_CAPABILITY_AUTOMATION,
  AGENT_CAPABILITY_ANALYSIS,
  AGENT_CAPABILITY_PLANNING,
  AGENT_CAPABILITY_SUMMARIZATION,
];

const CAPABILITY_SET = new Set<string>(ALL_AGENT_CAPABILITIES);

/**
 * Returns true when the value is a known agent capability.
 */
export function isAgentCapability(value: string): value is AgentCapability {
  return CAPABILITY_SET.has(value);
}

/**
 * Normalize and deduplicate capability tags deterministically.
 */
export function normalizeAgentCapabilities(
  capabilities: readonly string[] | undefined,
): AgentCapability[] {
  if (!capabilities || capabilities.length === 0) {
    return [];
  }

  const normalized = new Set<AgentCapability>();

  for (const capability of capabilities) {
    if (isAgentCapability(capability)) {
      normalized.add(capability);
    }
  }

  return [...normalized].sort((a, b) => a.localeCompare(b));
}

/**
 * Returns true when an agent declares the requested capability.
 */
export function agentHasCapability(
  capabilities: readonly AgentCapability[],
  capability: AgentCapability,
): boolean {
  return capabilities.includes(capability);
}

/**
 * Human-readable labels for agent capabilities — metadata only.
 */
export const AGENT_CAPABILITY_LABELS: Record<AgentCapability, string> = {
  research: "Research",
  reasoning: "Reasoning",
  knowledge: "Knowledge",
  search: "Search",
  graph: "Graph",
  automation: "Automation",
  analysis: "Analysis",
  planning: "Planning",
  summarization: "Summarization",
};
