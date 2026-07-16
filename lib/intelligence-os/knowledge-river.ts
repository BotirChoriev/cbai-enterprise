/**
 * EPIC-13.4 — Knowledge River: temporal events from real mission/project data only.
 */

import { deriveEvidenceRuntime } from "@/lib/evidence-runtime/evidence-runtime";
import { deriveEvidenceValidationIssues } from "@/lib/intelligence-os/evidence-object-helpers";
import { deriveLegacyTrail } from "@/lib/intelligence-os/legacy-trail";
import { deriveReportReadiness } from "@/lib/intelligence-os/report-readiness";
import { loadHumanImpactForMission } from "@/lib/intelligence-os/human-impact-store";
import type { Mission } from "@/lib/intelligence-os/mission.types";
import {
  loadProjectQuestions,
  loadProjects,
} from "@/lib/project/project-store";

export type KnowledgeRiverEventKind =
  | "evidence_added"
  | "evidence_reviewed"
  | "freshness_changed"
  | "conflict_found"
  | "question_resolved"
  | "impact_updated"
  | "report_readiness_changed"
  | "legacy_created";

export type KnowledgeRiverEvent = {
  readonly id: string;
  readonly kind: KnowledgeRiverEventKind;
  readonly label: string;
  readonly detail: string;
  readonly occurredAt: string;
  readonly cause: string;
  readonly missionStage: string | null;
  readonly unresolved: boolean;
  readonly href: string | null;
};

export function deriveKnowledgeRiver(mission: Mission | null): readonly KnowledgeRiverEvent[] {
  if (!mission?.projectId) {
    const legacy = deriveLegacyTrail(mission);
    if (legacy.artifacts.length === 0) return [];
    return legacy.artifacts.slice(0, 5).map((a, i) => ({
      id: `legacy-${i}`,
      kind: "legacy_created" as const,
      label: a.label,
      detail: a.detail,
      occurredAt: mission?.updatedAt ?? new Date().toISOString(),
      cause: "Derived from stored mission artifacts",
      missionStage: "legacy",
      unresolved: false,
      href: "/",
    }));
  }

  const events: KnowledgeRiverEvent[] = [];
  const projectId = mission.projectId;
  const runtime = deriveEvidenceRuntime(mission, projectId);
  const impact = loadHumanImpactForMission(mission.id);
  const readiness = deriveReportReadiness(projectId);
  const project = loadProjects().find((p) => p.id === projectId);

  for (const record of runtime.records) {
    events.push({
      id: `ev-${record.evidence.evidenceId}`,
      kind: "evidence_added",
      label: "Evidence linked",
      detail: record.evidence.label,
      occurredAt: project?.updatedAt ?? mission.updatedAt,
      cause: "User linked reference to project",
      missionStage: "evidence",
      unresolved: deriveEvidenceValidationIssues(record).length > 0,
      href: `/my-work?project=${projectId}#project-evidence`,
    });
    if (record.freshness === "outdated" || record.freshness === "aging") {
      events.push({
        id: `fresh-${record.evidence.evidenceId}`,
        kind: "freshness_changed",
        label: "Freshness state",
        detail: `${record.freshness}: ${record.evidence.label}`,
        occurredAt: project?.updatedAt ?? mission.updatedAt,
        cause: "Age threshold from evidence record timestamp",
        missionStage: "review",
        unresolved: record.freshness === "outdated",
        href: "/knowledge",
      });
    }
  }

  for (const conflict of runtime.conflicts) {
    events.push({
      id: `conflict-${conflict.left}-${conflict.right}`,
      kind: "conflict_found",
      label: "Potential conflict",
      detail: `${conflict.left} ↔ ${conflict.right}`,
      occurredAt: mission.updatedAt,
      cause: "Evidence comparison detected disagreement",
      missionStage: "review",
      unresolved: true,
      href: "/knowledge",
    });
  }

  for (const q of loadProjectQuestions(projectId)) {
    events.push({
      id: `q-${q.questionId}`,
      kind: q.resolved ? "question_resolved" : "evidence_reviewed",
      label: q.resolved ? "Question resolved" : "Open question",
      detail: q.question,
      occurredAt: q.createdAt,
      cause: "Project question record",
      missionStage: "reasoning",
      unresolved: !q.resolved,
      href: `/my-work?project=${projectId}#project-questions`,
    });
  }

  if (impact) {
    events.push({
      id: `impact-${mission.id}`,
      kind: "impact_updated",
      label: impact.isComplete ? "Impact reviewed" : "Impact draft",
      detail: impact.isComplete ? "Human impact assessment complete" : "Impact review in progress",
      occurredAt: impact.updatedAt ?? mission.updatedAt,
      cause: "Human impact store",
      missionStage: "impact",
      unresolved: !impact.isComplete,
      href: `/my-work?project=${projectId}#human-impact`,
    });
  }

  if (readiness) {
    events.push({
      id: `report-${projectId}`,
      kind: "report_readiness_changed",
      label: readiness.canClaimReadiness ? "Report readiness met" : "Report not ready",
      detail: readiness.limitation ?? "Readiness criteria evaluated",
      occurredAt: project?.updatedAt ?? mission.updatedAt,
      cause: "Report readiness derivation",
      missionStage: "publication",
      unresolved: !readiness.canClaimReadiness,
      href: `/reports?project=${projectId}`,
    });
  }

  events.sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
  return events.slice(0, 12);
}
