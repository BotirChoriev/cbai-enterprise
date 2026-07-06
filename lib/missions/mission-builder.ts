import { getIndicatorById } from "@/lib/indicator-framework";
import { OFFICIAL_EVIDENCE_SOURCES } from "@/lib/evidence-infrastructure/sources/catalog";
import { MISSION_CATALOG_ENTRIES } from "@/lib/missions/mission-catalog";
import type {
  MissionCatalog,
  MissionCatalogEntry,
  MissionDefinition,
  MissionId,
  MissionPersonaId,
} from "@/lib/missions/mission-types";
import { MISSION_RECORD_VERSION } from "@/lib/missions/mission-types";
import { MISSION_CATALOG_VERSION } from "@/lib/missions/mission-version";

export const MISSION_ID_PATTERN = /^mission-(citizen|investor|government|student|researcher|academic|enterprise)-([a-z0-9-]+)$/;

/** Build a permanent mission ID from persona and stable slug — never random. */
export function buildMissionId(persona: MissionPersonaId, slug: string): MissionId {
  return `mission-${persona}-${slug}` as MissionId;
}

export function parseMissionId(
  missionId: string,
): { persona: MissionPersonaId; slug: string } | null {
  const match = MISSION_ID_PATTERN.exec(missionId);
  if (!match) return null;

  return {
    persona: match[1] as MissionPersonaId,
    slug: match[2],
  };
}

export function isValidMissionIdFormat(missionId: string): boolean {
  return MISSION_ID_PATTERN.test(missionId);
}

function resolveEvidenceFromIndicators(indicatorIds: readonly string[]): string[] {
  return indicatorIds
    .map((id) => getIndicatorById(id))
    .filter((indicator): indicator is NonNullable<typeof indicator> => indicator !== undefined)
    .map((indicator) => `evidence-${indicator.slug}`);
}

function resolveSourcesFromIndicators(indicatorIds: readonly string[]): string[] {
  const indicators = indicatorIds
    .map((id) => getIndicatorById(id))
    .filter((indicator): indicator is NonNullable<typeof indicator> => indicator !== undefined);

  const indicatorSlugs = new Set(indicators.map((indicator) => indicator.slug));

  return OFFICIAL_EVIDENCE_SOURCES.filter((source) =>
    source.supportedIndicators.some((slug) => indicatorSlugs.has(slug)),
  ).map((source) => source.id);
}

/** Materialize a full mission definition from a catalog entry. */
export function buildMissionDefinition(entry: MissionCatalogEntry): MissionDefinition {
  const missionId = buildMissionId(entry.persona, entry.slug);

  return {
    missionId,
    missionName: entry.missionName,
    persona: entry.persona,
    description: entry.description,
    supportedEntities: entry.supportedEntities,
    requiredIndicators: [...entry.requiredIndicatorIds],
    requiredEvidence: resolveEvidenceFromIndicators(entry.requiredIndicatorIds),
    requiredSources: resolveSourcesFromIndicators(entry.requiredIndicatorIds),
    requiredWorkspaces: [...entry.requiredWorkspaceIds],
    requiredReports: [...entry.requiredReportIds],
    status: entry.status ?? "defined",
    version: MISSION_RECORD_VERSION,
  };
}

/** Build the full mission catalog from declarative entries. */
export function buildMissionCatalog(): MissionCatalog {
  const missions = MISSION_CATALOG_ENTRIES.map(buildMissionDefinition);

  const byPersona: Partial<Record<MissionPersonaId, number>> = {};
  for (const mission of missions) {
    byPersona[mission.persona] = (byPersona[mission.persona] ?? 0) + 1;
  }

  return {
    version: MISSION_CATALOG_VERSION,
    missionRecordVersion: MISSION_RECORD_VERSION,
    builtAt: new Date().toISOString(),
    missions,
    missionCount: missions.length,
    byPersona,
  };
}
