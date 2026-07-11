import type { WorkspaceView } from "@/lib/foundation/workspace-types";
import type { PlatformValidationResult } from "@/lib/foundation/validation-types";

/** Promoted to lib/foundation/validation-types.ts — re-exported here so existing imports keep working. */
export type WorkspaceValidationResult = PlatformValidationResult;

/**
 * Deterministic structural validation only — confirms the workspace has a real identity and a
 * real Mission Center, not that its content is correct. Every other section is optional by
 * design (reasoning/workflow may not have run yet), so their absence is never an issue.
 */
export function validateWorkspaceView(view: WorkspaceView): WorkspaceValidationResult {
  const issues: string[] = [];

  if (!view.subjectId.trim()) {
    issues.push("Workspace view is missing a subjectId.");
  }
  if (!view.missionCenter.subject.subjectId.trim()) {
    issues.push("Workspace view's Mission Center is missing a subject.");
  }
  if (!view.missionCenter.question.question.trim()) {
    issues.push("Workspace view's Mission Center is missing a question.");
  }

  return { valid: issues.length === 0, issues };
}
