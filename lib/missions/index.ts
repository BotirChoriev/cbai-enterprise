/**
 * CBAI Mission Catalog — public API.
 * Definitions only — no mission execution.
 */

export {
  MISSION_CATALOG_VERSION,
  MISSION_CATALOG_VERSION_INFO,
  MISSION_MIGRATION_MANIFEST,
  MISSION_LIFECYCLE_STAGES,
  type MissionCatalogVersionInfo,
  type MissionMigrationEntry,
  type MissionLifecycleStage,
} from "@/lib/missions/mission-version";

export {
  MISSION_RECORD_VERSION,
  MISSION_PERSONA_IDS,
  MISSION_SUPPORTED_ENTITY_TYPES,
  type MissionPersonaId,
  type MissionStatus,
  type MissionId,
  type MissionSupportedEntityType,
  type MissionDefinition,
  type MissionCatalog,
  type MissionCatalogIndex,
  type MissionCatalogEntry,
  type MissionValidationIssue,
  type MissionValidationReport,
} from "@/lib/missions/mission-types";

export { MISSION_CATALOG_ENTRIES } from "@/lib/missions/mission-catalog";

export {
  MISSION_ID_PATTERN,
  buildMissionId,
  parseMissionId,
  isValidMissionIdFormat,
  buildMissionDefinition,
  buildMissionCatalog,
} from "@/lib/missions/mission-builder";

export {
  getMissionCatalog,
  getMissionCatalogIndex,
  rebuildMissionCatalog,
  getAllMissions,
  getMissionCount,
} from "@/lib/missions/mission-registry";

export {
  findMissionById,
  findMissionByIdString,
  findMissionsByPersona,
  findMissionsByEntityType,
  findMissionsByWorkspace,
  searchMissionsByName,
  listActiveMissionPersonas,
} from "@/lib/missions/mission-query";

export {
  validateMissionCatalog,
  assertMissionCatalogValid,
} from "@/lib/missions/mission-validation";
