/**
 * EPIC-05 — Mission Teams (not departments).
 */

export type TeamMembershipRef = {
  /** Opaque participant reference — never a fabricated person profile. */
  readonly participantRef: string;
  readonly joinedAt: string;
};

/** Mission Team — cross-org, multi-mission membership allowed at architecture level. */
export type MissionTeam = {
  readonly id: string;
  readonly name: string;
  readonly organizationId: string | null;
  readonly missionIds: readonly string[];
  readonly memberRefs: readonly TeamMembershipRef[];
  readonly purpose: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type TeamArchitectureNote = {
  readonly multiTeamMembership: true;
  readonly multiMissionMembership: true;
  readonly multiOrganizationMembership: true;
  readonly limitation: string;
};

export const TEAM_ARCHITECTURE: TeamArchitectureNote = {
  multiTeamMembership: true,
  multiMissionMembership: true,
  multiOrganizationMembership: true,
  limitation:
    "Team records are architecture-only until EPIC-15 cloud membership is connected. No fake roster is shown.",
};
