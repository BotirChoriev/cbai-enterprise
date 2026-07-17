import { loadProjectEvidence } from "@/lib/project/project-store";
import type { ProjectEvidenceReference } from "@/lib/project/project-types";
import { loadSavedKnowledgeSources } from "@/lib/knowledge-ingestion/saved-source-store";

/** Evidence that counts toward report readiness — human-reviewed and accepted. */
export function loadQualifyingProjectEvidence(projectId: string): ProjectEvidenceReference[] {
  return loadProjectEvidence(projectId).filter(
    (ref) => ref.reviewOutcome === "accepted_as_evidence",
  );
}

export function loadLinkedUnreviewedSourcesForMission(missionId: string): number {
  return loadSavedKnowledgeSources().filter(
    (s) =>
      s.missionRelations.some((r) => r.missionId === missionId) &&
      s.lifecycleState === "linked_to_mission" &&
      s.humanReviewState === "not_requested",
  ).length;
}

export function loadAwaitingReviewSourcesForMission(missionId: string): number {
  return loadSavedKnowledgeSources().filter(
    (s) =>
      s.missionRelations.some((r) => r.missionId === missionId) &&
      s.lifecycleState === "awaiting_review" &&
      (s.humanReviewState === "awaiting_review" || s.humanReviewState === "in_review"),
  ).length;
}

export function deriveReportEvidenceBlocker(projectId: string, missionId: string | null): string | null {
  const qualifying = loadQualifyingProjectEvidence(projectId);
  if (qualifying.length > 0) return null;

  const unreviewed = missionId ? loadLinkedUnreviewedSourcesForMission(missionId) : 0;
  if (unreviewed > 0) {
    return "One linked source still requires human review.";
  }

  const awaiting = missionId ? loadAwaitingReviewSourcesForMission(missionId) : 0;
  if (awaiting > 0) {
    return "One linked source is awaiting review.";
  }

  const anyEvidence = loadProjectEvidence(projectId);
  const contextOnly = anyEvidence.filter((e) => e.reviewOutcome === "context_only");
  if (contextOnly.length > 0 && qualifying.length === 0) {
    return "Reviewed sources are contextual and do not support the primary question.";
  }

  if (anyEvidence.length === 0) {
    return "No reviewed evidence is linked to this mission.";
  }

  return "No qualifying reviewed evidence is linked to this mission.";
}
