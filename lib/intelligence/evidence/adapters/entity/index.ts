/**
 * Entity Profile evidence adapter package (BUILD-030).
 *
 * @see docs/build-030-report.md
 */

export {
  createEntityProfileEvidenceAdapter,
  EntityProfileEvidenceAdapter,
} from "@/lib/intelligence/evidence/adapters/entity/entity-profile-adapter";

export {
  defaultEntityEvidenceMapper,
  EntityEvidenceMapper,
  MAX_EVIDENCE_ITEMS_PER_ENTITY,
} from "@/lib/intelligence/evidence/adapters/entity/entity-evidence-mapper";

export {
  defaultEntityResolver,
  EntityResolver,
} from "@/lib/intelligence/evidence/adapters/entity/entity-resolver";

export {
  ENTITY_PROFILE_ADAPTER_ID,
  ENTITY_PROFILE_ADAPTER_VERSION,
  entityRefKey,
  isSupportedEntityType,
  SUPPORTED_ENTITY_TYPES,
  type EntityEvidenceMapperOptions,
  type EntityResolutionBatch,
  type EntityResolutionResult,
  type SupportedEntityType,
} from "@/lib/intelligence/evidence/adapters/entity/types";
