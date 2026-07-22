/**
 * Browser-safe ontology repository — device-local persistence with confirmation gates.
 */

import {
  ONTOLOGY_AUDIT_KEY,
  ONTOLOGY_MIGRATION_VERSION_KEY,
  ONTOLOGY_RELATIONSHIPS_KEY,
  ONTOLOGY_STORAGE_KEY,
  CURRENT_ONTOLOGY_MIGRATION_VERSION,
  migrateOntologyStore,
} from "@/lib/ontology/migrations";
import { draftToRecord, createOntologyObjectId } from "@/lib/ontology/normalization";
import { createAuditEvent, markConfirmed } from "@/lib/ontology/provenance";
import { checkOntologyPermission, requiresHumanConfirmation } from "@/lib/ontology/permissions";
import { validateOntologyDraft, validateOntologyRecord, canMutateObject } from "@/lib/ontology/validation";
import { filterOntologyObjects, getObjectById, getRelationshipsForObject, findRelatedWork, findDependencies } from "@/lib/ontology/query";
import { isRelationshipAllowed } from "@/lib/ontology/relationship-kinds";
import type { OntologyRelationship, OntologyRelationshipKind } from "@/lib/ontology/relationship-kinds";
import type {
  OntologyAuditEvent,
  OntologyObjectDraft,
  OntologyObjectFilter,
  OntologyObjectId,
  OntologyObjectRecord,
} from "@/lib/ontology/types";

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export class OntologyRepository {
  private objects: OntologyObjectRecord[] = [];
  private relationships: OntologyRelationship[] = [];
  private auditLog: OntologyAuditEvent[] = [];
  private loaded = false;

  load(): void {
    if (this.loaded) return;
    const raw = readJson<unknown>(ONTOLOGY_STORAGE_KEY, []);
    const { objects } = migrateOntologyStore(raw);
    this.objects = objects;
    this.relationships = readJson<OntologyRelationship[]>(ONTOLOGY_RELATIONSHIPS_KEY, []);
    this.auditLog = readJson<OntologyAuditEvent[]>(ONTOLOGY_AUDIT_KEY, []);
    writeJson(ONTOLOGY_MIGRATION_VERSION_KEY, CURRENT_ONTOLOGY_MIGRATION_VERSION);
    this.loaded = true;
  }

  private persist(): void {
    writeJson(ONTOLOGY_STORAGE_KEY, this.objects);
    writeJson(ONTOLOGY_RELATIONSHIPS_KEY, this.relationships);
    writeJson(ONTOLOGY_AUDIT_KEY, this.auditLog);
  }

  private audit(event: OntologyAuditEvent): void {
    this.auditLog = [...this.auditLog, event];
  }

  getObject(id: OntologyObjectId | string): OntologyObjectRecord | undefined {
    this.load();
    return getObjectById(this.objects, id);
  }

  listObjects(filter: OntologyObjectFilter = {}): OntologyObjectRecord[] {
    this.load();
    return filterOntologyObjects(this.objects, filter);
  }

  createDraft(draft: OntologyObjectDraft): { ok: true; object: OntologyObjectRecord } | { ok: false; error: string } {
    this.load();
    const validation = validateOntologyDraft(draft);
    if (!validation.valid) {
      return { ok: false, error: validation.issues.find((i) => i.severity === "error")?.message ?? "Validation failed" };
    }
    const record = draftToRecord({ ...draft, status: draft.status ?? "draft" });
    this.objects = [...this.objects, record];
    this.audit(createAuditEvent(record.id, "create_draft", { kind: record.kind }));
    this.persist();
    return { ok: true, object: record };
  }

  confirmCreation(id: OntologyObjectId | string, actorId?: string): { ok: true; object: OntologyObjectRecord } | { ok: false; error: string } {
    this.load();
    const record = getObjectById(this.objects, id);
    if (!record) return { ok: false, error: "Object not found" };
    const perm = checkOntologyPermission(record, "confirm");
    if (!perm.allowed) return { ok: false, error: perm.reason ?? "Confirmation not allowed" };

    const event = createAuditEvent(record.id, "confirm", {}, actorId);
    const updated: OntologyObjectRecord = {
      ...record,
      status: "active",
      provenance: markConfirmed(record.provenance, event.id),
      updatedAt: new Date().toISOString(),
    };
    this.objects = this.objects.map((o) => (o.id === id ? updated : o));
    this.audit(event);
    this.persist();
    return { ok: true, object: updated };
  }

  updateObject(
    id: OntologyObjectId | string,
    patch: Partial<Pick<OntologyObjectRecord, "title" | "description" | "status" | "metadata">>,
  ): { ok: true; object: OntologyObjectRecord } | { ok: false; error: string } {
    this.load();
    const record = getObjectById(this.objects, id);
    if (!record) return { ok: false, error: "Object not found" };
    if (!canMutateObject(record)) return { ok: false, error: "Object is read-only or archived" };
    const perm = checkOntologyPermission(record, "update");
    if (!perm.allowed) return { ok: false, error: perm.reason ?? "Update not allowed" };

    const updated: OntologyObjectRecord = {
      ...record,
      ...patch,
      metadata: patch.metadata ? { ...record.metadata, ...patch.metadata } : record.metadata,
      updatedAt: new Date().toISOString(),
    };
    const validation = validateOntologyRecord(updated);
    if (!validation.valid) {
      return { ok: false, error: validation.issues.find((i) => i.severity === "error")?.message ?? "Validation failed" };
    }
    this.objects = this.objects.map((o) => (o.id === id ? updated : o));
    this.audit(createAuditEvent(record.id, "update", { patch }));
    this.persist();
    return { ok: true, object: updated };
  }

  linkRelationship(
    kind: OntologyRelationshipKind,
    fromId: string,
    toId: string,
    fromKind: string,
    toKind: string,
  ): { ok: true; relationship: OntologyRelationship } | { ok: false; error: string } {
    this.load();
    if (!isRelationshipAllowed(kind, fromKind, toKind)) {
      return { ok: false, error: `Relationship ${kind} not allowed between ${fromKind} and ${toKind}` };
    }
    const rel: OntologyRelationship = {
      id: createOntologyObjectId("task").replace("task-", "rel-"),
      kind,
      fromId,
      toId,
      createdAt: new Date().toISOString(),
    };
    this.relationships = [...this.relationships, rel];
    this.audit(createAuditEvent(fromId as OntologyObjectId, "link", { kind, toId }));
    this.persist();
    return { ok: true, relationship: rel };
  }

  unlinkRelationship(relationshipId: string): boolean {
    this.load();
    const before = this.relationships.length;
    this.relationships = this.relationships.filter((r) => r.id !== relationshipId);
    if (this.relationships.length < before) {
      this.persist();
      return true;
    }
    return false;
  }

  traverse(fromId: string, kind?: OntologyRelationshipKind) {
    this.load();
    return getRelationshipsForObject(this.relationships, fromId, "both").filter(
      (r) => !kind || r.kind === kind,
    );
  }

  relatedWork(objectId: string): OntologyObjectRecord[] {
    this.load();
    return findRelatedWork(objectId, this.objects, this.relationships);
  }

  dependencies(objectId: string): OntologyRelationship[] {
    this.load();
    return findDependencies(objectId, this.relationships);
  }

  getAuditLog(objectId?: string): OntologyAuditEvent[] {
    this.load();
    return objectId ? this.auditLog.filter((e) => e.objectId === objectId) : this.auditLog;
  }

  needsConfirmation(id: OntologyObjectId | string): boolean {
    this.load();
    const record = getObjectById(this.objects, id);
    return record ? requiresHumanConfirmation(record) : false;
  }
}

let singleton: OntologyRepository | null = null;

export function getOntologyRepository(): OntologyRepository {
  if (!singleton) singleton = new OntologyRepository();
  return singleton;
}

/** Test-only reset — does not delete legacy stores. */
export function resetOntologyRepositoryForTests(): void {
  singleton = null;
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(ONTOLOGY_STORAGE_KEY);
    window.localStorage.removeItem(ONTOLOGY_RELATIONSHIPS_KEY);
    window.localStorage.removeItem(ONTOLOGY_AUDIT_KEY);
    window.localStorage.removeItem(ONTOLOGY_MIGRATION_VERSION_KEY);
  }
}
