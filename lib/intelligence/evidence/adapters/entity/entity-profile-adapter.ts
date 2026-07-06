import type { Evidence } from "@/lib/intelligence/evidence.types";
import type { IntelligenceRequest } from "@/lib/intelligence/request.types";
import type { EvidenceSourceAdapter } from "@/lib/intelligence/evidence/sources";
import {
  defaultEntityEvidenceMapper,
  type EntityEvidenceMapper,
} from "@/lib/intelligence/evidence/adapters/entity/entity-evidence-mapper";
import {
  defaultEntityResolver,
  type EntityResolver,
} from "@/lib/intelligence/evidence/adapters/entity/entity-resolver";
import {
  ENTITY_PROFILE_ADAPTER_ID,
  ENTITY_PROFILE_ADAPTER_VERSION,
} from "@/lib/intelligence/evidence/adapters/entity/types";

/**
 * Entity Profile evidence source adapter (BUILD-030).
 *
 * Reads scoped subject entities from domain stores via existing adapters
 * and emits deterministic entity-profile evidence items.
 */
export class EntityProfileEvidenceAdapter implements EvidenceSourceAdapter {
  readonly id = ENTITY_PROFILE_ADAPTER_ID;
  readonly sourceClass = "entity-profile" as const;
  readonly label = "Entity Profile";
  readonly description =
    "Entity registry facts and relationship summaries from local domain adapters. Country records exclude unverified scores and narratives.";
  readonly enabled = true;
  readonly version = ENTITY_PROFILE_ADAPTER_VERSION;

  private readonly resolver: EntityResolver;
  private readonly mapper: EntityEvidenceMapper;

  constructor(
    resolver: EntityResolver = defaultEntityResolver,
    mapper: EntityEvidenceMapper = defaultEntityEvidenceMapper,
  ) {
    this.resolver = resolver;
    this.mapper = mapper;
  }

  /**
   * Collect evidence for explicitly scoped subject entities only.
   */
  collect(request: IntelligenceRequest) {
    const subjectEntities = request.subjectEntities;

    if (!subjectEntities || subjectEntities.length === 0) {
      return {
        items: [],
        warnings: ["entity-profile:no-subject-entities"],
      };
    }

    const retrievedAt = new Date().toISOString();
    const { resolved, warnings } = this.resolver.resolveSubjectEntities(subjectEntities);
    const items: Evidence[] = [];

    for (const entry of resolved) {
      items.push(
        ...this.mapper.mapEntity(entry.entity, { retrievedAt }, entry.relationshipsSummary),
      );
    }

    return { items, warnings };
  }
}

/** Factory for registry bootstrap. */
export function createEntityProfileEvidenceAdapter(): EntityProfileEvidenceAdapter {
  return new EntityProfileEvidenceAdapter();
}
