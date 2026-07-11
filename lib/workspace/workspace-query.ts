import type { WorkspaceView } from "@/lib/foundation/workspace-types";

/**
 * Deterministic boolean/derived readers over a WorkspaceView — so a React component asks these
 * questions instead of inspecting array lengths or field presence itself. Every function here
 * is a trivial, honest read of data another Epic's engine already computed; nothing is inferred
 * or scored.
 */

export function hasConflictingEvidence(view: WorkspaceView): boolean {
  return view.evidenceCenter.conflictingEvidence.length > 0;
}

export function hasOpenQuestions(view: WorkspaceView): boolean {
  return view.openQuestions.questions.length > 0;
}

export function hasCollaborationCandidates(view: WorkspaceView): boolean {
  return view.knowledgeNetwork.collaborationCandidates.length > 0;
}

export function isWorkspaceMonitoring(view: WorkspaceView): boolean {
  return view.monitoring.currentState === "monitoring";
}

export function isWorkspaceTerminal(view: WorkspaceView): boolean {
  return view.monitoring.isTerminal;
}
