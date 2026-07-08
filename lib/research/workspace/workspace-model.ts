import type { ResearchWorkspaceModel } from "@/lib/research/workspace/workspace-types";
import {
  WORKSPACE_MODULES,
  WORKSPACE_SHELL_NOTICE,
  WORKSPACE_SUPPORTED_OBJECTS,
  WORKSPACE_VERSION,
} from "@/lib/research/workspace/workspace-types";

/** Global research workspace shell — read-only foundation. */
export const RESEARCH_WORKSPACE: ResearchWorkspaceModel = {
  workspaceId: "research-workspace-global",
  workspaceName: "Research Workspace",
  supportedObjects: WORKSPACE_SUPPORTED_OBJECTS,
  futureModules: WORKSPACE_MODULES,
  status: "workspace_shell_available",
  humanReviewRequired: true,
  version: WORKSPACE_VERSION,
};

export const WORKSPACE_OVERVIEW_COPY = {
  title: "Research Workspace",
  subtitle:
    "A structured research workspace where evidence, publications, experiments, datasets, laboratories, researchers, and future collaboration will meet.",
  description:
    "Every research topic will eventually have its own workspace context. This shell shows the foundation — knowledge organization and evidence review readiness only.",
  notice: WORKSPACE_SHELL_NOTICE,
};

export function getResearchWorkspace(): ResearchWorkspaceModel {
  return RESEARCH_WORKSPACE;
}

export function isWorkspaceModuleActive(module: string): boolean {
  const activeModules = new Set(["Overview", "Knowledge Graph", "Notebook", "Timeline", "Evidence"]);
  return activeModules.has(module);
}
