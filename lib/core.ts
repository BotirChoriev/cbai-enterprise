export type ModuleStatus = "online" | "degraded" | "offline";

export type PlatformModule = {
  id: string;
  name: string;
  status: ModuleStatus;
  /** Honest status note — not a measured latency. */
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

/** Extended route — example prompts only; command interface not connected. */
export const exampleCommands: readonly string[] = [];

export const pipelineStages: PipelineStage[] = [
  { id: "input", label: "Input", description: "Command received and parsed" },
  { id: "planner", label: "Planner", description: "Task decomposition and routing" },
  { id: "research", label: "Research", description: "External evidence gathering" },
  { id: "knowledge", label: "Knowledge", description: "Evidence retrieval and context" },
  { id: "reasoning", label: "Reasoning", description: "Governed inference stages" },
  { id: "output", label: "Output", description: "Response synthesis" },
  { id: "action", label: "Action", description: "Execute and deliver results" },
];

/** Illustrative module list — static export; no live health probes. */
export const platformModules: PlatformModule[] = [
  { id: "dashboard", name: "Dashboard", status: "offline", latency: "Not measured" },
  { id: "knowledge", name: "Evidence Explorer", status: "online", latency: "Static export" },
  { id: "agents", name: "Agents", status: "offline", latency: "Not connected" },
  { id: "workflows", name: "Workflows", status: "offline", latency: "Not connected" },
  { id: "analytics", name: "Reports", status: "online", latency: "Static export" },
  { id: "security", name: "Security", status: "offline", latency: "Not measured" },
  { id: "api", name: "API", status: "offline", latency: "Not connected" },
];

export const recentConversations: Conversation[] = [];

export const pinnedKnowledge: PinnedKnowledge[] = [];

export const savedCommands: SavedCommand[] = [];

export const missionControl = {
  globalStatus: "Not connected",
  activeModel: "None — static export",
  runningAgents: 0,
  connectedModules: 2,
};
