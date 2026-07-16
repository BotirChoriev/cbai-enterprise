/**
 * EPIC-21 — Intelligence Gateway: one universal entry (speak, type, choose goal).
 * Architecture only — routes through existing command resolution, never fake AI routing.
 */

import type { Mission } from "@/lib/intelligence-os/mission.types";
import { loadProjects } from "@/lib/project/project-store";

export type GatewayInputMode = "speak" | "type" | "choose_goal";

export type UserGoal =
  | "research"
  | "verify"
  | "compare"
  | "continue"
  | "create"
  | "collaborate"
  | "publish";

export type GoalRoute = {
  readonly goal: UserGoal;
  readonly href: string;
  readonly reason: string;
};

const GOAL_ROUTES: Record<UserGoal, Omit<GoalRoute, "goal">> = {
  research: { href: "/research", reason: "Research catalog and workspace" },
  verify: { href: "/knowledge", reason: "Evidence verification surface" },
  compare: { href: "/graph", reason: "Relationship and comparison view" },
  continue: { href: "/my-work", reason: "Resume active project work" },
  create: { href: "/?create=1", reason: "Mission creation on Intelligence Canvas" },
  collaborate: { href: "/trust", reason: "Collaboration requirements and trust" },
  publish: { href: "/reports", reason: "Report readiness and publication" },
};

export function resolveGoalRoute(goal: UserGoal, mission: Mission | null = null): GoalRoute {
  if (goal === "continue" && mission?.projectId) {
    return {
      goal,
      href: `/my-work?project=${mission.projectId}`,
      reason: "Continue linked project for active mission",
    };
  }
  if (goal === "create" && mission) {
    return {
      goal,
      href: mission.projectId ? `/my-work?project=${mission.projectId}` : "/my-work",
      reason: "Active mission — continue operating work",
    };
  }
  return { goal, ...GOAL_ROUTES[goal] };
}

export const USER_GOALS: readonly UserGoal[] = [
  "research",
  "verify",
  "compare",
  "continue",
  "create",
  "collaborate",
  "publish",
];

/** Contextual goals — fewer choices, matched to mission state. */
export function deriveContextualGoals(mission: Mission | null): readonly UserGoal[] {
  if (mission?.projectId) {
    return ["continue", "verify", "research", "publish"];
  }
  if (mission) {
    return ["create", "research", "verify", "continue"];
  }
  if (loadProjects().length > 0) {
    return ["continue", "research", "verify", "create"];
  }
  return ["research", "verify", "create", "continue"];
}

export function deriveGatewayEntryState(mission: Mission | null): {
  readonly primaryMode: GatewayInputMode;
  readonly hasResumePath: boolean;
  readonly resumeHref: string | null;
} {
  const project = mission?.projectId ? loadProjects().find((p) => p.id === mission.projectId) : null;
  return {
    primaryMode: mission ? "type" : "choose_goal",
    hasResumePath: Boolean(project),
    resumeHref: project ? `/my-work?project=${project.id}` : null,
  };
}

export const INTELLIGENCE_GATEWAY_NOTE =
  "Intent comes first. Speak and type use the existing command resolver — no fabricated AI routing.";
