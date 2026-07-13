/**
 * Real Project catalog translation (Platform Activation mission — "Close the final documented
 * product gaps," Task 2). `lib/project/project-types.ts`'s PROJECT_TYPES/PROJECT_STATUS_LABELS/
 * PROJECT_VISIBILITY_LABELS/PROJECT_TASK_STATUS_LABELS stay exactly as they are — the real,
 * English source-of-truth ids and English fallback labels every non-component consumer (reports,
 * search, tests) already depends on. This file only adds a real translation lookup for the
 * component-level UI that renders those labels to a user, mirroring the same href-keyed pattern
 * lib/i18n/nav-translation.ts already established for navigation. English is the honest fallback
 * whenever a real dictionary key is somehow missing.
 */

import type {
  ProjectTypeId,
  ProjectStatus,
  ProjectVisibility,
  ProjectTaskStatus,
} from "@/lib/project/project-types";

type TFunc = (path: string, vars?: Record<string, string>) => string;

const PROJECT_TYPE_KEYS: Record<ProjectTypeId, string> = {
  research_project: "researchProject",
  country_analysis: "countryAnalysis",
  company_analysis: "companyAnalysis",
  university_study: "universityStudy",
  policy_analysis: "policyAnalysis",
  investment_analysis: "investmentAnalysis",
  technology_assessment: "technologyAssessment",
  evidence_review: "evidenceReview",
};

// t() (lib/i18n/translate.ts) already falls back to the English dictionary, then to the dotted
// key itself, for any path — so no second fallback is needed here.
export function translateProjectTypeLabel(t: TFunc, id: ProjectTypeId): string {
  return t(`project.types.${PROJECT_TYPE_KEYS[id]}.label`);
}

export function translateProjectTypeDescription(t: TFunc, id: ProjectTypeId): string {
  return t(`project.types.${PROJECT_TYPE_KEYS[id]}.description`);
}

export function translateProjectStatus(t: TFunc, status: ProjectStatus): string {
  return t(`project.status.${status}`);
}

export function translateProjectVisibility(t: TFunc, visibility: ProjectVisibility): string {
  return t(`project.visibility.${visibility}`);
}

const PROJECT_TASK_STATUS_KEYS: Record<ProjectTaskStatus, string> = {
  todo: "todo",
  in_progress: "inProgress",
  done: "done",
};

export function translateProjectTaskStatus(t: TFunc, status: ProjectTaskStatus): string {
  return t(`project.taskStatus.${PROJECT_TASK_STATUS_KEYS[status]}`);
}
