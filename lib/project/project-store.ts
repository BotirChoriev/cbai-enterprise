/**
 * Project Engine — real local persistence, following the exact pattern already proven by
 * lib/context/context-history.ts and lib/research/research-workspace-store.ts (isBrowser guard,
 * one JSON blob per localStorage key, sanitize-on-read, never throws).
 *
 * Every key is now real-user-namespaced (Authentication + User Platform Foundation mission) via
 * resolveStorageKey — a signed-in user's Projects live under their own key; signed out, everyone
 * shares the same `:local` bucket every existing user's data already migrates into automatically.
 * No shape change, no duplicated storage — only the raw key string differs.
 */

import type {
  Project,
  ProjectNote,
  ProjectTask,
  ProjectTaskStatus,
  ProjectQuestion,
  ProjectEvidenceReference,
  ProjectTypeId,
  ProjectVisibility,
  ProjectStatus,
} from "@/lib/project/project-types";
import { PROJECT_TYPES } from "@/lib/project/project-types";
import type { ContextEntityRef } from "@/lib/context/context-types";
import { resolveStorageKey } from "@/lib/storage/namespaced-key";

const PROJECTS_KEY = "cbai-projects";
const PROJECT_ENTITIES_KEY = "cbai-project-entities";
const PROJECT_NOTES_KEY = "cbai-project-notes";
const PROJECT_TASKS_KEY = "cbai-project-tasks";
const PROJECT_QUESTIONS_KEY = "cbai-project-questions";
const PROJECT_EVIDENCE_KEY = "cbai-project-evidence-refs";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function readList<T>(key: string, isValid: (value: unknown) => value is T): T[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(resolveStorageKey(key));
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValid);
  } catch {
    return [];
  }
}

function writeList<T>(key: string, items: readonly T[]): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(resolveStorageKey(key), JSON.stringify(items));
}

function newId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------

const REAL_PROJECT_TYPE_IDS = new Set(PROJECT_TYPES.map((t) => t.id));

function isProject(value: unknown): value is Project {
  const v = value as Project;
  return (
    typeof v === "object" &&
    v !== null &&
    typeof v.id === "string" &&
    typeof v.title === "string" &&
    REAL_PROJECT_TYPE_IDS.has(v.type) &&
    typeof v.description === "string" &&
    Array.isArray(v.tags) &&
    (v.visibility === "private" || v.visibility === "team" || v.visibility === "public") &&
    (v.status === "active" || v.status === "paused" || v.status === "completed" || v.status === "archived") &&
    typeof v.createdAt === "string" &&
    typeof v.updatedAt === "string"
  );
}

