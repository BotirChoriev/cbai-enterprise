/**
 * Local-to-cloud migration (Real Supabase Authentication + Cloud Persistence mission, Phase 8).
 *
 * A one-time, user-confirmed upload of whatever real local work already exists in this browser
 * (Projects, Notes, Tasks, Open Questions, Evidence, Related Entities, Bookmarks, saved Reports)
 * into a newly signed-in cloud account. Every write goes through the same idempotent
 * (owner_id, local_id) upsert the outbox uses (see lib/supabase/cloud-tables.ts) — running this
 * twice, or retrying after a partial failure, can never create duplicate cloud rows.
 *
 * Local data is never deleted by this module. It stays exactly where it was; the cloud copy is
 * additive. "Keep local for now" is always safe because nothing here is destructive.
 */

import { loadProjects, loadProjectEntities, loadProjectNotes, loadProjectTasks, loadProjectQuestions, loadProjectEvidence } from "@/lib/project/project-store";
import { loadPinnedEntities } from "@/lib/context/context-history";
import { loadReports } from "@/lib/reports/reports-store";
import { upsertCloudRow, type CloudWriteResult } from "@/lib/supabase/cloud-tables";

export type MigrationSummary = {
  projects: number;
  entityLinks: number;
  notes: number;
  tasks: number;
  questions: number;
  evidence: number;
  bookmarks: number;
  reports: number;
  failures: string[];
};

function migratedMarkerKey(ownerId: string): string {
  return `cbai-cloud-migrated:${ownerId}`;
}

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

/** Whether this device's local work has already been migrated to this cloud account — read before
 * showing the "Local work was found" prompt so a returning, already-migrated user is not asked
 * again every sign-in. */
export function hasMigratedToCloud(ownerId: string): boolean {
  if (!isBrowser()) return false;
  return window.localStorage.getItem(migratedMarkerKey(ownerId)) !== null;
}

function markMigrated(ownerId: string, summary: MigrationSummary): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(
    migratedMarkerKey(ownerId),
    JSON.stringify({ migratedAt: new Date().toISOString(), summary }),
  );
}

/** Real counts of what a migration would upload — shown in the "Local work was found" prompt
 * before the user decides, never a vague or invented number. */
export function detectLocalWork(): {
  projects: number;
  notes: number;
  tasks: number;
  questions: number;
  evidence: number;
  entityLinks: number;
  bookmarks: number;
  reports: number;
  isEmpty: boolean;
} {
  const projects = loadProjects();
  const notes = projects.flatMap((p) => loadProjectNotes(p.id));
  const tasks = projects.flatMap((p) => loadProjectTasks(p.id));
  const questions = projects.flatMap((p) => loadProjectQuestions(p.id));
  const evidence = projects.flatMap((p) => loadProjectEvidence(p.id));
  const entityLinks = projects.flatMap((p) => loadProjectEntities(p.id));
  const bookmarks = loadPinnedEntities();
  const reports = loadReports();

  const counts = {
    projects: projects.length,
    notes: notes.length,
    tasks: tasks.length,
    questions: questions.length,
    evidence: evidence.length,
    entityLinks: entityLinks.length,
    bookmarks: bookmarks.length,
    reports: reports.length,
  };

  return { ...counts, isEmpty: Object.values(counts).every((n) => n === 0) };
}

async function track(failures: string[], label: string, result: CloudWriteResult): Promise<boolean> {
  if (!result.ok) failures.push(`${label}: ${result.error}`);
  return result.ok;
}

/**
 * Uploads every real local record to the signed-in cloud account. Retry-safe: call this again
 * (e.g. after a partial network failure) and already-uploaded records simply upsert to the same
 * row again via their (owner_id, local_id) key — no duplicates, no data loss.
 */
