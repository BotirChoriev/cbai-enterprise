/**
 * Legacy Trail — derives reusable knowledge from real stored mission artifacts.
 * EPIC-02 / EPIC-11 foundation. No fabricated legacy entries.
 */

import { loadHumanImpactForMission } from "@/lib/intelligence-os/human-impact-store";
import type { Mission } from "@/lib/intelligence-os/mission.types";
import {
  loadProjectEvidence,
  loadProjectNotes,
  loadProjectQuestions,
  loadProjects,
} from "@/lib/project/project-store";

export type LegacyArtifactKind =
  | "mission"
  | "question"
  | "evidence"
  | "note"
  | "methodology"
  | "impact"
  | "decision";

export type LegacyArtifact = {
  readonly kind: LegacyArtifactKind;
  readonly label: string;
  readonly detail: string;
  readonly sourceId?: string;
};

export type LegacyTrailResult = {
  readonly artifacts: readonly LegacyArtifact[];
  readonly isEmpty: boolean;
  readonly summary: string | null;
};

function resolveProject(mission: Mission) {
  if (mission.projectId) {
    return loadProjects().find((p) => p.id === mission.projectId) ?? null;
  }
  return loadProjects().find((p) => p.title === mission.problem || p.researchQuestion === mission.problem) ?? null;
}

export function deriveLegacyTrail(mission: Mission | null): LegacyTrailResult {
  if (!mission) {
    return { artifacts: [], isEmpty: true, summary: null };
  }

  const artifacts: LegacyArtifact[] = [];
  const project = resolveProject(mission);

  if (mission.problem.trim()) {
    artifacts.push({
      kind: "mission",
      label: "Mission problem",
      detail: mission.problem,
      sourceId: mission.id,
    });
  }

  if (mission.successCriteria.trim()) {
    artifacts.push({
      kind: "methodology",
      label: "Success criteria",
      detail: mission.successCriteria,
      sourceId: mission.id,
    });
  }

  if (project) {
    for (const q of loadProjectQuestions(project.id)) {
      artifacts.push({
        kind: "question",
        label: "Open question",
        detail: q.question,
        sourceId: q.questionId,
      });
    }

    for (const ref of loadProjectEvidence(project.id)) {
      artifacts.push({
        kind: "evidence",
        label: ref.title || "Evidence reference",
        detail: ref.sourceUrl?.trim() || "Linked reference — add source URL for verification.",
        sourceId: ref.evidenceRefId,
      });
    }

    for (const note of loadProjectNotes(project.id)) {
      artifacts.push({
        kind: "note",
        label: "Analysis note",
        detail: note.body.slice(0, 200) + (note.body.length > 200 ? "…" : ""),
        sourceId: note.noteId,
      });
    }
  }

  const impact = loadHumanImpactForMission(mission.id);
  if (impact?.humanBenefit.trim()) {
    artifacts.push({
      kind: "impact",
      label: "Intended human benefit",
      detail: impact.humanBenefit,
      sourceId: mission.id,
    });
  }

  if (impact?.mitigation.trim()) {
    artifacts.push({
      kind: "decision",
      label: "Mitigation recorded",
      detail: impact.mitigation,
      sourceId: mission.id,
    });
  }

  if (mission.evidenceMissing.trim()) {
    artifacts.push({
      kind: "methodology",
      label: "Documented knowledge gap",
      detail: mission.evidenceMissing,
      sourceId: mission.id,
    });
  }

  const isEmpty = artifacts.length === 0;
  const summary = isEmpty
    ? null
    : `${artifacts.length} reusable artifact${artifacts.length === 1 ? "" : "s"} from this mission's stored work.`;

  return { artifacts, isEmpty, summary };
}
