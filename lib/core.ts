export type ModuleStatus = "online" | "degraded" | "offline";

export type PlatformModule = {
  id: string;
  name: string;
  status: ModuleStatus;
  latency: string;
};

export type PipelineStage = {
  id: string;
  label: string;
  description: string;
};

export type Conversation = {
  id: string;
  title: string;
  time: string;
};

export type PinnedKnowledge = {
  id: string;
  title: string;
  source: string;
};

export type SavedCommand = {
  id: string;
  command: string;
  usedCount: number;
};

export const exampleCommands = [
  "Analyze Uzbekistan",
  "Compare USA and China",
  "Generate business strategy",
  "Find investment opportunities",
  "Explain current analytics",
  "Create automation",
];

export const pipelineStages: PipelineStage[] = [
  { id: "input", label: "Input", description: "Command received & parsed" },
  { id: "planner", label: "Planner", description: "Task decomposition & routing" },
  { id: "research", label: "Research", description: "External data gathering" },
  { id: "knowledge", label: "Knowledge", description: "RAG retrieval & context" },
  { id: "reasoning", label: "Reasoning", description: "Multi-step inference" },
  { id: "output", label: "Output", description: "Response synthesis" },
  { id: "action", label: "Action", description: "Execute & deliver results" },
];

export const platformModules: PlatformModule[] = [
  { id: "dashboard", name: "Dashboard", status: "online", latency: "12ms" },
  { id: "knowledge", name: "Knowledge", status: "online", latency: "23ms" },
  { id: "agents", name: "Agents", status: "online", latency: "18ms" },
  { id: "workflows", name: "Workflows", status: "online", latency: "31ms" },
  { id: "analytics", name: "Analytics", status: "online", latency: "27ms" },
  { id: "security", name: "Security", status: "online", latency: "9ms" },
  { id: "api", name: "API", status: "online", latency: "142ms" },
];

export const recentConversations: Conversation[] = [
  { id: "1", title: "Uzbekistan market entry analysis", time: "12 min ago" },
  { id: "2", title: "Q4 strategy review with Strategy Agent", time: "1 hour ago" },
  { id: "3", title: "Compliance audit summary request", time: "3 hours ago" },
  { id: "4", title: "Investor deck data extraction", time: "Yesterday" },
];

export const pinnedKnowledge: PinnedKnowledge[] = [
  { id: "1", title: "Central Asia Economic Outlook 2026", source: "Country Reports" },
  { id: "2", title: "Enterprise AI Governance Policy", source: "Legal & Compliance" },
  { id: "3", title: "Acme Corp 5-Year Strategy", source: "Business Strategy" },
];

export const savedCommands: SavedCommand[] = [
  { id: "1", command: "Analyze Uzbekistan", usedCount: 47 },
  { id: "2", command: "Compare USA and China", usedCount: 32 },
  { id: "3", command: "Generate business strategy", usedCount: 28 },
  { id: "4", command: "Explain current analytics", usedCount: 19 },
];

export const missionControl = {
  globalStatus: "Operational",
  activeModel: "cbai-enterprise-v2",
  runningAgents: 4,
  connectedModules: 7,
};
