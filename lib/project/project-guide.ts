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
import en from "@/lib/i18n/dictionaries/en";
import { translate, interpolate } from "@/lib/i18n/translate";

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

export type ProjectGuideTranslator = (path: string, vars?: Record<string, string>) => string;

/** Default translator — the real English dictionary, so every existing caller that doesn't pass
 * a live `t()` (ProjectList, ProjectGuidePanel, ContextualOperatorBanner, project-commands,
 * scripts/test-intelligence-guide.ts) keeps getting the exact same English strings this function
 * always returned, unchanged. */
const defaultTranslate: ProjectGuideTranslator = (path, vars) => {
  const raw = translate(en, path);
  return vars ? interpolate(raw, vars) : raw;
};

export function resolveProjectGuideStep(
  project: Project,
  t: ProjectGuideTranslator = defaultTranslate,
): ProjectGuideStep {
  const base = `/my-work?project=${project.id}`;

  if (!project.researchQuestion?.trim()) {
    return {
      id: "add_question",
      suggestion: t("projectGuide.addQuestionSuggestion"),
      detail: t("projectGuide.addQuestionDetail"),
      href: `${base}#project-question`,
    };
  }

  if (!project.objectives?.trim()) {
    return {
      id: "define_objectives",
      suggestion: t("projectGuide.defineObjectivesSuggestion"),
      detail: t("projectGuide.defineObjectivesDetail"),
      href: `${base}#project-objectives`,
    };
  }

  if (loadProjectEvidence(project.id).length === 0) {
    return {
      id: "collect_evidence",
      suggestion: t("projectGuide.collectEvidenceSuggestion"),
      detail: t("projectGuide.collectEvidenceDetail"),
      href: `${base}#project-evidence`,
    };
  }

  if (loadProjectEntities(project.id).length === 0) {
    return {
      id: "link_entity",
      suggestion: t("projectGuide.linkEntitySuggestion"),
      detail: t("projectGuide.linkEntityDetail"),
      href: `${base}#project-entities`,
    };
  }

  if (loadProjectNotes(project.id).length === 0) {
    return {
      id: "document_findings",
      suggestion: t("projectGuide.documentFindingsSuggestion"),
      detail: t("projectGuide.documentFindingsDetail"),
      href: `${base}#project-notes`,
    };
  }

  if (!project.reportGeneratedAt) {
    return {
      id: "generate_report",
      suggestion: t("projectGuide.generateReportSuggestion"),
      detail: t("projectGuide.generateReportDetail"),
      href: `${base}#project-report`,
    };
  }

  return {
    id: "ready",
    suggestion: t("projectGuide.readySuggestion"),
    detail: t("projectGuide.readyDetail"),
    href: base,
  };
}
