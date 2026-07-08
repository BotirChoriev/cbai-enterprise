export {
  WORKSPACE_SUPPORTED_OBJECTS,
  WORKSPACE_MODULES,
  WORKSPACE_LIFECYCLE_STAGES,
  WORKSPACE_STATUS_LABELS,
  WORKSPACE_VERSION,
  WORKSPACE_AVAILABLE_TODAY,
  WORKSPACE_NOT_AVAILABLE_YET,
  WORKSPACE_SHELL_NOTICE,
  WORKSPACE_HUMAN_REVIEW_NOTICE,
  WORKSPACE_PATH,
  type WorkspaceSupportedObject,
  type WorkspaceModule,
  type WorkspaceLifecycleStageId,
  type WorkspaceStatus,
  type ResearchWorkspaceModel,
} from "@/lib/research/workspace/workspace-types";

export {
  RESEARCH_WORKSPACE,
  WORKSPACE_OVERVIEW_COPY,
  getResearchWorkspace,
  isWorkspaceModuleActive,
} from "@/lib/research/workspace/workspace-model";