export function loadProjects(): Project[] {
  return readList(PROJECTS_KEY, isProject).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function loadProject(id: string): Project | null {
  return loadProjects().find((p) => p.id === id) ?? null;
}

export type CreateProjectInput = {
  title: string;
  type: ProjectTypeId;
  description: string;
  primaryEntity?: ContextEntityRef;
  tags: string[];
  visibility: ProjectVisibility;
  status: ProjectStatus;
  researchQuestion?: string;
  objectives?: string;
};

export function createProject(input: CreateProjectInput): Project {
  const now = new Date().toISOString();
  const project: Project = { ...input, id: newId("project"), createdAt: now, updatedAt: now };
  const all = loadProjects();
  writeList(PROJECTS_KEY, [...all, project]);
  if (input.primaryEntity) {
    linkEntityToProject(project.id, input.primaryEntity);
  }
  return project;
}

export function updateProject(id: string, patch: Partial<Omit<Project, "id" | "createdAt">>): Project | null {
  const all = loadProjects();
  const index = all.findIndex((p) => p.id === id);
  if (index === -1) return null;
  const updated: Project = { ...all[index], ...patch, updatedAt: new Date().toISOString() };
  const next = [...all];
  next[index] = updated;
  writeList(PROJECTS_KEY, next);
  return updated;
}

/** Real, user-caused event — only ever set by an actual "Generate report" click, never assumed. */
export function markProjectReportGenerated(id: string): Project | null {
  return updateProject(id, { reportGeneratedAt: new Date().toISOString() });
}

// ---------------------------------------------------------------------------
// Project <-> Entity links (Related Entities, via the Universal Entity Engine)
// ---------------------------------------------------------------------------

type ProjectEntityLink = { projectId: string; entity: ContextEntityRef };

function isProjectEntityLink(value: unknown): value is ProjectEntityLink {
  const v = value as ProjectEntityLink;
  return (
    typeof v === "object" &&
    v !== null &&
    typeof v.projectId === "string" &&
    typeof v.entity === "object" &&
    v.entity !== null &&
    typeof v.entity.id === "string" &&
    typeof v.entity.name === "string"
  );
}

export function loadProjectEntities(projectId: string): ContextEntityRef[] {
  return readList(PROJECT_ENTITIES_KEY, isProjectEntityLink)
    .filter((link) => link.projectId === projectId)
    .map((link) => link.entity);
}

export function linkEntityToProject(projectId: string, entity: ContextEntityRef): void {
  const all = readList(PROJECT_ENTITIES_KEY, isProjectEntityLink);
  const exists = all.some(
    (link) => link.projectId === projectId && link.entity.kind === entity.kind && link.entity.id === entity.id,
  );
  if (exists) return;
  writeList(PROJECT_ENTITIES_KEY, [...all, { projectId, entity }]);
}

export function unlinkEntityFromProject(projectId: string, kind: ContextEntityRef["kind"], id: string): void {
  const all = readList(PROJECT_ENTITIES_KEY, isProjectEntityLink);
  const next = all.filter((link) => !(link.projectId === projectId && link.entity.kind === kind && link.entity.id === id));
  writeList(PROJECT_ENTITIES_KEY, next);
}

/** Reverse lookup — real Projects that link to a given real entity, for that entity's own Related panel. */
export function getProjectsLinkedToEntity(kind: ContextEntityRef["kind"], id: string): Project[] {
  const links = readList(PROJECT_ENTITIES_KEY, isProjectEntityLink).filter(
    (link) => link.entity.kind === kind && link.entity.id === id,
  );
  const projectIds = new Set(links.map((link) => link.projectId));
  return loadProjects().filter((p) => projectIds.has(p.id));
}

// ---------------------------------------------------------------------------
// Notes
// ---------------------------------------------------------------------------

function isProjectNote(value: unknown): value is ProjectNote {
  const v = value as ProjectNote;
  return (
    typeof v === "object" &&
    v !== null &&
    typeof v.noteId === "string" &&
    typeof v.projectId === "string" &&
    typeof v.body === "string" &&
    typeof v.createdAt === "string"
  );
}

export function loadProjectNotes(projectId: string): ProjectNote[] {
  return readList(PROJECT_NOTES_KEY, isProjectNote)
    .filter((n) => n.projectId === projectId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function saveProjectNote(input: Omit<ProjectNote, "noteId" | "createdAt">): ProjectNote {
  const all = readList(PROJECT_NOTES_KEY, isProjectNote);
  const note: ProjectNote = { ...input, noteId: newId("pnote"), createdAt: new Date().toISOString() };
  writeList(PROJECT_NOTES_KEY, [...all, note]);
  return note;
}

// ---------------------------------------------------------------------------
// Tasks
// ---------------------------------------------------------------------------

function isProjectTask(value: unknown): value is ProjectTask {
  const v = value as ProjectTask;
  return (
    typeof v === "object" &&
    v !== null &&
    typeof v.taskId === "string" &&
    typeof v.projectId === "string" &&
    typeof v.title === "string" &&
    (v.status === "todo" || v.status === "in_progress" || v.status === "done") &&
    typeof v.createdAt === "string"
  );
}

export function loadProjectTasks(projectId: string): ProjectTask[] {
  return readList(PROJECT_TASKS_KEY, isProjectTask)
    .filter((t) => t.projectId === projectId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function createProjectTask(projectId: string, title: string): ProjectTask {
  const all = readList(PROJECT_TASKS_KEY, isProjectTask);
  const now = new Date().toISOString();
  const task: ProjectTask = { taskId: newId("task"), projectId, title, status: "todo", createdAt: now, updatedAt: now };
  writeList(PROJECT_TASKS_KEY, [...all, task]);
  return task;
}

export function setProjectTaskStatus(taskId: string, status: ProjectTaskStatus): ProjectTask | null {
  const all = readList(PROJECT_TASKS_KEY, isProjectTask);
  const index = all.findIndex((t) => t.taskId === taskId);
  if (index === -1) return null;
  const updated: ProjectTask = { ...all[index], status, updatedAt: new Date().toISOString() };
  const next = [...all];
  next[index] = updated;
  writeList(PROJECT_TASKS_KEY, next);
  return updated;
}

// ---------------------------------------------------------------------------
// Open Questions
// ---------------------------------------------------------------------------

function isProjectQuestion(value: unknown): value is ProjectQuestion {
  const v = value as ProjectQuestion;
  return (
    typeof v === "object" &&
    v !== null &&
    typeof v.questionId === "string" &&
    typeof v.projectId === "string" &&
    typeof v.question === "string" &&
    typeof v.resolved === "boolean" &&
    typeof v.createdAt === "string"
  );
}

export function loadProjectQuestions(projectId: string): ProjectQuestion[] {
  return readList(PROJECT_QUESTIONS_KEY, isProjectQuestion)
    .filter((q) => q.projectId === projectId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function createProjectQuestion(projectId: string, question: string): ProjectQuestion {
  const all = readList(PROJECT_QUESTIONS_KEY, isProjectQuestion);
  const record: ProjectQuestion = { questionId: newId("pq"), projectId, question, resolved: false, createdAt: new Date().toISOString() };
  writeList(PROJECT_QUESTIONS_KEY, [...all, record]);
  return record;
}

export function resolveProjectQuestion(questionId: string): ProjectQuestion | null {
  const all = readList(PROJECT_QUESTIONS_KEY, isProjectQuestion);
  const index = all.findIndex((q) => q.questionId === questionId);
  if (index === -1) return null;
  const updated: ProjectQuestion = { ...all[index], resolved: true, resolvedAt: new Date().toISOString() };
  const next = [...all];
  next[index] = updated;
  writeList(PROJECT_QUESTIONS_KEY, next);
  return updated;
}

// ---------------------------------------------------------------------------
// Evidence references (real, user-authored — never auto-fabricated evidence)
// ---------------------------------------------------------------------------

function isProjectEvidenceReference(value: unknown): value is ProjectEvidenceReference {
  const v = value as ProjectEvidenceReference;
  return (
    typeof v === "object" &&
    v !== null &&
    typeof v.evidenceRefId === "string" &&
    typeof v.projectId === "string" &&
    typeof v.title === "string" &&
    typeof v.createdAt === "string"
  );
}

export function loadProjectEvidence(projectId: string): ProjectEvidenceReference[] {
  return readList(PROJECT_EVIDENCE_KEY, isProjectEvidenceReference)
    .filter((e) => e.projectId === projectId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function saveProjectEvidence(input: Omit<ProjectEvidenceReference, "evidenceRefId" | "createdAt">): ProjectEvidenceReference {
  const all = readList(PROJECT_EVIDENCE_KEY, isProjectEvidenceReference);
  const record: ProjectEvidenceReference = { ...input, evidenceRefId: newId("pev"), createdAt: new Date().toISOString() };
  writeList(PROJECT_EVIDENCE_KEY, [...all, record]);
  return record;
}

export const NO_PROJECTS_NOTE =
  "No projects created yet — no fabricated activity, create the first one below.";
