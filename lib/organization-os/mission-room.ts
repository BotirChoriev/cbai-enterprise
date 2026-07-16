/**
 * EPIC-05 — Mission Room: mission as the collaboration space.
 * No generic chat rooms — everything lives inside the mission room.
 */

import { deriveEvidenceJourney } from "@/lib/evidence-runtime/evidence-journey";
import { deriveEvidenceRuntime } from "@/lib/evidence-runtime/evidence-runtime";
import { deriveKnowledgeRiver } from "@/lib/intelligence-os/knowledge-river";
import { loadHumanImpactForMission } from "@/lib/intelligence-os/human-impact-store";
import type { Mission } from "@/lib/intelligence-os/mission.types";
import { deriveReportReadiness } from "@/lib/intelligence-os/report-readiness";
import { loadProjectQuestions } from "@/lib/project/project-store";

export type MissionRoomSection =
  | "discussion"
  | "evidence"
  | "questions"
  | "decisions"
  | "reports"
  | "impact"
  | "knowledge"
  | "timeline";

export type MissionRoomSectionState = {
  readonly id: MissionRoomSection;
  readonly label: string;
  readonly status: "active" | "empty" | "attention";
  readonly detail: string;
  readonly href: string | null;
  readonly count: number;
};

export type MissionRoom = {
  readonly missionId: string | null;
  readonly missionProblem: string | null;
  readonly sections: readonly MissionRoomSectionState[];
  readonly limitation: string;
  readonly cloudCollaborationConnected: false;
};

const SECTION_ORDER: readonly MissionRoomSection[] = [
  "discussion",
  "evidence",
  "questions",
  "decisions",
  "reports",
  "impact",
  "knowledge",
  "timeline",
];

export function deriveMissionRoom(mission: Mission | null): MissionRoom {
  if (!mission) {
    return {
      missionId: null,
      missionProblem: null,
      sections: SECTION_ORDER.map((id) => ({
        id,
        label: id,
        status: "empty",
        detail: "Begin a mission to open the mission room.",
        href: "/",
        count: 0,
      })),
      limitation: "Mission room is inactive without an active mission.",
      cloudCollaborationConnected: false,
    };
  }

  const runtime = deriveEvidenceRuntime(mission, mission.projectId);
  const questions = mission.projectId ? loadProjectQuestions(mission.projectId) : [];
  const openQuestions = questions.filter((q) => !q.resolved);
  const impact = loadHumanImpactForMission(mission.id);
  const readiness = mission.projectId ? deriveReportReadiness(mission.projectId) : null;
  const river = deriveKnowledgeRiver(mission);
  const journey = deriveEvidenceJourney(mission);

  const sections: MissionRoomSectionState[] = [
    {
      id: "discussion",
      label: "discussion",
      status: "empty",
      detail: "Context-attached discussion only — no standalone messaging channel.",
      href: mission.projectId ? `/my-work?project=${mission.projectId}` : "/",
      count: 0,
    },
    {
      id: "evidence",
      label: "evidence",
      status: runtime.records.length > 0 ? "active" : "attention",
      detail: runtime.limitation,
      href: "/knowledge",
      count: runtime.records.length,
    },
    {
      id: "questions",
      label: "questions",
      status: openQuestions.length > 0 ? "attention" : questions.length > 0 ? "active" : "empty",
      detail: openQuestions.length > 0 ? `${openQuestions.length} open question(s)` : "No open questions recorded.",
      href: mission.projectId ? `/my-work?project=${mission.projectId}#project-questions` : "/my-work",
      count: questions.length,
    },
    {
      id: "decisions",
      label: "decisions",
      status: "empty",
      detail: "Decision ledger architecture ready — no persisted team decisions yet.",
      href: "/reasoning",
      count: 0,
    },
    {
      id: "reports",
      label: "reports",
      status: readiness?.canClaimReadiness ? "active" : "attention",
      detail: readiness?.limitation ?? "Link a project to evaluate report readiness.",
      href: mission.projectId ? `/reports?project=${mission.projectId}` : "/reports",
      count: readiness?.canClaimReadiness ? 1 : 0,
    },
    {
      id: "impact",
      label: "impact",
      status: impact?.isComplete ? "active" : "attention",
      detail: impact?.isComplete ? "Human impact review recorded." : "Human impact review incomplete.",
      href: mission.projectId ? `/my-work?project=${mission.projectId}#human-impact` : "/my-work",
      count: impact ? 1 : 0,
    },
    {
      id: "knowledge",
      label: "knowledge",
      status: river.length > 0 ? "active" : "empty",
      detail: `${river.length} temporal knowledge event(s) from real records.`,
      href: "/graph",
      count: river.length,
    },
    {
      id: "timeline",
      label: "timeline",
      status: journey.length > 0 ? "active" : "empty",
      detail: "Evidence journey stages from mission-linked project data.",
      href: "/",
      count: journey.length,
    },
  ];

  return {
    missionId: mission.id,
    missionProblem: mission.problem,
    sections,
    limitation: "Mission room is single-operator today — multi-participant sync is not connected.",
    cloudCollaborationConnected: false,
  };
}
