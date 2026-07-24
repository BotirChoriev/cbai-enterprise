/**
 * Operational Object persistence — localStorage with safe migration and debounced writes.
 */

import {
  OPERATIONAL_OBJECT_SCHEMA_VERSION,
  isOperationalObject,
  type OperationalObject,
  type OperationalObjectDraft,
  type OperationalObjectFilter,
  type OperationalObjectStatus,
} from "@/lib/operational-objects/operational-object.types";
import { missingRequiredFields } from "@/lib/operational-objects/command-interpreter";
import { resolveStorageKey } from "@/lib/storage/namespaced-key";
import { notifyMissionDataChanged } from "@/lib/intelligence-os/mission-activation-events";
import { createProject } from "@/lib/project/project-store";
import type { ProjectTypeId } from "@/lib/project/project-types";

const STORAGE_KEY = "cbai-operational-objects";

const memoryObjects: OperationalObject[] = [];

let writeTimer: ReturnType<typeof setTimeout> | null = null;
let pendingWrite: OperationalObject[] | null = null;

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function newId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function sanitizeObject(raw: unknown): OperationalObject | null {
  if (!raw || typeof raw !== "object") return null;
  const record = raw as Record<string, unknown>;
  if (!isOperationalObject(record)) return null;
  const base = record as OperationalObject;
  return {
    ...base,
    version: typeof record.version === "number" ? record.version : OPERATIONAL_OBJECT_SCHEMA_VERSION,
    relatedObjectIds: Array.isArray(record.relatedObjectIds)
      ? record.relatedObjectIds.filter((id): id is string => typeof id === "string")
      : [],
    requiredInputs: Array.isArray(record.requiredInputs)
      ? record.requiredInputs.filter((v): v is string => typeof v === "string")
      : [],
    evidenceRequirements: Array.isArray(record.evidenceRequirements)
      ? record.evidenceRequirements.filter((v): v is string => typeof v === "string")
      : [],
  };
}

function readAllImmediate(): OperationalObject[] {
  if (!isBrowser()) return [...memoryObjects];
  try {
    const raw = window.localStorage.getItem(resolveStorageKey(STORAGE_KEY));
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(sanitizeObject).filter((o): o is OperationalObject => o !== null);
  } catch {
    return [];
  }
}

function flushWrite(items: readonly OperationalObject[]): void {
  if (!isBrowser()) {
    memoryObjects.length = 0;
    memoryObjects.push(...items);
    return;
  }
  window.localStorage.setItem(resolveStorageKey(STORAGE_KEY), JSON.stringify(items));
}

function scheduleWrite(items: readonly OperationalObject[]): void {
  pendingWrite = [...items];
  if (writeTimer) clearTimeout(writeTimer);
  writeTimer = setTimeout(() => {
    if (pendingWrite) flushWrite(pendingWrite);
    pendingWrite = null;
    writeTimer = null;
  }, 280);
}

function writeAll(items: readonly OperationalObject[], immediate = false): void {
  if (immediate) {
    if (writeTimer) clearTimeout(writeTimer);
    pendingWrite = null;
    flushWrite(items);
    return;
  }
  scheduleWrite(items);
}

export function loadOperationalObjects(): OperationalObject[] {
  return readAllImmediate();
}

export function getOperationalObject(id: string): OperationalObject | null {
  return readAllImmediate().find((o) => o.id === id) ?? null;
}

function draftToObject(draft: OperationalObjectDraft, existing?: OperationalObject): OperationalObject {
  const now = new Date().toISOString();
  const id = draft.id ?? existing?.id ?? newId("op");
  return {
    ...(existing ?? {}),
    ...draft,
    id,
    version: OPERATIONAL_OBJECT_SCHEMA_VERSION,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    relatedObjectIds: draft.relatedObjectIds ?? existing?.relatedObjectIds ?? [],
    requiredInputs: draft.requiredInputs ?? [],
    evidenceRequirements: draft.evidenceRequirements ?? [],
    provenance: draft.provenance ?? existing?.provenance ?? { source: "manual" },
  };
}

export function saveOperationalDraft(draft: OperationalObjectDraft): OperationalObject {
  const all = readAllImmediate();
  const existing = draft.id ? all.find((o) => o.id === draft.id) : undefined;
  const object = draftToObject({ ...draft, status: "draft" }, existing);
  const next = existing
    ? all.map((o) => (o.id === object.id ? object : o))
    : [...all, object];
  writeAll(next, true);
  notifyMissionDataChanged("project");
  return object;
}

function resolveConfirmedStatus(draft: OperationalObjectDraft): OperationalObjectStatus {
  const missing = missingRequiredFields(draft);
  if (missing.length > 0) return "waiting_for_input";
  if (draft.evidenceRequirements.length > 0 && draft.status !== "completed") {
    return "waiting_for_evidence";
  }
  return draft.status === "draft" ? "ready" : draft.status;
}

export function confirmOperationalObject(draft: OperationalObjectDraft): OperationalObject {
  let projectId = draft.projectId;
  if (draft.type === "project" && !projectId) {
    const project = createProject({
      title: draft.title.trim(),
      type: "research_project" as ProjectTypeId,
      description: draft.objective.trim() || draft.summary.trim() || draft.title.trim(),
      tags: [],
      visibility: "private",
      status: "active",
    });
    projectId = project.id;
  }

  const confirmedDraft: OperationalObjectDraft = {
    ...draft,
    projectId,
    status: resolveConfirmedStatus(draft),
  };

  const all = readAllImmediate();
  const existing = draft.id ? all.find((o) => o.id === draft.id) : undefined;
  const object = draftToObject(confirmedDraft, existing);
  const next = existing
    ? all.map((o) => (o.id === object.id ? object : o))
    : [...all, object];
  writeAll(next, true);
  notifyMissionDataChanged("project");
  return object;
}

export function filterOperationalObjects(
  objects: readonly OperationalObject[],
  filter: OperationalObjectFilter,
): OperationalObject[] {
  switch (filter) {
    case "draft":
      return objects.filter((o) => o.status === "draft");
    case "active":
      return objects.filter((o) => o.status === "active" || o.status === "ready");
    case "waiting":
      return objects.filter(
        (o) => o.status === "waiting_for_input" || o.status === "waiting_for_evidence",
      );
    case "review":
      return objects.filter((o) => o.status === "needs_review");
    case "completed":
      return objects.filter((o) => o.status === "completed" || o.status === "archived");
    default:
      return [...objects];
  }
}

export function migrateOperationalObjectsFromLegacy(): { migrated: number } {
  const existing = readAllImmediate();
  if (existing.length > 0) return { migrated: 0 };
  return { migrated: 0 };
}
