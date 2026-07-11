import type {
  MissionMilestone,
  MissionTransition,
  ResearchMission,
} from "@/lib/research-mission/research-mission-engine";

/**
 * Deterministic boolean/derived readers over a ResearchMission — the same "component asks,
 * never inspects" discipline every prior Workspace/Domain query module already established.
 * Every function here is a trivial, honest read of data the Builder already composed; nothing
 * is inferred, scored, or fabricated.
 */

export function isMissionTerminal(mission: ResearchMission): boolean {
  return mission.currentState === "archived";
}

export function isMissionBlocked(mission: ResearchMission): boolean {
  return mission.currentState === "blocked";
}

export function isMissionActive(mission: ResearchMission): boolean {
  return mission.currentState === "active";
}

export function hasOpenMissionRisks(mission: ResearchMission): boolean {
  return mission.risks.length > 0;
}

export function hasMissionDependencies(mission: ResearchMission): boolean {
  return mission.dependencies.length > 0;
}

export function latestMissionTransition(mission: ResearchMission): MissionTransition | undefined {
  return mission.history[mission.history.length - 1];
}

export function findAchievedMilestones(mission: ResearchMission): readonly MissionMilestone[] {
  return mission.milestones.filter((milestone) => milestone.status === "achieved");
}

export function findPendingMilestones(mission: ResearchMission): readonly MissionMilestone[] {
  return mission.milestones.filter((milestone) => milestone.status === "pending");
}

/** A real, countable total across every "Related X" artifact field — never a derived score. */
export function countMissionRelatedArtifacts(mission: ResearchMission): number {
  return (
    mission.relatedPublications.length + mission.relatedPatents.length + mission.relatedDatasets.length
  );
}
