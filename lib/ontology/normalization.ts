/**
 * Ontology normalization — consistent field shapes on read/write.
 */

import { ONTOLOGY_SCHEMA_VERSION } from "@/lib/ontology/types";
import type { OntologyLocale, OntologyObjectDraft, OntologyObjectId, OntologyObjectRecord, OntologyProvenance } from "@/lib/ontology/types";
import type { OntologyObjectKind } from "@/lib/ontology/object-kinds";
import { isOntologyObjectKind } from "@/lib/ontology/object-kinds";

export function createOntologyObjectId(kind: OntologyObjectKind): OntologyObjectId {
  const suffix = typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  return `${kind}-${suffix}` as OntologyObjectId;
}

export function normalizeLocale(value: unknown): OntologyLocale {
  if (value === "uz" || value === "ru" || value === "tr") return value;
  return "en";
}

export function normalizeProvenance(input: Partial<OntologyProvenance> | undefined): OntologyProvenance {
  return {
    source: input?.source ?? "user_created",
    createdBy: input?.createdBy,
    engineId: input?.engineId,
    engineVersion: input?.engineVersion,
    originalText: input?.originalText,
    inferredFields: input?.inferredFields ?? [],
    userProvidedFields: input?.userProvidedFields ?? [],
    legacyStoreKey: input?.legacyStoreKey,
    legacyRecordId: input?.legacyRecordId,
    confirmationEventId: input?.confirmationEventId,
  };
}

/** Normalize raw storage record — preserve unknown fields. */
export function normalizeOntologyRecord(raw: Record<string, unknown>): OntologyObjectRecord | null {
  const kind = raw.kind;
  if (!isOntologyObjectKind(kind)) return null;

  const now = new Date().toISOString();
  return {
    ...(raw as OntologyObjectRecord),
    id: String(raw.id) as OntologyObjectId,
    kind,
    title: String(raw.title ?? ""),
    description: String(raw.description ?? ""),
    status: (raw.status as OntologyObjectRecord["status"]) ?? "draft",
    contentLocale: normalizeLocale(raw.contentLocale),
    createdLocale: normalizeLocale(raw.createdLocale),
    provenance: normalizeProvenance(raw.provenance as Partial<OntologyProvenance>),
    sourceReferences: Array.isArray(raw.sourceReferences) ? raw.sourceReferences : [],
    relationshipIds: Array.isArray(raw.relationshipIds) ? raw.relationshipIds.map(String) : [],
    createdAt: String(raw.createdAt ?? now),
    updatedAt: String(raw.updatedAt ?? now),
    schemaVersion: ONTOLOGY_SCHEMA_VERSION,
    metadata: typeof raw.metadata === "object" && raw.metadata !== null ? (raw.metadata as Record<string, unknown>) : {},
  };
}

export function draftToRecord(draft: OntologyObjectDraft, id?: OntologyObjectId): OntologyObjectRecord {
  const now = new Date().toISOString();
  const objectId = id ?? createOntologyObjectId(draft.kind);
  return {
    id: objectId,
    kind: draft.kind,
    title: draft.title.trim(),
    description: (draft.description ?? "").trim(),
    status: draft.status ?? "draft",
    contentLocale: normalizeLocale(draft.contentLocale),
    createdLocale: normalizeLocale(draft.createdLocale),
    provenance: normalizeProvenance(draft.provenance),
    sourceReferences: draft.sourceReferences ?? [],
    relationshipIds: draft.relationshipIds ?? [],
    createdAt: now,
    updatedAt: now,
    schemaVersion: ONTOLOGY_SCHEMA_VERSION,
    metadata: draft.metadata ?? {},
  };
}
