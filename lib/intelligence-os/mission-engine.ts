/**
 * Mission Engine — derives thread state, validates completeness, links to projects.
 */

import { deriveMissionThreadFromLifecycle } from "@/lib/intelligence-os/mission-lifecycle";
import type { Mission, MissionThreadState } from "@/lib/intelligence-os/mission.types";
import { loadCurrentMission, loadMission } from "@/lib/intelligence-os/mission-store";

export function getCurrentMission(): Mission | null {
  return loadCurrentMission();
}

export function deriveMissionThread(mission: Mission | null): readonly MissionThreadState[] {
  return deriveMissionThreadFromLifecycle(mission);
}

export function isMissionCreationComplete(mission: Mission): boolean {
  return (
    mission.problem.trim().length >= 10 &&
    mission.whyExists.trim().length >= 5 &&
    mission.whoBenefits.trim().length >= 3 &&
    mission.successCriteria.trim().length >= 5
  );
}

export function getMissionById(id: string): Mission | null {
  return loadMission(id);
}
