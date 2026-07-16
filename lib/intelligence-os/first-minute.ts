/**
 * EPIC-21 — First 60 seconds: intention-first path to meaningful result.
 */

import type { Mission } from "@/lib/intelligence-os/mission.types";
import { resolveGoalRoute, type UserGoal } from "@/lib/intelligence-os/intelligence-gateway";
import { getMissionNextAction } from "@/lib/intelligence-os/mission-lifecycle";
import { loadProjects } from "@/lib/project/project-store";

export type FirstMinuteAction = {
  readonly label: string;
  readonly href: string;
  readonly reason: string;
  readonly exposesArchitecture: false;
};

export function deriveFirstMinuteAction(mission: Mission | null): FirstMinuteAction {
  if (mission?.projectId) {
    const next = getMissionNextAction(mission);
    if (next) {
      return {
        label: next.nextAction,
        href: next.href,
        reason: "Continue active mission work",
        exposesArchitecture: false,
      };
    }
    return {
      label: "Continue mission work",
      href: `/my-work?project=${mission.projectId}`,
      reason: "Mission and project already linked",
      exposesArchitecture: false,
    };
  }

  const projects = loadProjects();
  if (projects.length > 0) {
    const latest = projects[0];
    return {
      label: "Continue your work",
      href: `/my-work?project=${latest.id}`,
      reason: "Existing project on device",
      exposesArchitecture: false,
    };
  }

  return {
    label: "Start with a goal",
    href: "/search",
    reason: "Intelligence Gateway — choose what you want to do",
    exposesArchitecture: false,
  };
}

export function deriveFirstMinuteGoal(mission: Mission | null): UserGoal {
  if (mission?.projectId) return "continue";
  if (mission) return "create";
  if (loadProjects().length > 0) return "continue";
  return "research";
}

export function deriveFirstMinutePath(mission: Mission | null): {
  readonly action: FirstMinuteAction;
  readonly goal: UserGoal;
  readonly goalRoute: ReturnType<typeof resolveGoalRoute>;
} {
  const goal = deriveFirstMinuteGoal(mission);
  return {
    action: deriveFirstMinuteAction(mission),
    goal,
    goalRoute: resolveGoalRoute(goal, mission),
  };
}
