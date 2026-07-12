/**
 * Project Progress — calculated only from real completed work, never a fabricated percentage.
 * Six deterministic, boolean checks (mirroring the pattern already proven by
 * lib/research/readiness/readiness-engine.ts's milestone-count approach): each either did or
 * did not happen, based on real stored data.
 */

import type { Project } from "@/lib/project/project-types";
import {
  loadProjectEntities,
  loadProjectNotes,
  loadProjectEvidence,
} from "@/lib/project/project-store";

export type ProjectProgressMilestoneId =
  | "question_defined"
  | "objectives_written"
  | "evidence_added"
  | "notes_created"
  | "entities_linked"
  | "report_generated";

export type ProjectProgressMilestone = {
  id: ProjectProgressMilestoneId;
  label: string;
  achieved: boolean;
};

export type ProjectProgress = {
  milestones: readonly ProjectProgressMilestone[];
  completedCount: number;
  totalCount: number;
};

/**
 * `project.reportGeneratedAt` is a real, persisted timestamp — only ever set by an actual
 * "Generate report" click (see markProjectReportGenerated) — so report progress survives across
 * sessions, unlike an ephemeral React flag would.
 */
export function deriveProjectProgress(project: Project): ProjectProgress {
  const entities = loadProjectEntities(project.id);
  const notes = loadProjectNotes(project.id);
  const evidence = loadProjectEvidence(project.id);

  const milestones: ProjectProgressMilestone[] = [
    { id: "question_defined", label: "Research question defined", achieved: Boolean(project.researchQuestion?.trim()) },
    { id: "objectives_written", label: "Objectives written", achieved: Boolean(project.objectives?.trim()) },
    { id: "evidence_added", label: "Evidence added", achieved: evidence.length > 0 },
    { id: "notes_created", label: "Notes created", achieved: notes.length > 0 },
    { id: "entities_linked", label: "Entities linked", achieved: entities.length > 0 },
    { id: "report_generated", label: "Report generated", achieved: Boolean(project.reportGeneratedAt) },
  ];

  return {
    milestones,
    completedCount: milestones.filter((m) => m.achieved).length,
    totalCount: milestones.length,
  };
}
