/**
 * CBAI Global Registry Layer — public API.
 */

export {
  REGISTRY_VERSION,
  REGISTRY_VERSION_INFO,
  REGISTRY_MIGRATION_MANIFEST,
  type RegistryVersionInfo,
  type RegistryMigrationEntry,
} from "@/lib/registry/registry-version";

export {
  ENTITY_RECORD_VERSION,
  WORKSPACE_IDS,
  REPORT_TYPE_IDS,
  type ActiveEntityType,
  type FutureEntityType,
  type EntityType,
  type EntityStatus,
  type EntityId,
  type RegistryEntityRecord,
  type EntityReference,
  type GlobalRegistry,
  type RegistryIndex,
  type RegistryValidationIssue,
  type RegistryValidationReport,
  type EntityLinkGraph,
} from "@/lib/registry/types";

export {
  buildEntityId,
  buildCountryEntityId,
  buildCompanyEntityId,
  buildUniversityEntityId,
  countrySlugFromRegistryId,
  parseEntityId,
  isValidEntityIdFormat,
  isActiveEntityType,
  isKnownEntityType,
  legacyIdToEntityId,
  entityIdToLegacyRegistryId,
  COUNTRY_SLUG_BY_REGISTRY_ID,
} from "@/lib/registry/entity-id";

export {
  getGlobalRegistry,
  getRegistryIndex,
  rebuildGlobalRegistry,
  getAllRegistryEntities,
  getRegistryEntityCount,
} from "@/lib/registry/entity-registry";

export { buildGlobalRegistry } from "@/lib/registry/registry-builder";

export {
  buildRegistryIndex,
  entitySlugKey,
} from "@/lib/registry/entity-index";

export {
  resolveCountryRelatedEntityIds,
  resolveCompanyRelatedEntityIds,
  resolveUniversityRelatedEntityIds,
  resolveRelatedEntityIds,
  resolveCountryCodeByName,
  buildEntityLinkGraph,
  resolveLinkedEntities,
} from "@/lib/registry/entity-links";

export {
  toEntityReference,
  toEntityReferences,
  createEntityReference,
  isSameEntityReference,
  sortEntityReferences,
  buildEntityReferenceMap,
  type EntityReferenceMap,
} from "@/lib/registry/entity-reference";

export {
  findEntityById,
  findEntityBySlug,
  findEntitiesByType,
  findEntitiesByCountryCode,
  resolveRelatedEntities,
  getEntityLinkGraph,
  searchRegistryByDisplayName,
  findEntityByLegacyId,
  resolveEntityReference,
  resolveEntityFromIdString,
} from "@/lib/registry/registry-query";

export {
  validateGlobalRegistry,
  assertRegistryValid,
  summarizeValidationReport,
} from "@/lib/registry/registry-validation";
