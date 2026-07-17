/**
 * Report readiness — impact review and qualifying reviewed evidence required.
 */

import { loadHumanImpactForMission, loadHumanImpactForProject } from "@/lib/intelligence-os/human-impact-store";
import { loadCurrentMission } from "@/lib/intelligence-os/mission-store";
import { loadProjectEvidence, loadProjectQuestions } from "@/lib/project/project-store";
import {
  deriveReportEvidenceBlocker,
  loadQualifyingProjectEvidence,
} from "@/lib/knowledge-ingestion/qualifying-evidence";

export type ReportReadinessState =
  | "draft"
  | "incomplete"
  | "impact_required"
  | "evidence_required"
  | "reviewed"
  | "decision_required";

export type ReportReadinessResult = {
  readonly state: ReportReadinessState;
  readonly canOpenReport: boolean;
  readonly canClaimReadiness: boolean;
  readonly limitation: string;
  readonly nextAction: string | null;
};

export function deriveReportReadiness(projectId: string): ReportReadinessResult {
  const mission = loadCurrentMission();
  const missionId = mission?.projectId === projectId ? mission.id : null;
  const impact =
    loadHumanImpactForProject(projectId) ??
    (mission?.projectId === projectId ? loadHumanImpactForMission(mission.id) : null);

  const allEvidence = loadProjectEvidence(projectId);
  const qualifyingEvidence = loadQualifyingProjectEvidence(projectId);
  const questions = loadProjectQuestions(projectId);
  const evidenceBlocker = deriveReportEvidenceBlocker(projectId, missionId);

  if (allEvidence.length === 0 && questions.length === 0) {
    return {
      state: "draft",
      canOpenReport: true,
      canClaimReadiness: false,
      limitation: "Report can be previewed in draft — readiness not claimed without evidence or questions.",
      nextAction: "Save and review a scholarly source, then link it to this mission.",
    };
  }

  if (qualifyingEvidence.length === 0) {
    return {
      state: "evidence_required",
      canOpenReport: true,
      canClaimReadiness: false,
      limitation: evidenceBlocker ?? "No reviewed evidence is linked to this mission.",
      nextAction:
        allEvidence.length > 0
          ? "Complete human review and accept a source as evidence."
          : "Save a source from Knowledge, link it to the mission, and send it for review.",
    };
  }

  if (!impact) {
    return {
      state: "impact_required",
      canOpenReport: true,
      canClaimReadiness: false,
      limitation: "Human impact assessment required before report readiness can be claimed.",
      nextAction: "Complete the human impact review for this mission.",
    };
  }

  if (!impact.isComplete) {
    return {
      state: "incomplete",
      canOpenReport: true,
      canClaimReadiness: false,
      limitation: "Complete the impact review — intended benefit, harm, environmental effect, and unknown risks.",
      nextAction: "Finish all required impact fields.",
    };
  }

  return {
    state: "reviewed",
    canOpenReport: true,
    canClaimReadiness: true,
    limitation: "Readiness is qualitative — export formats remain honestly unavailable until connected.",
    nextAction: null,
  };
}
