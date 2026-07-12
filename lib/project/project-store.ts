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
import { getSyncedCloudUserId } from "@/lib/supabase/cloud-session-sync";
import { enqueueSync } from "@/lib/supabase/outbox";

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
// Cloud sync (Real Supabase Authentication + Cloud Persistence mission) — every mutation below
// keeps writing to localStorage exactly as before (Local Mode is unchanged), and additionally
// enqueues a real background cloud write here whenever a cloud session exists. See
// lib/supabase/outbox.ts for the queue/retry engine and supabase/migrations/0001_init_schema.sql
// for the row shapes these payloads match.
// ---------------------------------------------------------------------------

function syncProjectRow(project: Project): void {
  const ownerId = getSyncedCloudUserId();
  if (!ownerId) return;
  enqueueSync(ownerId, "projects", "upsert", project.id, {
    owner_id: ownerId,
    local_id: project.id,
    title: project.title,
    project_type: project.type,
    description: project.description,
    status: project.status,
    visibility: project.visibility,
    primary_entity_kind: project.primaryEntity?.kind ?? null,
    primary_entity_id: project.primaryEntity?.id ?? null,
    primary_entity_name: project.primaryEntity?.name ?? null,
    tags: project.tags,
    research_question: project.researchQuestion ?? null,
    objectives: project.objectives ?? null,
    report_generated_at: project.reportGeneratedAt ?? null,
  });
}

function syncEntityLinkRow(link: ProjectEntityLink): void {
  const ownerId = getSyncedCloudUserId();
  if (!ownerId) return;
  const localId = `${link.projectId}:${link.entity.kind}:${link.entity.id}`;
  enqueueSync(ownerId, "project_entity_links", "upsert", localId, {
    owner_id: ownerId,
    local_id: localId,
    project_id: link.projectId,
    entity_kind: link.entity.kind,
    entity_id: link.entity.id,
    entity_name: link.entity.name,
    entity_code: link.entity.code ?? null,
    entity_country_name: link.entity.countryName ?? null,
  });
}

function syncDeleteEntityLink(projectId: string, kind: ContextEntityRef["kind"], id: string): void {
  const ownerId = getSyncedCloudUserId();
  if (!ownerId) return;
  enqueueSync(ownerId, "project_entity_links", "delete", `${projectId}:${kind}:${id}`);
}

function syncNoteRow(note: ProjectNote): void {
  const ownerId = getSyncedCloudUserId();
  if (!ownerId) return;
  enqueueSync(ownerId, "project_notes", "upsert", note.noteId, {
    owner_id: ownerId,
    local_id: note.noteId,
    project_id: note.projectId,
    body: note.body,
    linked_evidence_id: note.linkedEvidenceId ?? null,
    linked_evidence_label: note.linkedEvidenceLabel ?? null,
    linked_entity_id: note.linkedEntityId ?? null,
    linked_entity_name: note.linkedEntityName ?? null,
    linked_entity_type: note.linkedEntityType ?? null,
  });
}

function syncTaskRow(task: ProjectTask): void {
  const ownerId = getSyncedCloudUserId();
  if (!ownerId) return;
  enqueueSync(ownerId, "project_tasks", "upsert", task.taskId, {
    owner_id: ownerId,
    local_id: task.taskId,
    project_id: task.projectId,
    title: task.title,
    status: task.status,
  });
}

function syncQuestionRow(question: ProjectQuestion): void {
  const ownerId = getSyncedCloudUserId();
  if (!ownerId) return;
  enqueueSync(ownerId, "project_questions", "upsert", question.questionId, {
    owner_id: ownerId,
    local_id: question.questionId,
    project_id: question.projectId,
    question: question.question,
    resolved: question.resolved,
    resolved_at: question.resolvedAt ?? null,
  });
}

function syncEvidenceRow(evidence: ProjectEvidenceReference): void {
  const ownerId = getSyncedCloudUserId();
  if (!ownerId) return;
  enqueueSync(ownerId, "project_evidence", "upsert", evidence.evidenceRefId, {
    owner_id: ownerId,
    local_id: evidence.evidenceRefId,
    project_id: evidence.projectId,
    title: evidence.title,
    source_url: evidence.sourceUrl ?? null,
    linked_entity_id: evidence.linkedEntityId ?? null,
    linked_entity_name: evidence.linkedEntityName ?? null,
  });
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
  syncProjectRow(project);
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
  syncProjectRow(updated);
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
  const link: ProjectEntityLink = { projectId, entity };
  writeList(PROJECT_ENTITIES_KEY, [...all, link]);
  syncEntityLinkRow(link);
}

export function unlinkEntityFromProject(projectId: string, kind: ContextEntityRef["kind"], id: string): void {
  const all = readList(PROJECT_ENTITIES_KEY, isProjectEntityLink);
  const next = all.filter((link) => !(link.projectId === projectId && link.entity.kind === kind && link.entity.id === id));
  writeList(PROJECT_ENTITIES_KEY, next);
  syncDeleteEntityLink(projectId, kind, id);
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
  syncNoteRow(note);
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
  syncTaskRow(task);
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
  syncTaskRow(updated);
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
  syncQuestionRow(record);
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
  syncQuestionRow(updated);
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
  syncEvidenceRow(record);
  return record;
}

export const NO_PROJECTS_NOTE =
  "No projects created yet — no fabricated activity, create the first one below.";
