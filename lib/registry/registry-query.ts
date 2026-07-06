import type {
  ActiveEntityType,
  EntityId,
  EntityLinkGraph,
  RegistryEntityRecord,
} from "@/lib/registry/types";
import {
  getGlobalRegistry,
  getRegistryIndex,
} from "@/lib/registry/entity-registry";
import { entitySlugKey } from "@/lib/registry/entity-index";
import {
  buildEntityLinkGraph,
  resolveLinkedEntities,
} from "@/lib/registry/entity-links";
import {
  entityIdToLegacyRegistryId,
  legacyIdToEntityId,
  parseEntityId,
} from "@/lib/registry/entity-id";
import { toEntityReference } from "@/lib/registry/entity-reference";

/** Find a registry entity by permanent ID. */
export function findEntityById(entityId: EntityId): RegistryEntityRecord | undefined {
  return getRegistryIndex().byId.get(entityId);
}

/** Find a registry entity by type and slug segment. */
export function findEntityBySlug(
  entityType: ActiveEntityType,
  slug: string,
): RegistryEntityRecord | undefined {
  return getRegistryIndex().bySlug.get(entitySlugKey(entityType, slug));
}

/** Find all entities of a given type. */
export function findEntitiesByType(
  entityType: ActiveEntityType,
): readonly RegistryEntityRecord[] {
  return getRegistryIndex().byType.get(entityType) ?? [];
}

/** Find entities sharing a country code (ISO-style). */
export function findEntitiesByCountryCode(
  countryCode: string,
): readonly RegistryEntityRecord[] {
  return getRegistryIndex().byCountryCode.get(countryCode.toUpperCase()) ?? [];
}

/** Resolve related entities for a permanent entity ID. */
export function resolveRelatedEntities(
  entityId: EntityId,
): RegistryEntityRecord[] {
  const record = findEntityById(entityId);
  if (!record) return [];

  return resolveLinkedEntities(record.relatedEntityIds, getRegistryIndex().byId);
}

/** Build inbound/outbound link graph for an entity ID. */
export function getEntityLinkGraph(entityId: EntityId): EntityLinkGraph {
  return buildEntityLinkGraph(entityId, getGlobalRegistry().entities);
}

/** Search registry display names (case-insensitive substring). */
export function searchRegistryByDisplayName(query: string): RegistryEntityRecord[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];

  return getGlobalRegistry().entities.filter((entity) =>
    entity.displayName.toLowerCase().includes(normalized),
  );
}

/** Lookup by legacy module registry ID. */
export function findEntityByLegacyId(
  entityType: ActiveEntityType,
  legacyRegistryId: string,
): RegistryEntityRecord | undefined {
  return findEntityById(legacyIdToEntityId(entityType, legacyRegistryId));
}

/** Convert permanent entity ID to entity reference — undefined if not found. */
export function resolveEntityReference(entityId: EntityId) {
  const record = findEntityById(entityId);
  return record ? toEntityReference(record) : undefined;
}

/** Parse and lookup an entity ID string. */
export function resolveEntityFromIdString(entityId: string): RegistryEntityRecord | undefined {
  if (!parseEntityId(entityId)) return undefined;
  return findEntityById(entityId as EntityId);
}

export { entityIdToLegacyRegistryId, legacyIdToEntityId, parseEntityId };
