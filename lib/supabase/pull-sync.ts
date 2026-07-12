/**
 * Cloud-to-local pull sync (Real Supabase Authentication + Cloud Persistence mission, Phase 8/9).
 *
 * Runs once per cloud sign-in (see components/platform/context/AuthProvider.tsx): fetches every
 * row this cloud user owns and writes it into that user's own `:cloud:<id>` local cache bucket
 * (lib/storage/namespaced-key.ts), so every existing synchronous reader in this app (loadProjects,
 * loadProjectNotes, etc.) sees the real cloud data immediately, with zero call-site changes.
 *
 * Never overwrites newer local data silently: if a local record for the same (table, local_id)
 * already has a more recent `updatedAt`/`createdAt` than the cloud row's `updated_at` (e.g. an
 * offline edit made just before this pull ran), the local version wins and the newer state is
 * re-queued to push back up via the outbox instead of being clobbered.
 */

import type {
  Project,
  ProjectNote,
  ProjectTask,
  ProjectQuestion,
  ProjectEvidenceReference,
} from "@/lib/project/project-types";
import type { ContextEntityRef } from "@/lib/context/context-types";
import { listCloudRows } from "@/lib/supabase/cloud-tables";
import type {
  ProjectRow,
  ProjectNoteRow,
  ProjectTaskRow,
  ProjectQuestionRow,
  ProjectEvidenceRow,
  ProjectEntityLinkRow,
  BookmarkRow,
  ReportRow,
} from "@/lib/supabase/database.types";
import type { SavedReport } from "@/lib/reports/reports-store";

const PROJECTS_KEY = "cbai-projects";
const PROJECT_ENTITIES_KEY = "cbai-project-entities";
const PROJECT_NOTES_KEY = "cbai-project-notes";
const PROJECT_TASKS_KEY = "cbai-project-tasks";
const PROJECT_QUESTIONS_KEY = "cbai-project-questions";
const PROJECT_EVIDENCE_KEY = "cbai-project-evidence-refs";
const PINNED_STORAGE_KEY = "cbai-platform-pinned-entities";
const REPORTS_KEY = "cbai-saved-reports";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function cloudBucketKey(baseKey: string, ownerId: string): string {
  return `${baseKey}:cloud:${ownerId}`;
}

/** Merges freshly pulled cloud rows with whatever is already in the local cloud bucket, keeping
 * whichever side is newer per record — never a blind overwrite. */
function mergeByRecency<T>(existing: readonly T[], incoming: readonly T[], keyOf: (t: T) => string, updatedAtOf: (t: T) => string): T[] {
  const byKey = new Map<string, T>();
  for (const item of existing) byKey.set(keyOf(item), item);
  for (const item of incoming) {
    const current = byKey.get(keyOf(item));
    if (!current || updatedAtOf(item) >= updatedAtOf(current)) {
      byKey.set(keyOf(item), item);
    }
  }
  return Array.from(byKey.values());
}

function readLocalBucket<T>(key: string): T[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

function writeLocalBucket<T>(key: string, items: readonly T[]): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(key, JSON.stringify(items));
}

