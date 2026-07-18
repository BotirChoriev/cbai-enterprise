/**
 * Execute a confirmed voice/operator action — only call after explicit user confirmation.
 */

import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { recordWorkflowEvent } from "@/lib/telemetry/workflow-telemetry";
import type { VoiceActionProposal } from "@/lib/voice/voice-control-types";
import type { PrimaryEntityRef } from "@/lib/context/context-builder";

export type ExecuteVoiceActionDeps = {
  readonly router: AppRouterInstance;
  readonly focusedEntity: PrimaryEntityRef | null;
  readonly pinEntityToWorkspace: (entity: PrimaryEntityRef) => void;
  readonly updateProfile: (patch: { preferredLanguage?: string; speechLanguage?: string }) => void;
  readonly t: (path: string, vars?: Record<string, string>) => string;
};

export function executeVoiceAction(
  proposal: VoiceActionProposal,
  deps: ExecuteVoiceActionDeps,
): string | null {
  if (proposal.status !== "known") return null;

  if (proposal.kind === "workspace_pin") {
    if (proposal.pinEntity && deps.focusedEntity) {
      deps.pinEntityToWorkspace(deps.focusedEntity);
      return deps.t("assistantVoice.savedToWorkspace", { name: deps.focusedEntity.name });
    }
    return deps.t("assistantVoice.nothingToSaveYet");
  }

  if (proposal.kind === "profile_update" && proposal.profilePatch) {
    deps.updateProfile(proposal.profilePatch);
    return proposal.message ?? deps.t("voiceControl.actionSetInterfaceLanguage");
  }

  if (proposal.message) {
    if (proposal.href) {
      deps.router.push(proposal.href);
      recordWorkflowEvent("intent_resolved", { outcome: "success" });
    }
    return proposal.message;
  }

  if (proposal.href) {
    deps.router.push(proposal.href);
    recordWorkflowEvent("intent_resolved", { outcome: "success" });
    return deps.t("voiceControl.actionNavigateDescription", proposal.actionVars);
  }

  return null;
}
