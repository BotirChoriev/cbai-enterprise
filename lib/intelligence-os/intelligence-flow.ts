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

export type IntelligenceFlowLabelKey =
  | "flowLabelQuestion"
  | "flowLabelHypothesis"
  | "flowLabelEvidence"
  | "flowLabelReasoning"
  | "flowLabelReview"
  | "flowLabelImpact"
  | "flowLabelPublication"
  | "flowLabelLegacy";

export type IntelligenceFlowDetailKey =
  | "flowDetailFrameInquiry"
  | "flowDetailStatePurpose"
  | "flowDetailLinkEvidence"
  | "flowDetailCaptureAnalysis"
  | "flowDetailValidateSources"
  | "flowDetailAssessImpact"
  | "flowDetailCompleteReview"
  | "flowDetailReportGenerated"
  | "flowDetailArtifactsTraceable";

export type IntelligenceFlowStage = {
  readonly id: IntelligenceFlowStageId;
  /** @deprecated English fallback. Prefer labelKey (experienceEngineering.*) in UI. */
  readonly label: string;
  /** Always set — translate `experienceEngineering.{labelKey}` at render time. */
  readonly labelKey: IntelligenceFlowLabelKey;
  readonly status: "complete" | "partial" | "missing" | "attention";
  readonly detail: string;
  /**
   * Set when `detail` is deterministic platform copy — translate `experienceEngineering.{detailKey}`
   * with `detailParams`. Null when `detail` carries user or derived content that must render as-is.
   */
  readonly detailKey: IntelligenceFlowDetailKey | null;
  readonly detailParams?: Readonly<Record<string, string>>;
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

  const questionDetail = byId.question?.detail ?? "Frame the inquiry";
  const evidenceDetail = byId.evidence?.detail ?? "Link evidence";
  const reviewDetail = byId.validation?.detail ?? "Validate sources and consensus";

  return [
    {
      id: "question",
      label: "Question",
      labelKey: "flowLabelQuestion",
      status: byId.question?.status ?? "missing",
      detail: questionDetail,
      detailKey: questionDetail === "Frame the inquiry" ? "flowDetailFrameInquiry" : null,
      href: byId.question?.href ?? "/my-work",
    },
    {
      id: "hypothesis",
      label: "Hypothesis",
      labelKey: "flowLabelHypothesis",
      status: mission?.whyExists?.trim() || mission?.successCriteria?.trim() ? "partial" : "missing",
      detail: mission?.whyExists?.trim() ? mission.whyExists : "State purpose and success criteria",
      detailKey: mission?.whyExists?.trim() ? null : "flowDetailStatePurpose",
      href: "/",
    },
    {
      id: "evidence",
      label: "Evidence",
      labelKey: "flowLabelEvidence",
      status: byId.evidence?.status ?? "missing",
      detail: evidenceDetail,
      detailKey: evidenceDetail === "Link evidence" ? "flowDetailLinkEvidence" : null,
      href: byId.evidence?.href ?? "/knowledge",
    },
    {
      id: "reasoning",
      label: "Reasoning",
      labelKey: "flowLabelReasoning",
      status: next?.stage === "reasoning" ? (next.status as IntelligenceFlowStage["status"]) : "partial",
      detail: next?.stage === "reasoning" ? next.nextAction : "Capture analysis",
      detailKey: next?.stage === "reasoning" ? null : "flowDetailCaptureAnalysis",
      href: "/reasoning",
    },
    {
      id: "review",
      label: "Review",
      labelKey: "flowLabelReview",
      status: byId.validation?.status ?? "missing",
      detail: reviewDetail,
      detailKey: reviewDetail === "Validate sources and consensus" ? "flowDetailValidateSources" : null,
      href: byId.validation?.href ?? "/knowledge",
    },
    {
      id: "impact",
      label: "Impact",
      labelKey: "flowLabelImpact",
      status: next?.stage === "impact" ? (next.status as IntelligenceFlowStage["status"]) : "partial",
      detail: next?.stage === "impact" ? next.nextAction : "Assess human impact",
      detailKey: next?.stage === "impact" ? null : "flowDetailAssessImpact",
      href: projectId ? `/my-work${q}#human-impact` : "/my-work",
    },
    {
      id: "publication",
      label: "Publication",
      labelKey: "flowLabelPublication",
      status: project?.reportGeneratedAt
        ? "complete"
        : readiness?.canClaimReadiness
          ? "partial"
          : "missing",
      detail: project?.reportGeneratedAt
        ? "Report generated"
        : readiness?.limitation ?? "Complete review before publication",
      detailKey: project?.reportGeneratedAt
        ? "flowDetailReportGenerated"
        : readiness?.limitation
          ? null
          : "flowDetailCompleteReview",
      href: projectId ? `/reports${q}` : "/reports",
    },
    {
      id: "legacy",
      label: "Legacy",
      labelKey: "flowLabelLegacy",
      status: legacy.artifacts.length > 0 ? "complete" : "missing",
      detail: legacy.summary ?? `${legacy.artifacts.length} artifact(s) traceable`,
      detailKey: legacy.summary ? null : "flowDetailArtifactsTraceable",
      detailParams: legacy.summary ? undefined : { count: String(legacy.artifacts.length) },
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