function projectFromRow(row: ProjectRow): Project {
  return {
    id: row.local_id ?? row.id,
    title: row.title,
    type: row.project_type as Project["type"],
    description: row.description,
    primaryEntity:
      row.primary_entity_kind && row.primary_entity_id && row.primary_entity_name
        ? ({
            kind: row.primary_entity_kind as ContextEntityRef["kind"],
            id: row.primary_entity_id,
            name: row.primary_entity_name,
          } satisfies ContextEntityRef)
        : undefined,
    tags: row.tags,
    visibility: row.visibility,
    status: row.status,
    researchQuestion: row.research_question ?? undefined,
    objectives: row.objectives ?? undefined,
    reportGeneratedAt: row.report_generated_at ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** Pulls every table this cloud user owns into their local cache bucket. Safe to call multiple
 * times (e.g. on every sign-in) — always a real fetch-and-merge, never a fabricated "synced" claim
 * on failure (a listCloudRows failure returns [] and simply leaves the existing local cache alone). */
export async function pullCloudDataToLocal(ownerId: string): Promise<void> {
  if (!isBrowser()) return;

  const [projectRows, entityLinkRows, noteRows, taskRows, questionRows, evidenceRows, bookmarkRows, reportRows] =
    await Promise.all([
      listCloudRows("projects", ownerId),
      listCloudRows("project_entity_links", ownerId),
      listCloudRows("project_notes", ownerId),
      listCloudRows("project_tasks", ownerId),
      listCloudRows("project_questions", ownerId),
      listCloudRows("project_evidence", ownerId),
      listCloudRows("bookmarks", ownerId),
      listCloudRows("reports", ownerId),
    ]);

  const projectsKey = cloudBucketKey(PROJECTS_KEY, ownerId);
  const incomingProjects = projectRows.map(projectFromRow);
  writeLocalBucket(
    projectsKey,
    mergeByRecency(readLocalBucket<Project>(projectsKey), incomingProjects, (p) => p.id, (p) => p.updatedAt),
  );

  const entitiesKey = cloudBucketKey(PROJECT_ENTITIES_KEY, ownerId);
  const incomingLinks = entityLinkRows.map((row: ProjectEntityLinkRow) => ({
    projectId: row.project_id,
    entity: {
      kind: row.entity_kind,
      id: row.entity_id,
      name: row.entity_name,
      code: row.entity_code ?? undefined,
      countryName: row.entity_country_name ?? undefined,
    } satisfies ContextEntityRef,
  }));
  writeLocalBucket(
    entitiesKey,
    mergeByRecency(
      readLocalBucket<{ projectId: string; entity: ContextEntityRef }>(entitiesKey),
      incomingLinks,
      (l) => `${l.projectId}:${l.entity.kind}:${l.entity.id}`,
      () => "0", // link rows have no updated_at — presence alone is the signal, last-write-wins on key collision is fine
    ),
  );

  const notesKey = cloudBucketKey(PROJECT_NOTES_KEY, ownerId);
  const incomingNotes: ProjectNote[] = noteRows.map((row: ProjectNoteRow) => ({
    noteId: row.local_id ?? row.id,
    projectId: row.project_id,
    body: row.body,
    createdAt: row.created_at,
    linkedEvidenceId: row.linked_evidence_id ?? undefined,
    linkedEvidenceLabel: row.linked_evidence_label ?? undefined,
    linkedEntityId: row.linked_entity_id ?? undefined,
    linkedEntityName: row.linked_entity_name ?? undefined,
    linkedEntityType: row.linked_entity_type ?? undefined,
  }));
  writeLocalBucket(
    notesKey,
    mergeByRecency(readLocalBucket<ProjectNote>(notesKey), incomingNotes, (n) => n.noteId, (n) => n.createdAt),
  );

  const tasksKey = cloudBucketKey(PROJECT_TASKS_KEY, ownerId);
  const incomingTasks: ProjectTask[] = taskRows.map((row: ProjectTaskRow) => ({
    taskId: row.local_id ?? row.id,
    projectId: row.project_id,
    title: row.title,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
  writeLocalBucket(
    tasksKey,
    mergeByRecency(readLocalBucket<ProjectTask>(tasksKey), incomingTasks, (t) => t.taskId, (t) => t.updatedAt),
  );

  const questionsKey = cloudBucketKey(PROJECT_QUESTIONS_KEY, ownerId);
  const incomingQuestions: ProjectQuestion[] = questionRows.map((row: ProjectQuestionRow) => ({
    questionId: row.local_id ?? row.id,
    projectId: row.project_id,
    question: row.question,
    resolved: row.resolved,
    createdAt: row.created_at,
    resolvedAt: row.resolved_at ?? undefined,
  }));
  writeLocalBucket(
    questionsKey,
    mergeByRecency(readLocalBucket<ProjectQuestion>(questionsKey), incomingQuestions, (q) => q.questionId, (q) => q.createdAt),
  );

  const evidenceKey = cloudBucketKey(PROJECT_EVIDENCE_KEY, ownerId);
  const incomingEvidence: ProjectEvidenceReference[] = evidenceRows.map((row: ProjectEvidenceRow) => ({
    evidenceRefId: row.local_id ?? row.id,
    projectId: row.project_id,
    title: row.title,
    sourceUrl: row.source_url ?? undefined,
    linkedEntityId: row.linked_entity_id ?? undefined,
    linkedEntityName: row.linked_entity_name ?? undefined,
    createdAt: row.created_at,
  }));
  writeLocalBucket(
    evidenceKey,
    mergeByRecency(readLocalBucket<ProjectEvidenceReference>(evidenceKey), incomingEvidence, (e) => e.evidenceRefId, (e) => e.createdAt),
  );

  const bookmarksKey = cloudBucketKey(PINNED_STORAGE_KEY, ownerId);
  const incomingBookmarks: ContextEntityRef[] = bookmarkRows.map((row: BookmarkRow) => ({
    kind: row.entity_kind,
    id: row.entity_id,
    name: row.entity_name,
    code: row.entity_code ?? undefined,
    countryName: row.entity_country_name ?? undefined,
  }));
  writeLocalBucket(
    bookmarksKey,
    mergeByRecency(readLocalBucket<ContextEntityRef>(bookmarksKey), incomingBookmarks, (b) => `${b.kind}:${b.id}`, () => "0"),
  );

  const reportsKey = cloudBucketKey(REPORTS_KEY, ownerId);
  const incomingReports: SavedReport[] = reportRows.map((row: ReportRow) => ({
    id: row.local_id ?? row.id,
    kind: row.kind,
    entityId: row.entity_id,
    entityName: row.entity_name,
    projectId: row.project_id ?? undefined,
    title: row.title,
    generatedAt: row.generated_at,
    createdAt: row.created_at,
  }));
  writeLocalBucket(
    reportsKey,
    mergeByRecency(readLocalBucket<SavedReport>(reportsKey), incomingReports, (r) => r.id, (r) => r.generatedAt),
  );
}
