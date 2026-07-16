/**
 * Report readiness — impact review required before claiming report readiness.
 */

import { loadHumanImpactForMission, loadHumanImpactForProject } from "@/lib/intelligence-os/human-impact-store";
import { loadCurrentMission } from "@/lib/intelligence-os/mission-store";
import { loadProjectEvidence, loadProjectQuestions } from "@/lib/project/project-store";

export type ReportReadinessState =
  | "draft"
  | "incomplete"
  | "impact_required"
  | "reviewed"
  | "decision_required";

export type ReportReadinessResult = {
  readonly state: ReportReadinessState;
  readonly canOpenReport: boolean;
  readonly canClaimReadiness: boolean;
  readonly limitation: string;
};

export function deriveReportReadiness(projectId: string): ReportReadinessResult {
  const mission = loadCurrentMission();
  const impact =
    loadHumanImpactForProject(projectId) ??
    (mission?.projectId === projectId ? loadHumanImpactForMission(mission.id) : null);

  const evidence = loadProjectEvidence(projectId);
  const questions = loadProjectQuestions(projectId);

  if (evidence.length === 0 && questions.length === 0) {
    return {
      state: "draft",
      canOpenReport: true,
      canClaimReadiness: false,
      limitation: "Report can be previewed in draft — readiness not claimed without evidence or questions.",
    };
  }

  if (!impact) {
    return {
      state: "impact_required",
      canOpenReport: true,
      canClaimReadiness: false,
      limitation: "Human impact assessment required before report readiness can be claimed.",
    };
  }

  if (!impact.isComplete) {
    return {
      state: "incomplete",
      canOpenReport: true,
      canClaimReadiness: false,
      limitation: "Complete the impact review — intended benefit, harm, environmental effect, and unknown risks.",
    };
  }

  return {
    state: "reviewed",
    canOpenReport: true,
    canClaimReadiness: true,
    limitation: "Readiness is qualitative — export formats remain honestly unavailable until connected.",
  };
}
