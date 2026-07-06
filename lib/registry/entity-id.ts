import type { ActiveEntityType, EntityId, EntityType } from "@/lib/registry/types";

const ENTITY_ID_PATTERN = /^(country|company|university)-([a-z0-9-]+)$/;

/** Canonical country registry ID → stable slug segment for entity IDs. */
const COUNTRY_SLUG_BY_REGISTRY_ID: Readonly<Record<string, string>> = {
  usa: "usa",
  japan: "jpn",
  china: "chn",
  germany: "deu",
  uae: "are",
  uzbekistan: "uzb",
};

const ACTIVE_ENTITY_TYPES: readonly ActiveEntityType[] = [
  "country",
  "company",
  "university",
];

export function isActiveEntityType(value: string): value is ActiveEntityType {
  return ACTIVE_ENTITY_TYPES.includes(value as ActiveEntityType);
}

export function isKnownEntityType(value: string): value is EntityType {
  return (
    isActiveEntityType(value) ||
    [
      "government",
      "organization",
      "institution",
      "dataset",
      "report",
      "mission",
    ].includes(value)
  );
}

/** Build a permanent entity ID from type and stable slug — never random. */
export function buildEntityId(type: ActiveEntityType, slug: string): EntityId {
  return `${type}-${slug}` as EntityId;
}

/** Resolve stable country slug from legacy registry ID. */
export function countrySlugFromRegistryId(registryId: string): string {
  return COUNTRY_SLUG_BY_REGISTRY_ID[registryId] ?? registryId;
}

export function buildCountryEntityId(registryId: string): EntityId {
  return buildEntityId("country", countrySlugFromRegistryId(registryId));
}

export function buildCompanyEntityId(registryId: string): EntityId {
  return buildEntityId("company", registryId);
}

export function buildUniversityEntityId(registryId: string): EntityId {
  return buildEntityId("university", registryId);
}

/** Parse a permanent entity ID into type and slug segments. */
export function parseEntityId(
  entityId: string,
): { entityType: ActiveEntityType; slug: string } | null {
  const match = ENTITY_ID_PATTERN.exec(entityId);
  if (!match) return null;

  const entityType = match[1];
  const slug = match[2];

  if (!isActiveEntityType(entityType)) return null;

  return { entityType, slug };
}

/** Validate entity ID format without registry lookup. */
export function isValidEntityIdFormat(entityId: string): boolean {
  return parseEntityId(entityId) !== null;
}

/** Map legacy module registry ID + type to permanent entity ID. */
export function legacyIdToEntityId(
  entityType: ActiveEntityType,
  legacyRegistryId: string,
): EntityId {
  switch (entityType) {
    case "country":
      return buildCountryEntityId(legacyRegistryId);
    case "company":
      return buildCompanyEntityId(legacyRegistryId);
    case "university":
      return buildUniversityEntityId(legacyRegistryId);
  }
}

/** Map permanent entity ID back to legacy module registry ID when possible. */
export function entityIdToLegacyRegistryId(entityId: EntityId): string | null {
  const parsed = parseEntityId(entityId);
  if (!parsed) return null;

  if (parsed.entityType === "country") {
    const entry = Object.entries(COUNTRY_SLUG_BY_REGISTRY_ID).find(
      ([, slug]) => slug === parsed.slug,
    );
    return entry?.[0] ?? parsed.slug;
  }

  return parsed.slug;
}

export { COUNTRY_SLUG_BY_REGISTRY_ID };
