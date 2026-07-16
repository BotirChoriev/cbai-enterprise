/**
 * Mission Engine — derives thread state, validates completeness, links to projects.
 */

import { loadProjectEvidence, loadProjectNotes, loadProjectQuestions, loadProjects } from "@/lib/project/project-store";
import type { Mission, MissionThreadState } from "@/lib/intelligence-os/mission.types";
import { loadCurrentMission, loadMission } from "@/lib/intelligence-os/mission-store";
import { loadHumanImpactForMission } from "@/lib/intelligence-os/human-impact-store";

export function getCurrentMission(): Mission | null {
  return loadCurrentMission();
}

export function deriveMissionThread(mission: Mission | null): readonly MissionThreadState[] {
  if (!mission) {
    return [
      { stage: "mission", label: "No mission defined", status: "missing" },
      { stage: "question", label: "Problem not framed", status: "missing" },
      { stage: "evidence", label: "No evidence linked", status: "missing" },
      { stage: "reasoning", label: "No reasoning artifacts", status: "missing" },
      { stage: "collaborators", label: "No collaborators identified", status: "missing" },
      { stage: "report", label: "No report generated", status: "missing" },
      { stage: "impact", label: "Impact not assessed", status: "missing" },
    ];
  }

  const project = mission.projectId
    ? loadProjects().find((p) => p.id === mission.projectId)
    : loadProjects().find((p) => p.title === mission.problem || p.researchQuestion === mission.problem);

  const evidenceCount = project ? loadProjectEvidence(project.id).length : 0;
  const noteCount = project ? loadProjectNotes(project.id).length : 0;
  const questionCount = project ? loadProjectQuestions(project.id).length : 0;
  const impact = loadHumanImpactForMission(mission.id);
  const hasReport = Boolean(project?.reportGeneratedAt);

  return [
    {
      stage: "mission",
      label: mission.problem || "Mission defined",
      status: mission.problem.length > 10 ? "complete" : "partial",
    },
    {
      stage: "question",
      label: mission.whyExists || "Purpose pending",
      status: mission.whyExists.length > 5 ? "complete" : "partial",
    },
    {
      stage: "evidence",
      label: evidenceCount > 0 ? `${evidenceCount} evidence link${evidenceCount === 1 ? "" : "s"}` : mission.evidenceMissing || "Evidence gap identified",
      status: evidenceCount > 0 ? "complete" : mission.evidenceMissing ? "partial" : "missing",
    },
    {
      stage: "reasoning",
      label: noteCount + questionCount > 0 ? `${noteCount} notes · ${questionCount} questions` : "No reasoning artifacts",
      status: noteCount + questionCount > 0 ? "partial" : "missing",
    },
    {
      stage: "collaborators",
      label: mission.capabilitiesNeeded || "Capabilities not specified",
      status: mission.capabilitiesNeeded.length > 5 ? "partial" : "missing",
    },
    {
      stage: "report",
      label: hasReport ? "Report generated" : "Report not yet generated",
      status: hasReport ? "complete" : "missing",
    },
    {
      stage: "impact",
      label: impact?.isComplete ? "Impact assessed" : "Impact assessment required",
      status: impact?.isComplete ? "complete" : impact ? "partial" : "missing",
    },
  ];
}

export function isMissionCreationComplete(mission: Mission): boolean {
  return (
    mission.problem.trim().length >= 10 &&
    mission.whyExists.trim().length >= 5 &&
    mission.whoBenefits.trim().length >= 3 &&
    mission.successCriteria.trim().length >= 5
  );
}

export function getMissionById(id: string): Mission | null {
  return loadMission(id);
}
