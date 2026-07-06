import type { EntityId, EntityReference, RegistryEntityRecord } from "@/lib/registry/types";

/** Convert a full registry record to a lightweight permanent reference. */
export function toEntityReference(record: RegistryEntityRecord): EntityReference {
  return {
    entityId: record.entityId,
    entityType: record.entityType,
    slug: record.slug,
    displayName: record.displayName,
    countryCode: record.countryCode,
  };
}

/** Batch convert registry records to references. */
export function toEntityReferences(
  records: readonly RegistryEntityRecord[],
): EntityReference[] {
  return records.map(toEntityReference);
}

/** Create a reference from parts when full record is unavailable. */
export function createEntityReference(input: EntityReference): EntityReference {
  return {
    entityId: input.entityId,
    entityType: input.entityType,
    slug: input.slug,
    displayName: input.displayName,
    countryCode: input.countryCode,
  };
}

/** Check whether two references point to the same permanent identity. */
export function isSameEntityReference(a: EntityReference, b: EntityReference): boolean {
  return a.entityId === b.entityId;
}

/** Sort references alphabetically by display name. */
export function sortEntityReferences(
  references: readonly EntityReference[],
): EntityReference[] {
  return [...references].sort((a, b) => a.displayName.localeCompare(b.displayName));
}

export type EntityReferenceMap = ReadonlyMap<EntityId, EntityReference>;

/** Build a reference map from registry records. */
export function buildEntityReferenceMap(
  records: readonly RegistryEntityRecord[],
): EntityReferenceMap {
  return new Map(records.map((record) => [record.entityId, toEntityReference(record)]));
}
