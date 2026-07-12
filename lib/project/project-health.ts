/**
 * Project Health — real signals only (Intelligence Guide Activation mission). Deliberately not a
 * score or a percentage: eight real, independently-readable facts about a Project, each either a
 * boolean or a real count from already-persisted state. Never invents or infers a value.
 */

import type { Project } from "@/lib/project/project-types";
import {
  loadProjectEntities,
  loadProjectNotes,
  loadProjectEvidence,
  loadProjectTasks,
  loadProjectQuestions,
} from "@/lib/project/project-store";

export type ProjectHealth = {
  questionExists: boolean;
  objectivesExist: boolean;
  evidenceCount: number;
  notesCount: number;
  entityLinksCount: number;
  reportGenerated: boolean;
  tasksCount: number;
  tasksDoneCount: number;
  openQuestionsCount: number;
};

export function deriveProjectHealth(project: Project): ProjectHealth {
  const tasks = loadProjectTasks(project.id);
  const questions = loadProjectQuestions(project.id);

  return {
    questionExists: Boolean(project.researchQuestion?.trim()),
    objectivesExist: Boolean(project.objectives?.trim()),
    evidenceCount: loadProjectEvidence(project.id).length,
    notesCount: loadProjectNotes(project.id).length,
    entityLinksCount: loadProjectEntities(project.id).length,
    reportGenerated: Boolean(project.reportGeneratedAt),
    tasksCount: tasks.length,
    tasksDoneCount: tasks.filter((t) => t.status === "done").length,
    openQuestionsCount: questions.filter((q) => !q.resolved).length,
  };
}
