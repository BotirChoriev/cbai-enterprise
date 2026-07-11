import type { ResearchEntityKind } from "@/lib/research-domain/research-entity-base";
import type { ResearchDomainEntity } from "@/lib/research-domain/research-relationships";

/**
 * Pure, in-memory query primitives over a ResearchDomainEntity collection. No re-derivation of
 * evidence, relationships, or catalog logic — every function here only filters or indexes
 * entities the adapter already built.
 */

export function findResearchDomainEntityById(
  entities: readonly ResearchDomainEntity[],
  entityId: string,
): ResearchDomainEntity | undefined {
  return entities.find((entity) => entity.entityId === entityId);
}

export function findResearchDomainEntitiesByKind(
  entities: readonly ResearchDomainEntity[],
  entityKind: ResearchEntityKind,
): readonly ResearchDomainEntity[] {
  return entities.filter((entity) => entity.entityKind === entityKind);
}

/** Every entity that links to a given organization id via its own organizationIds field. */
export function findResearchDomainEntitiesByOrganization(
  entities: readonly ResearchDomainEntity[],
  organizationId: string,
): readonly ResearchDomainEntity[] {
  return entities.filter((entity) => entity.organizationIds.includes(organizationId));
}

/** Every entity that carries a given Foundation Mission (matched by Mission.subjectId). */
export function findResearchDomainEntitiesByMission(
  entities: readonly ResearchDomainEntity[],
  missionSubjectId: string,
): readonly ResearchDomainEntity[] {
  return entities.filter((entity) =>
    entity.missions.some((mission) => mission.subjectId === missionSubjectId),
  );
}

/** Every entity that carries a given real Evidence record (matched by Evidence.evidenceId). */
export function findResearchDomainEntitiesByEvidence(
  entities: readonly ResearchDomainEntity[],
  evidenceId: string,
): readonly ResearchDomainEntity[] {
  return entities.filter((entity) =>
    entity.evidence.some((item) => item.evidenceId === evidenceId),
  );
}
