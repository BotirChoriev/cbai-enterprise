/**
 * Mission Lifecycle — complete real mission path with exists, missing, and next action per stage.
 * EPIC-02: Mission Operating System
 */

import { deriveReportReadiness } from "@/lib/intelligence-os/report-readiness";
import { loadHumanImpactForMission } from "@/lib/intelligence-os/human-impact-store";
import type { Mission, MissionThreadStage, MissionThreadState } from "@/lib/intelligence-os/mission.types";
import {
  loadProjectEvidence,
  loadProjectNotes,
  loadProjectQuestions,
  loadProjects,
} from "@/lib/project/project-store";

export type MissionLifecycleStage = MissionThreadState & {
  readonly exists: string | null;
  readonly missing: string | null;
  readonly nextAction: string;
  readonly nextActionKey?: keyof typeof import("@/lib/i18n/platform-copy-build020-en").MISSION_LIFECYCLE_NEXT_EN;
  readonly href: string;
};

function projectQuery(projectId: string | undefined): string {
  return projectId ? `?project=${projectId}` : "";
}

function resolveProject(mission: Mission | null) {
  if (!mission) return null;
  if (mission.projectId) {
    return loadProjects().find((p) => p.id === mission.projectId) ?? null;
  }
  return loadProjects().find((p) => p.title === mission.problem || p.researchQuestion === mission.problem) ?? null;
}

export function deriveMissionLifecycle(mission: Mission | null): readonly MissionLifecycleStage[] {
  if (!mission) {
    return emptyLifecycle();
  }

  const project = resolveProject(mission);
  const projectId = project?.id ?? mission.projectId;
  const q = projectQuery(projectId);
  const evidence = project ? loadProjectEvidence(project.id) : [];
  const notes = project ? loadProjectNotes(project.id) : [];
  const questions = project ? loadProjectQuestions(project.id) : [];
  const impact = loadHumanImpactForMission(mission.id);
  const readiness = projectId ? deriveReportReadiness(projectId) : null;
  const hasReport = Boolean(project?.reportGeneratedAt);

  const stages: MissionLifecycleStage[] = [
    {
      stage: "mission",
      label: mission.problem || "Mission defined",
      status: mission.problem.trim().length >= 10 ? "complete" : "partial",
      exists: mission.problem.trim() ? mission.problem : null,
      missing: mission.problem.trim().length >= 10 ? null : "Define the problem in at least ten characters.",
      nextAction: mission.problem.trim().length >= 10 ? "Review purpose and beneficiaries." : "Complete the mission problem statement.",
      nextActionKey: mission.problem.trim().length >= 10 ? "reviewPurpose" : "completeProblem",
      href: "/",
    },
    {
      stage: "question",
      label: mission.whyExists || "Purpose pending",
      status:
        questions.length > 0 || mission.whyExists.trim().length > 5
          ? questions.length > 0
            ? "complete"
            : "partial"
          : "missing",
      exists:
        questions.length > 0
          ? `${questions.length} project question${questions.length === 1 ? "" : "s"}`
          : mission.whyExists.trim()
            ? mission.whyExists
            : null,
      missing:
        questions.length === 0 && mission.whyExists.trim().length <= 5
          ? "Frame the research question or purpose."
          : null,
      nextAction:
        questions.length > 0 ? "Review open questions." : "Add questions in My Work or complete mission purpose.",
      nextActionKey: questions.length > 0 ? "reviewQuestions" : "addQuestions",
      href: projectId ? `/my-work${q}#project-questions` : "/my-work",
    },
    {
      stage: "evidence",
      label:
        evidence.length > 0
          ? `${evidence.length} evidence link${evidence.length === 1 ? "" : "s"}`
          : mission.evidenceMissing || "No evidence linked",
      status:
        evidence.length > 0 ? "complete" : mission.evidenceMissing.trim() ? "partial" : "missing",
      exists: evidence.length > 0 ? `${evidence.length} linked reference${evidence.length === 1 ? "" : "s"}` : null,
      missing:
        evidence.length === 0
          ? mission.evidenceMissing.trim() || "Link evidence references to the project."
          : null,
      nextAction: evidence.length > 0 ? "Verify source URLs where available." : "Add evidence in My Work.",
      nextActionKey: evidence.length > 0 ? "verifySources" : "addEvidence",
      href: projectId ? `/my-work${q}#project-evidence` : "/knowledge",
    },
    {
      stage: "reasoning",
      label:
        notes.length + questions.length > 0
          ? `${notes.length} notes · ${questions.length} questions`
          : "No reasoning artifacts",
      status: notes.length + questions.length > 0 ? (notes.length > 0 ? "partial" : "partial") : "missing",
      exists:
        notes.length > 0
          ? `${notes.length} note${notes.length === 1 ? "" : "s"}`
          : questions.length > 0
            ? `${questions.length} open question${questions.length === 1 ? "" : "s"}`
            : null,
      missing: notes.length === 0 && questions.length === 0 ? "Add notes or structured reasoning artifacts." : null,
      nextAction: notes.length > 0 ? "Review reasoning in Reasoning module." : "Capture analysis notes in My Work.",
      nextActionKey: notes.length > 0 ? "reviewReasoning" : "captureNotes",
      href: "/reasoning",
    },
    {
      stage: "collaborators",
      label: mission.capabilitiesNeeded || "Capabilities not specified",
      status: mission.capabilitiesNeeded.trim().length > 5 ? "partial" : "missing",
      exists: mission.capabilitiesNeeded.trim() ? mission.capabilitiesNeeded : null,
      missing: mission.capabilitiesNeeded.trim().length <= 5 ? "Specify capabilities needed — no fake collaborators." : null,
      nextAction: "Document required capabilities; collaboration matching is not connected externally.",
      nextActionKey: "documentCapabilities",
      href: "/trust",
    },
    {
      stage: "impact",
      label: impact?.isComplete ? "Impact assessed" : "Impact assessment required",
      status: impact?.isComplete ? "complete" : impact ? "partial" : "missing",
      exists: impact?.isComplete ? "Human impact review complete" : impact ? "Impact draft started" : null,
      missing: !impact?.isComplete ? "Complete humanity impact review before report readiness." : null,
      nextAction: impact?.isComplete ? "Review impact periodically." : "Complete Human Impact panel in My Work.",
      nextActionKey: impact?.isComplete ? "reviewImpact" : "completeImpact",
      href: projectId ? `/my-work${q}#human-impact` : "/my-work",
    },
    {
      stage: "report",
      label: hasReport ? "Report generated" : readiness?.limitation ?? "Report not yet generated",
      status: readiness?.canClaimReadiness ? "complete" : readiness?.state === "draft" ? "missing" : "partial",
      exists: hasReport ? "Project report timestamp recorded" : readiness?.canClaimReadiness ? "Readiness criteria met" : null,
      missing: !readiness?.canClaimReadiness ? readiness?.limitation ?? "Evidence and impact required." : null,
      nextAction: readiness?.canClaimReadiness ? "Preview report — export formats honestly unavailable." : "Complete evidence and impact review.",
      nextActionKey: readiness?.canClaimReadiness ? "previewReport" : "completeForReport",
      href: projectId ? `/my-work${q}#project-report` : "/reports",
    },
  ];

  return stages;
}

