import type {
  MissionCatalog,
  MissionCatalogIndex,
  MissionDefinition,
  MissionId,
  MissionPersonaId,
  MissionSupportedEntityType,
} from "@/lib/missions/mission-types";
import { buildMissionCatalog } from "@/lib/missions/mission-builder";

function groupByPersona(
  missions: readonly MissionDefinition[],
): ReadonlyMap<MissionPersonaId, readonly MissionDefinition[]> {
  const map = new Map<MissionPersonaId, MissionDefinition[]>();

  for (const mission of missions) {
    const list = map.get(mission.persona) ?? [];
    list.push(mission);
    map.set(mission.persona, list);
  }

  return map;
}

function groupByEntityType(
  missions: readonly MissionDefinition[],
): ReadonlyMap<MissionSupportedEntityType, readonly MissionDefinition[]> {
  const map = new Map<MissionSupportedEntityType, MissionDefinition[]>();

  for (const mission of missions) {
    for (const entityType of mission.supportedEntities) {
      const list = map.get(entityType) ?? [];
      list.push(mission);
      map.set(entityType, list);
    }
  }

  return map;
}

function groupByWorkspace(
  missions: readonly MissionDefinition[],
): ReadonlyMap<string, readonly MissionDefinition[]> {
  const map = new Map<string, MissionDefinition[]>();

  for (const mission of missions) {
    for (const workspaceId of mission.requiredWorkspaces) {
      const list = map.get(workspaceId) ?? [];
      list.push(mission);
      map.set(workspaceId, list);
    }
  }

  return map;
}

function buildMissionCatalogIndex(catalog: MissionCatalog): MissionCatalogIndex {
  const byId = new Map<MissionId, MissionDefinition>();

  for (const mission of catalog.missions) {
    byId.set(mission.missionId, mission);
  }

  return {
    byId,
    byPersona: groupByPersona(catalog.missions),
    byEntityType: groupByEntityType(catalog.missions),
    byWorkspace: groupByWorkspace(catalog.missions),
  };
}

let cachedCatalog: MissionCatalog | null = null;
let cachedIndex: MissionCatalogIndex | null = null;

/** Unified CBAI mission catalog — definitions only, no execution. */
export function getMissionCatalog(): MissionCatalog {
  if (!cachedCatalog) {
    cachedCatalog = buildMissionCatalog();
  }
  return cachedCatalog;
}

/** Indexed mission catalog views for fast lookup. */
export function getMissionCatalogIndex(): MissionCatalogIndex {
  if (!cachedIndex) {
    cachedIndex = buildMissionCatalogIndex(getMissionCatalog());
  }
  return cachedIndex;
}

/** Force rebuild — for tests and future migration hooks. */
export function rebuildMissionCatalog(): MissionCatalog {
  cachedCatalog = buildMissionCatalog();
  cachedIndex = buildMissionCatalogIndex(cachedCatalog);
  return cachedCatalog;
}

export function getAllMissions(): readonly MissionDefinition[] {
  return getMissionCatalog().missions;
}

export function getMissionCount(): number {
  return getMissionCatalog().missionCount;
}

export type { MissionCatalogIndex };
