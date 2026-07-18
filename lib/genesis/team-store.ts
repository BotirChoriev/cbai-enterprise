/**
 * Genesis teams — persisted MissionTeam records (device-local).
 */

import {
  genesisId,
  notifyGenesisChanged,
  readGenesisList,
  writeGenesisList,
} from "@/lib/genesis/genesis-storage";
import { recordGenesisAudit } from "@/lib/genesis/genesis-audit-store";
import type { MissionTeam, TeamMembershipRef } from "@/lib/organization-os/team.types";

const TEAMS_KEY = "cbai-genesis-teams";
const memoryTeams: MissionTeam[] = [];

function isTeam(v: unknown): v is MissionTeam {
  const t = v as MissionTeam;
  return typeof t?.id === "string" && typeof t?.name === "string";
}

export function loadTeams(organizationId?: string): MissionTeam[] {
  const all = readGenesisList(TEAMS_KEY, isTeam, memoryTeams);
  return organizationId ? all.filter((t) => t.organizationId === organizationId) : all;
}

export function createTeam(input: {
  name: string;
  organizationId: string | null;
  missionIds?: readonly string[];
  purpose: string;
  memberRefs?: readonly TeamMembershipRef[];
}): MissionTeam {
  const now = new Date().toISOString();
  const team: MissionTeam = {
    id: genesisId("team"),
    name: input.name.trim(),
    organizationId: input.organizationId,
    missionIds: input.missionIds ?? [],
    memberRefs: input.memberRefs ?? [],
    purpose: input.purpose.trim(),
    createdAt: now,
    updatedAt: now,
  };
  writeGenesisList(TEAMS_KEY, [...readGenesisList(TEAMS_KEY, isTeam, memoryTeams), team], memoryTeams);
  recordGenesisAudit({
    domain: "organization",
    action: "team_created",
    recordType: "team",
    recordId: team.id,
    actorId: "operator",
    organizationId: input.organizationId,
    newState: team.name,
  });
  notifyGenesisChanged();
  return team;
}

export function linkTeamToMission(teamId: string, missionId: string): MissionTeam | null {
  const all = readGenesisList(TEAMS_KEY, isTeam, memoryTeams);
  const idx = all.findIndex((t) => t.id === teamId);
  if (idx < 0) return null;
  const prev = all[idx]!;
  if (prev.missionIds.includes(missionId)) return prev;
  const updated: MissionTeam = {
    ...prev,
    missionIds: [...prev.missionIds, missionId],
    updatedAt: new Date().toISOString(),
  };
  const next = [...all];
  next[idx] = updated;
  writeGenesisList(TEAMS_KEY, next, memoryTeams);
  notifyGenesisChanged();
  return updated;
}
