import type {
  ActiveEntityType,
  EntityId,
  GlobalRegistry,
  RegistryEntityRecord,
  RegistryIndex,
} from "@/lib/registry/types";

function groupByType(
  entities: readonly RegistryEntityRecord[],
): ReadonlyMap<ActiveEntityType, readonly RegistryEntityRecord[]> {
  const map = new Map<ActiveEntityType, RegistryEntityRecord[]>();

  for (const entity of entities) {
    const list = map.get(entity.entityType) ?? [];
    list.push(entity);
    map.set(entity.entityType, list);
  }

  return map;
}

function groupByCountryCode(
  entities: readonly RegistryEntityRecord[],
): ReadonlyMap<string, readonly RegistryEntityRecord[]> {
  const map = new Map<string, RegistryEntityRecord[]>();

  for (const entity of entities) {
    if (!entity.countryCode) continue;
    const list = map.get(entity.countryCode) ?? [];
    list.push(entity);
    map.set(entity.countryCode, list);
  }

  return map;
}

/** Build lookup indexes from a global registry snapshot. */
export function buildRegistryIndex(registry: GlobalRegistry): RegistryIndex {
  const byId = new Map<EntityId, RegistryEntityRecord>();
  const bySlug = new Map<string, RegistryEntityRecord>();

  for (const entity of registry.entities) {
    byId.set(entity.entityId, entity);
    bySlug.set(`${entity.entityType}:${entity.slug}`, entity);
  }

  return {
    byId,
    bySlug,
    byType: groupByType(registry.entities),
    byCountryCode: groupByCountryCode(registry.entities),
  };
}

/** Composite slug key used by index lookups. */
export function entitySlugKey(entityType: ActiveEntityType, slug: string): string {
  return `${entityType}:${slug}`;
}