function emptyLifecycle(): readonly MissionLifecycleStage[] {
  const base: Omit<MissionLifecycleStage, "stage"> = {
    label: "Not started",
    status: "missing",
    exists: null,
    missing: "Begin a mission to activate the lifecycle.",
    nextAction: "Create a mission from the Intelligence Canvas.",
    nextActionKey: "createMission",
    href: "/?create=1",
  };
  const stageIds: MissionThreadStage[] = [
    "mission",
    "question",
    "evidence",
    "reasoning",
    "collaborators",
    "impact",
    "report",
  ];
  return stageIds.map((stage) => ({ ...base, stage, label: stageLabels[stage] }));
}

const stageLabels: Record<MissionThreadStage, string> = {
  mission: "No mission defined",
  question: "Problem not framed",
  evidence: "No evidence linked",
  reasoning: "No reasoning artifacts",
  collaborators: "No collaborators identified",
  report: "No report generated",
  impact: "Impact not assessed",
};

/** Backward-compatible thread derivation with lifecycle enrichment */
export function deriveMissionThreadFromLifecycle(mission: Mission | null): readonly MissionThreadState[] {
  return deriveMissionLifecycle(mission).map(({ stage, label, status }) => ({ stage, label, status }));
}

export function getMissionNextAction(mission: Mission | null): MissionLifecycleStage | null {
  const lifecycle = deriveMissionLifecycle(mission);
  return lifecycle.find((s) => s.status === "missing" || s.status === "partial") ?? lifecycle[0] ?? null;
}
