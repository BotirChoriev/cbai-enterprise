/**
 * EPIC-13.2 — Intelligence flow: question → research → evidence → reasoning → validation → impact → legacy.
 * Single flow authority derived from real mission artifacts.
 */

import { deriveEvidenceJourney } from "@/lib/evidence-runtime/evidence-journey";
import { deriveLegacyTrail } from "@/lib/intelligence-os/legacy-trail";
import { getMissionNextAction } from "@/lib/intelligence-os/mission-lifecycle";
import type { Mission } from "@/lib/intelligence-os/mission.types";
import { loadProjects } from "@/lib/project/project-store";

export type IntelligenceFlowStageId =
  | "question"
  | "research"
  | "evidence"
  | "reasoning"
  | "validation"
  | "impact"
  | "legacy";

export type IntelligenceFlowStage = {
  readonly id: IntelligenceFlowStageId;
  readonly label: string;
  readonly status: "complete" | "partial" | "missing" | "attention";
  readonly detail: string;
  readonly href: string;
};

function projectQuery(mission: Mission | null): string {
  const projectId = mission?.projectId;
  return projectId ? `?project=${projectId}` : "";
}

export function deriveIntelligenceFlow(mission: Mission | null): readonly IntelligenceFlowStage[] {
  const journey = deriveEvidenceJourney(mission);
  const legacy = deriveLegacyTrail(mission);
  const next = getMissionNextAction(mission);
  const q = projectQuery(mission);
  const hasResearchProject = loadProjects().some((p) => p.type === "research_project");

  const byId = Object.fromEntries(journey.map((s) => [s.id, s])) as Record<
    string,
    (typeof journey)[number]
  >;

  return [
    {
      id: "question",
      label: "Question",
      status: byId.question?.status ?? "missing",
      detail: byId.question?.detail ?? "Frame the inquiry",
      href: byId.question?.href ?? "/my-work",
    },
    {
      id: "research",
      label: "Research",
      status: hasResearchProject || mission?.projectId ? "partial" : "missing",
      detail: hasResearchProject ? "Research project active" : "Open research workspace",
      href: mission?.projectId ? `/research/workspace${q}` : "/research",
    },
    {
      id: "evidence",
      label: "Evidence",
      status: byId.evidence?.status ?? "missing",
      detail: byId.evidence?.detail ?? "Link evidence",
      href: byId.evidence?.href ?? "/knowledge",
    },
    {
      id: "reasoning",
      label: "Reasoning",
      status: next?.stage === "reasoning" ? (next.status as IntelligenceFlowStage["status"]) : "partial",
      detail: next?.stage === "reasoning" ? next.nextAction : "Capture analysis",
      href: "/reasoning",
    },
    {
      id: "validation",
      label: "Validation",
      status: byId.validation?.status ?? "missing",
      detail: byId.validation?.detail ?? "Verify sources",
      href: byId.validation?.href ?? "/knowledge",
    },
    {
      id: "impact",
      label: "Impact",
      status: next?.stage === "impact" ? (next.status as IntelligenceFlowStage["status"]) : "partial",
      detail: next?.stage === "impact" ? next.nextAction : "Assess human impact",
      href: mission?.projectId ? `/my-work${q}#human-impact` : "/my-work",
    },
    {
      id: "legacy",
      label: "Legacy",
      status: legacy.artifacts.length > 0 ? "complete" : "missing",
      detail: legacy.summary ?? `${legacy.artifacts.length} artifact(s) traceable`,
      href: "/",
    },
  ];
}

export function deriveCurrentFlowStage(mission: Mission | null): IntelligenceFlowStage | null {
  const flow = deriveIntelligenceFlow(mission);
  return flow.find((s) => s.status === "missing" || s.status === "attention") ?? flow[flow.length - 1] ?? null;
}
