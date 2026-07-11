/**
 * Agent capability catalog. No agent runtime is connected to this UI — task counts, success
 * rates, and activity logs are not real measurements and must never be fabricated to imply one
 * is. See lib/intelligence/agents/tasks/ for the dormant, unconnected task-dispatch system this
 * catalog describes.
 */
export type AgentAvailability = "capability_defined" | "runtime_not_connected";

export type Agent = {
  id: string;
  name: string;
  description: string;
  availability: AgentAvailability;
};

export const AGENT_RUNTIME_NOT_CONNECTED_LABEL = "Runtime Not Connected";

export const agents: Agent[] = [
  {
    id: "research",
    name: "Research Agent",
    description:
      "Conducts country analysis, market research, and competitive intelligence gathering.",
    availability: "runtime_not_connected",
  },
  {
    id: "strategy",
    name: "Strategy Agent",
    description:
      "Generates business strategies, scenario models, and strategic recommendations.",
    availability: "runtime_not_connected",
  },
  {
    id: "knowledge",
    name: "Knowledge Agent",
    description:
      "Summarizes documents, performs RAG queries, and retrieves organizational knowledge.",
    availability: "runtime_not_connected",
  },
  {
    id: "automation",
    name: "Automation Agent",
    description:
      "Creates workflows, orchestrates tasks, and automates recurring operational processes.",
    availability: "runtime_not_connected",
  },
  {
    id: "market",
    name: "Market Agent",
    description:
      "Monitors market trends, tracks competitors, and identifies expansion opportunities.",
    availability: "runtime_not_connected",
  },
  {
    id: "security",
    name: "Security Agent",
    description:
      "Audits AI interactions, detects anomalies, and enforces compliance policies.",
    availability: "runtime_not_connected",
  },
];

export function getAgentStats(data: Agent[]) {
  return {
    totalAgents: data.length,
    connectedAgents: data.filter((agent) => agent.availability === "capability_defined").length,
  };
}
