/**
 * Intelligence Guide — the platform's one real "next best action" for a Project (Intelligence
 * Guide Activation mission). A pure function over already-real, already-persisted Project state:
 * no model call, no reasoning engine, no fabricated task. Checked in exactly the mission's order —
 * Research Question, Objectives, Evidence, Related Entities, Notes, Report — six of the same real
 * signals lib/project/project-health.ts already tracks, reused here rather than duplicated.
 *
 * The Guide only ever suggests, never orders: no step is phrased as "required" or "must."
 */

import type { Project } from "@/lib/project/project-types";
import { loadProjectEntities, loadProjectNotes, loadProjectEvidence } from "@/lib/project/project-store";

export type ProjectGuideStepId =
  | "add_question"
  | "define_objectives"
  | "collect_evidence"
  | "link_entity"
  | "document_findings"
  | "generate_report"
  | "ready";

export type ProjectGuideStep = {
  id: ProjectGuideStepId;
  suggestion: string;
  detail: string;
  href: string;
};

export function resolveProjectGuideStep(project: Project): ProjectGuideStep {
  const base = `/my-work?project=${project.id}`;

  if (!project.researchQuestion?.trim()) {
    return {
      id: "add_question",
      suggestion: "Add your Research Question",
      detail: "A clear question focuses everything else you add to this project.",
      href: `${base}#project-question`,
    };
  }

  if (!project.objectives?.trim()) {
    return {
      id: "define_objectives",
      suggestion: "Define Project Objectives",
      detail: "Objectives describe what this project needs to accomplish.",
      href: `${base}#project-objectives`,
    };
  }

  if (loadProjectEvidence(project.id).length === 0) {
    return {
      id: "collect_evidence",
      suggestion: "Collect your first Evidence",
      detail: "Start by adding one verified source.",
      href: `${base}#project-evidence`,
    };
  }

  if (loadProjectEntities(project.id).length === 0) {
    return {
      id: "link_entity",
      suggestion: "Link a related Country, Company or University",
      detail: "Connect this project to the real entities it's about.",
      href: `${base}#project-entities`,
    };
  }

  if (loadProjectNotes(project.id).length === 0) {
    return {
      id: "document_findings",
      suggestion: "Document your findings",
      detail: "Notes capture what you've learned so far, in your own words.",
      href: `${base}#project-notes`,
    };
  }

  if (!project.reportGeneratedAt) {
    return {
      id: "generate_report",
      suggestion: "Generate your first Report",
      detail: "Assemble everything you've gathered so far into one real report.",
      href: `${base}#project-report`,
    };
  }

  return {
    id: "ready",
    suggestion: "Every guided milestone is complete",
    detail: "Keep adding evidence, notes, and tasks whenever you're ready to continue.",
    href: base,
  };
}
