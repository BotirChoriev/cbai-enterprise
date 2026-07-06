import type {
  MissionDefinition,
  MissionId,
  MissionPersonaId,
  MissionSupportedEntityType,
} from "@/lib/missions/mission-types";
import {
  getMissionCatalog,
  getMissionCatalogIndex,
} from "@/lib/missions/mission-registry";
import { parseMissionId } from "@/lib/missions/mission-builder";

/** Find a mission by permanent ID. */
export function findMissionById(missionId: MissionId): MissionDefinition | undefined {
  return getMissionCatalogIndex().byId.get(missionId);
}

/** Find a mission by ID string with format validation. */
export function findMissionByIdString(missionId: string): MissionDefinition | undefined {
  if (!parseMissionId(missionId)) return undefined;
  return findMissionById(missionId as MissionId);
}

/** Find all missions for a persona. */
export function findMissionsByPersona(
  persona: MissionPersonaId,
): readonly MissionDefinition[] {
  return getMissionCatalogIndex().byPersona.get(persona) ?? [];
}

/** Find missions supporting a given entity type. */
export function findMissionsByEntityType(
  entityType: MissionSupportedEntityType,
): readonly MissionDefinition[] {
  return getMissionCatalogIndex().byEntityType.get(entityType) ?? [];
}

/** Find missions requiring a given workspace ID. */
export function findMissionsByWorkspace(workspaceId: string): readonly MissionDefinition[] {
  return getMissionCatalogIndex().byWorkspace.get(workspaceId) ?? [];
}

/** Search missions by name (case-insensitive substring). */
export function searchMissionsByName(query: string): MissionDefinition[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];

  return getMissionCatalog().missions.filter((mission) =>
    mission.missionName.toLowerCase().includes(normalized),
  );
}

/** List all defined personas that have at least one mission. */
export function listActiveMissionPersonas(): MissionPersonaId[] {
  return [...getMissionCatalogIndex().byPersona.keys()];
}

export { parseMissionId };
