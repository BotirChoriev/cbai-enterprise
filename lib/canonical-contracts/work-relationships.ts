/**
 * Mission / Project / Operational Object relationship contracts (Stage 1).
 * Documents ID relationship rules without merging schemas or migrating stores.
 */

export type WorkArtifactKind = "mission" | "project" | "operational_object";

export type WorkRelationshipEdge = {
  readonly fromKind: WorkArtifactKind;
  readonly fromId: string;
  readonly toKind: WorkArtifactKind;
  readonly toId: string;
  readonly relation: "mission_project" | "oo_links_project" | "oo_links_mission" | "other";
};

/**
 * Invariants — tested on fixtures only; stores unchanged.
 */
export const WORK_RELATIONSHIP_RULES = {
  missionMayReferenceProjectId: true,
  operationalObjectMayLinkProjectOrMission: true,
  doNotMergeSchemas: true,
  preserveUnknownFields: true,
  preserveIdsAndTimestamps: true,
  voiceIdentityMustNotAutoCreateProject: true,
} as const;

export type WorkRelationshipFixture = {
  readonly missionId: string;
  readonly projectId?: string;
  readonly operationalObjectId?: string;
  readonly linkedProjectId?: string;
};

/** Pure check: if mission has projectId, it must be a non-empty string. */
export function assertMissionProjectLink(fixture: WorkRelationshipFixture): readonly string[] {
  const issues: string[] = [];
  if (fixture.projectId !== undefined && fixture.projectId.trim() === "") {
    issues.push("mission.projectId must not be empty string when present");
  }
  if (fixture.linkedProjectId && !fixture.operationalObjectId) {
    issues.push("OO project link requires operationalObjectId in fixture");
  }
  return issues;
}
