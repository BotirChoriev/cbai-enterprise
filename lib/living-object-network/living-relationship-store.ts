/**
 * BUILD-030A — Persisted canonical relationships (device-local).
 */

import { resolveStorageKey } from "@/lib/storage/namespaced-key";
import { assertValidRelationshipPair } from "@/lib/living-object-network/living-relationship-validation";
import type {
  LivingRelationship,
  LivingObjectReference,
  LivingRelationshipType,
  LivingRelationshipProvenanceKind,
  LivingRelationshipStatus,
} from "@/lib/living-object-network/living-object.types";

const RELATIONSHIPS_KEY = "cbai-living-relationships";
export const LIVING_RELATIONSHIP_SCHEMA_VERSION = 1;

const memoryRelationships: LivingRelationship[] = [];

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function readAll(): LivingRelationship[] {
  if (!isBrowser()) return [...memoryRelationships];
  try {
    const raw = window.localStorage.getItem(resolveStorageKey(RELATIONSHIPS_KEY));
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((v): v is LivingRelationship => {
      const r = v as LivingRelationship;
      return typeof r?.id === "string" && typeof r?.relationshipType === "string";
    });
  } catch {
    return [];
  }
}

function writeAll(items: readonly LivingRelationship[]): void {
  if (!isBrowser()) {
    memoryRelationships.length = 0;
    memoryRelationships.push(...items);
    return;
  }
  window.localStorage.setItem(resolveStorageKey(RELATIONSHIPS_KEY), JSON.stringify(items));
}

function newId(): string {
  return `rel-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function refKey(ref: LivingObjectReference): string {
  return `${ref.objectType}:${ref.objectId}`;
}

export function loadLivingRelationships(filter?: {
  readonly missionId?: string;
  readonly organizationId?: string;
  readonly objectRef?: LivingObjectReference;
  readonly includeArchived?: boolean;
}): LivingRelationship[] {
  let all = readAll();
  if (!filter?.includeArchived) {
    all = all.filter((r) => r.status !== "archived");
  }
  if (filter?.missionId) all = all.filter((r) => r.missionId === filter.missionId);
  if (filter?.organizationId) all = all.filter((r) => r.organizationId === filter.organizationId);
  if (filter?.objectRef) {
    const key = refKey(filter.objectRef);
    all = all.filter((r) => refKey(r.source) === key || refKey(r.target) === key);
  }
  return all;
}

export function findDuplicateRelationship(
  source: LivingObjectReference,
  target: LivingObjectReference,
  relationshipType: LivingRelationshipType,
): LivingRelationship | null {
  const sKey = refKey(source);
  const tKey = refKey(target);
  return (
    readAll().find(
      (r) =>
        r.relationshipType === relationshipType &&
        refKey(r.source) === sKey &&
        refKey(r.target) === tKey &&
        r.status !== "archived" &&
        r.status !== "rejected",
    ) ?? null
  );
}

export type CreateLivingRelationshipInput = {
  readonly source: LivingObjectReference;
  readonly target: LivingObjectReference;
  readonly relationshipType: LivingRelationshipType;
  readonly status?: LivingRelationshipStatus;
  readonly provenanceKind?: LivingRelationshipProvenanceKind;
  readonly createdBy: string;
  readonly missionId?: string | null;
  readonly organizationId?: string | null;
  readonly collaborationId?: string | null;
};

export function createLivingRelationship(
  input: CreateLivingRelationshipInput,
): LivingRelationship | { readonly error: string } {
  assertValidRelationshipPair(input.relationshipType, input.source.objectType, input.target.objectType);
  const dup = findDuplicateRelationship(input.source, input.target, input.relationshipType);
  if (dup) return dup;

  const now = new Date().toISOString();
  const record: LivingRelationship = {
    id: newId(),
    source: input.source,
    target: input.target,
    relationshipType: input.relationshipType,
    direction: "directed",
    status: input.status ?? "asserted",
    provenanceKind: input.provenanceKind ?? "system_derived",
    provenance: [],
    supportingEvidenceIds: [],
    contradictingEvidenceIds: [],
    missionId: input.missionId ?? null,
    organizationId: input.organizationId ?? null,
    collaborationId: input.collaborationId ?? null,
    createdBy: input.createdBy,
    createdAt: now,
    updatedAt: now,
    limitations: [],
    version: 1,
  };
  writeAll([...readAll(), record]);
  return record;
}

export function clearLivingRelationshipsForTests(): void {
  memoryRelationships.length = 0;
  if (!isBrowser()) return;
  window.localStorage.removeItem(resolveStorageKey(RELATIONSHIPS_KEY));
}
