export const WORKSPACE_SUPPORTED_OBJECTS = [
  "Research Topics",
  "Publications",
  "Experiments",
  "Datasets",
  "Laboratories",
  "Researchers",
  "Methods",
  "Evidence",
  "Open Questions",
  "Negative Results",
  "Patents",
] as const;

export type WorkspaceSupportedObject = (typeof WORKSPACE_SUPPORTED_OBJECTS)[number];

export const WORKSPACE_MODULES = [
  "Overview",
  "Knowledge Graph",
  "Evidence",
  "Notebook",
  "Timeline",
  "Publications",
  "Experiments",
  "Datasets",
  "Laboratories",
  "Researchers",
  "Open Questions",
  "Negative Results",
  "Reports",
] as const;

export type WorkspaceModule = (typeof WORKSPACE_MODULES)[number];

export const WORKSPACE_LIFECYCLE_STAGES = [
  {
    stageId: "discover",
    title: "Discover",
    description: "Browse the research catalog and topic profiles.",
  },
  {
    stageId: "understand",
    title: "Understand",
    description: "Review methods, evidence types, and knowledge organization.",
  },
  {
    stageId: "review_evidence",
    title: "Review Evidence",
    description: "Structure evidence review when sources connect — human review required.",
  },
  {
    stageId: "identify_gaps",
    title: "Identify Gaps",
    description: "Track open questions and negative results as structured objects.",
  },
  {
    stageId: "future_collaboration",
    title: "Future Collaboration",
    description: "Future collaboration space — not active today.",
  },
] as const;

export type WorkspaceLifecycleStageId =
  (typeof WORKSPACE_LIFECYCLE_STAGES)[number]["stageId"];

export type WorkspaceStatus = "workspace_shell_available" | "future_workspace" | "not_connected_yet";

export type ResearchWorkspaceModel = {
  workspaceId: string;
  workspaceName: string;
  supportedObjects: readonly WorkspaceSupportedObject[];
  futureModules: readonly WorkspaceModule[];
  status: WorkspaceStatus;
  humanReviewRequired: boolean;
  version: string;
};

export const WORKSPACE_STATUS_LABELS: Record<WorkspaceStatus, string> = {
  workspace_shell_available: "Workspace shell available",
  future_workspace: "Future workspace",
  not_connected_yet: "Not connected yet",
};

export const WORKSPACE_VERSION = "1.0.0";

export const WORKSPACE_AVAILABLE_TODAY = [
  "Research catalog",
  "Topic pages",
  "Knowledge graph",
  "Notebook",
  "Timeline",
] as const;

export const WORKSPACE_NOT_AVAILABLE_YET = [
  "Live publications",
  "Live researchers",
  "Live experiments",
  "Workspace collaboration",
  "Evidence discussions",
  "AI live analysis",
] as const;

export const WORKSPACE_SHELL_NOTICE =
  "This is a read-only workspace shell. Live evidence, collaboration, and analysis are not connected yet.";

export const WORKSPACE_HUMAN_REVIEW_NOTICE =
  "Human review is required before any future workspace output supports a decision.";

export const WORKSPACE_PATH = "/research/workspace";
