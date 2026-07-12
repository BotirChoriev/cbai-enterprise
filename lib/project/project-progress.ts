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
 * `reportGeneratedProjectIds` is passed in rather than read from storage here — report
 * generation is a real, on-demand render (via buildEntityReport), not a persisted event, so the
 * caller (which just rendered or is about to render the report) is the only honest source for
 * "has a report been generated this session." Defaults to false — never assumed true.
 */
export function deriveProjectProgress(project: Project, reportGeneratedThisSession: boolean): ProjectProgress {
  const entities = loadProjectEntities(project.id);
  const notes = loadProjectNotes(project.id);
  const evidence = loadProjectEvidence(project.id);

  const milestones: ProjectProgressMilestone[] = [
    { id: "question_defined", label: "Research question defined", achieved: Boolean(project.researchQuestion?.trim()) },
    { id: "objectives_written", label: "Objectives written", achieved: Boolean(project.objectives?.trim()) },
    { id: "evidence_added", label: "Evidence added", achieved: evidence.length > 0 },
    { id: "notes_created", label: "Notes created", achieved: notes.length > 0 },
    { id: "entities_linked", label: "Entities linked", achieved: entities.length > 0 },
    { id: "report_generated", label: "Report generated", achieved: reportGeneratedThisSession },
  ];

  return {
    milestones,
    completedCount: milestones.filter((m) => m.achieved).length,
    totalCount: milestones.length,
  };
}