export async function migrateLocalWorkToCloud(ownerId: string): Promise<MigrationSummary> {
  const summary: MigrationSummary = {
    projects: 0,
    entityLinks: 0,
    notes: 0,
    tasks: 0,
    questions: 0,
    evidence: 0,
    bookmarks: 0,
    reports: 0,
    failures: [],
  };

  const projects = loadProjects();
  for (const project of projects) {
    const ok = await track(
      summary.failures,
      `Project "${project.title}"`,
      await upsertCloudRow("projects", {
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
      }),
    );
    if (ok) summary.projects += 1;

    for (const entity of loadProjectEntities(project.id)) {
      const localId = `${project.id}:${entity.kind}:${entity.id}`;
      const linkOk = await track(
        summary.failures,
        `Related entity "${entity.name}"`,
        await upsertCloudRow("project_entity_links", {
          owner_id: ownerId,
          local_id: localId,
          project_id: project.id,
          entity_kind: entity.kind,
          entity_id: entity.id,
          entity_name: entity.name,
          entity_code: entity.code ?? null,
          entity_country_name: entity.countryName ?? null,
        }),
      );
      if (linkOk) summary.entityLinks += 1;
    }

    for (const note of loadProjectNotes(project.id)) {
      const noteOk = await track(
        summary.failures,
        `Note in "${project.title}"`,
        await upsertCloudRow("project_notes", {
          owner_id: ownerId,
          local_id: note.noteId,
          project_id: project.id,
          body: note.body,
          linked_evidence_id: note.linkedEvidenceId ?? null,
          linked_evidence_label: note.linkedEvidenceLabel ?? null,
          linked_entity_id: note.linkedEntityId ?? null,
          linked_entity_name: note.linkedEntityName ?? null,
          linked_entity_type: note.linkedEntityType ?? null,
        }),
      );
      if (noteOk) summary.notes += 1;
    }

    for (const task of loadProjectTasks(project.id)) {
      const taskOk = await track(
        summary.failures,
        `Task in "${project.title}"`,
        await upsertCloudRow("project_tasks", {
          owner_id: ownerId,
          local_id: task.taskId,
          project_id: project.id,
          title: task.title,
          status: task.status,
        }),
      );
      if (taskOk) summary.tasks += 1;
    }

    for (const question of loadProjectQuestions(project.id)) {
      const questionOk = await track(
        summary.failures,
        `Open question in "${project.title}"`,
        await upsertCloudRow("project_questions", {
          owner_id: ownerId,
          local_id: question.questionId,
          project_id: project.id,
          question: question.question,
          resolved: question.resolved,
          resolved_at: question.resolvedAt ?? null,
        }),
      );
      if (questionOk) summary.questions += 1;
    }

    for (const evidence of loadProjectEvidence(project.id)) {
      const evidenceOk = await track(
        summary.failures,
        `Evidence in "${project.title}"`,
        await upsertCloudRow("project_evidence", {
          owner_id: ownerId,
          local_id: evidence.evidenceRefId,
          project_id: project.id,
          title: evidence.title,
          source_url: evidence.sourceUrl ?? null,
          linked_entity_id: evidence.linkedEntityId ?? null,
          linked_entity_name: evidence.linkedEntityName ?? null,
        }),
      );
      if (evidenceOk) summary.evidence += 1;
    }
  }

  for (const entity of loadPinnedEntities()) {
    const bookmarkOk = await track(
      summary.failures,
      `Bookmark "${entity.name}"`,
      await upsertCloudRow("bookmarks", {
        owner_id: ownerId,
        local_id: `${entity.kind}:${entity.id}`,
        entity_kind: entity.kind,
        entity_id: entity.id,
        entity_name: entity.name,
        entity_code: entity.code ?? null,
        entity_country_name: entity.countryName ?? null,
      }),
    );
    if (bookmarkOk) summary.bookmarks += 1;
  }

  for (const report of loadReports()) {
    const reportOk = await track(
      summary.failures,
      `Report "${report.title}"`,
      await upsertCloudRow("reports", {
        owner_id: ownerId,
        local_id: report.id,
        kind: report.kind,
        entity_id: report.entityId,
        entity_name: report.entityName,
        project_id: report.projectId ?? null,
        title: report.title,
        generated_at: report.generatedAt,
      }),
    );
    if (reportOk) summary.reports += 1;
  }

  if (summary.failures.length === 0) {
    markMigrated(ownerId, summary);
  }
  return summary;
}
