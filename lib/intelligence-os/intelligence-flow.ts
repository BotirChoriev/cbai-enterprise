/**
 * EPIC-13.3 — Scientific workflow flow (visible, not a wizard).
 * Question → Hypothesis → Evidence → Reasoning → Review → Impact → Publication → Legacy
 */

import { deriveEvidenceJourney } from "@/lib/evidence-runtime/evidence-journey";
import { deriveLegacyTrail } from "@/lib/intelligence-os/legacy-trail";
import { getMissionNextAction } from "@/lib/intelligence-os/mission-lifecycle";
import { deriveReportReadiness } from "@/lib/intelligence-os/report-readiness";
import type { Mission } from "@/lib/intelligence-os/mission.types";
import { loadProjects } from "@/lib/project/project-store";

export type IntelligenceFlowStageId =
  | "question"
  | "hypothesis"
  | "evidence"
  | "reasoning"
  | "review"
  | "impact"
  | "publication"
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
  const projectId = mission?.projectId;
  const readiness = projectId ? deriveReportReadiness(projectId) : null;
  const project = projectId ? loadProjects().find((p) => p.id === projectId) : null;

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
      id: "hypothesis",
      label: "Hypothesis",
      status: mission?.whyExists?.trim() || mission?.successCriteria?.trim() ? "partial" : "missing",
      detail: mission?.whyExists?.trim() ? mission.whyExists : "State purpose and success criteria",
      href: "/",
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
      id: "review",
      label: "Review",
      status: byId.validation?.status ?? "missing",
      detail: byId.validation?.detail ?? "Validate sources and consensus",
      href: byId.validation?.href ?? "/knowledge",
    },
    {
      id: "impact",
      label: "Impact",
      status: next?.stage === "impact" ? (next.status as IntelligenceFlowStage["status"]) : "partial",
      detail: next?.stage === "impact" ? next.nextAction : "Assess human impact",
      href: projectId ? `/my-work${q}#human-impact` : "/my-work",
    },
    {
      id: "publication",
      label: "Publication",
      status: project?.reportGeneratedAt
        ? "complete"
        : readiness?.canClaimReadiness
          ? "partial"
          : "missing",
      detail: project?.reportGeneratedAt
        ? "Report generated"
        : readiness?.limitation ?? "Complete review before publication",
      href: projectId ? `/reports${q}` : "/reports",
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

/** Current + next stage only — reduces cognitive load in ambient context. */
export function deriveFocusedFlow(mission: Mission | null): readonly IntelligenceFlowStage[] {
  const flow = deriveIntelligenceFlow(mission);
  const currentIdx = flow.findIndex((s) => s.status === "missing" || s.status === "attention");
  if (currentIdx <= 0) return flow.slice(0, 2);
  return flow.slice(Math.max(0, currentIdx - 1), currentIdx + 2);
}
