export type AgentStatus = "active" | "idle" | "paused" | "error";

export type Agent = {
  id: string;
  name: string;
  description: string;
  status: AgentStatus;
  tasksCompleted: number;
  successRate: number;
  lastRun: string;
};

export type AgentActivityItem = {
  id: string;
  agentName: string;
  action: string;
  detail: string;
  time: string;
  status: "success" | "running" | "failed";
};

export const agents: Agent[] = [
  {
    id: "research",
    name: "Research Agent",
    description:
      "Conducts country analysis, market research, and competitive intelligence gathering.",
    status: "active",
    tasksCompleted: 1847,
    successRate: 96.2,
    lastRun: "3 minutes ago",
  },
  {
    id: "strategy",
    name: "Strategy Agent",
    description:
      "Generates business strategies, scenario models, and strategic recommendations.",
    status: "active",
    tasksCompleted: 923,
    successRate: 94.8,
    lastRun: "12 minutes ago",
  },
  {
    id: "knowledge",
    name: "Knowledge Agent",
    description:
      "Summarizes documents, performs RAG queries, and retrieves organizational knowledge.",
    status: "active",
    tasksCompleted: 3214,
    successRate: 98.1,
    lastRun: "1 minute ago",
  },
  {
    id: "automation",
    name: "Automation Agent",
    description:
      "Creates workflows, orchestrates tasks, and automates recurring operational processes.",
    status: "idle",
    tasksCompleted: 756,
    successRate: 91.5,
    lastRun: "2 hours ago",
  },
  {
    id: "market",
    name: "Market Agent",
    description:
      "Monitors market trends, tracks competitors, and identifies expansion opportunities.",
    status: "active",
    tasksCompleted: 612,
    successRate: 93.7,
    lastRun: "28 minutes ago",
  },
  {
    id: "security",
    name: "Security Agent",
    description:
      "Audits AI interactions, detects anomalies, and enforces compliance policies.",
    status: "paused",
    tasksCompleted: 445,
    successRate: 99.4,
    lastRun: "6 hours ago",
  },
];

export const agentActivity: AgentActivityItem[] = [
  {
    id: "1",
    agentName: "Knowledge Agent",
    action: "Document summarized",
    detail: "Q4 Financial Report.pdf — 42 pages",
    time: "1 min ago",
    status: "success",
  },
  {
    id: "2",
    agentName: "Research Agent",
    action: "Country analysis completed",
    detail: "Southeast Asia market entry assessment",
    time: "3 min ago",
    status: "success",
  },
  {
    id: "3",
    agentName: "Strategy Agent",
    action: "Strategy report generated",
    detail: "2026 product expansion roadmap",
    time: "12 min ago",
    status: "success",
  },
  {
    id: "4",
    agentName: "Market Agent",
    action: "Competitor scan running",
    detail: "Monitoring 14 competitors in fintech sector",
    time: "28 min ago",
    status: "running",
  },
  {
    id: "5",
    agentName: "Automation Agent",
    action: "Workflow deployed",
    detail: "Invoice processing pipeline v3.2",
    time: "2 hours ago",
    status: "success",
  },
  {
    id: "6",
    agentName: "Security Agent",
    action: "Compliance audit paused",
    detail: "Scheduled maintenance window",
    time: "6 hours ago",
    status: "failed",
  },
];

export function getAgentStats(data: Agent[]) {
  const activeCount = data.filter((a) => a.status === "active").length;
  const totalTasks = data.reduce((sum, a) => sum + a.tasksCompleted, 0);
  const avgSuccess =
    data.reduce((sum, a) => sum + a.successRate, 0) / data.length;

  return {
    totalAgents: data.length,
    activeAgents: activeCount,
    tasksCompleted: totalTasks,
    avgSuccessRate: avgSuccess.toFixed(1),
  };
}
