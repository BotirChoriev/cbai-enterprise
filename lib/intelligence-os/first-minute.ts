/**
 * EPIC-21 — First 60 seconds: intention-first path to meaningful result.
 */

import type { Mission } from "@/lib/intelligence-os/mission.types";
import type { MissionThreadStage } from "@/lib/intelligence-os/mission.types";
import { resolveGoalRoute, type UserGoal } from "@/lib/intelligence-os/intelligence-gateway";
import { getMissionNextAction, deriveMissionLifecycle } from "@/lib/intelligence-os/mission-lifecycle";
import { loadProjects } from "@/lib/project/project-store";

export type FirstMinuteAction = {
  readonly label: string;
  readonly labelKey?: keyof typeof import("@/lib/i18n/platform-copy-build020-en").ZERO_LEARNING_CURVE_EN;
  readonly nextActionKey?: keyof typeof import("@/lib/i18n/platform-copy-build020-en").MISSION_LIFECYCLE_NEXT_EN;
  readonly href: string;
  readonly reason: string;
  readonly exposesArchitecture: false;
};

export function translateFirstMinuteAction(
  translate: (path: string) => string,
  action: FirstMinuteAction,
): string {
  if (action.labelKey) {
    return translate(`zeroLearningCurve.${action.labelKey}`);
  }
  if (action.nextActionKey) {
    return translate(`missionLifecycle.${action.nextActionKey}`);
  }
  return action.label;
}

const MISSION_CONTINUE_INTENT: Partial<
  Record<MissionThreadStage, FirstMinuteAction["labelKey"]>
> = {
  mission: "continueMission",
  question: "continueMission",
  evidence: "continueEvidence",
  reasoning: "continueReview",
  collaborators: "continueMission",
  impact: "continueMission",
  report: "continueReport",
};

function missionContinueIntentKey(stage: MissionThreadStage): FirstMinuteAction["labelKey"] {
  return MISSION_CONTINUE_INTENT[stage] ?? "continueMission";
}

export function deriveFirstMinuteAction(mission: Mission | null): FirstMinuteAction {
  if (mission?.projectId) {
    const next = getMissionNextAction(mission);
    if (next) {
      return {
        label: next.nextAction,
        labelKey: missionContinueIntentKey(next.stage),
        nextActionKey: next.nextActionKey,
        href: next.href,
        reason: "Continue active mission work",
        exposesArchitecture: false,
      };
    }
    return {
      label: "Continue mission",
      labelKey: "continueMission",
      href: `/my-work?project=${mission.projectId}`,
      reason: "Mission and project already linked",
      exposesArchitecture: false,
    };
  }

  const projects = loadProjects();
  if (projects.length > 0) {
    const latest = projects[0];
    return {
      label: "Continue mission",
      labelKey: "continueMission",
      href: `/my-work?project=${latest.id}`,
      reason: "Existing project on device",
      exposesArchitecture: false,
    };
  }

  return {
    label: "Start a mission",
    labelKey: "startMission",
    href: "/?create=1",
    reason: "Name the problem first",
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

export type MissionStoryBeat = "beginning" | "middle" | "unknown" | "next" | "completion";

export type RouteCompanionContext = {
  readonly routeKey: string;
  readonly storyBeat: MissionStoryBeat;
  readonly nextHref: string;
  readonly nextLabel: string;
  readonly nextActionKey?: keyof typeof import("@/lib/i18n/platform-copy-build020-en").MISSION_LIFECYCLE_NEXT_EN;
  readonly nextLabelKey?: keyof typeof import("@/lib/i18n/platform-copy-build020-en").ZERO_LEARNING_CURVE_EN;
};

const ROUTE_KEY_MAP: Record<string, string> = {
  "/": "home",
  "/knowledge": "evidence",
  "/reasoning": "reasoning",
  "/graph": "graph",
  "/reports": "reports",
  "/analytics": "reports",
  "/my-work": "myWork",
  "/search": "search",
  "/countries": "countries",
  "/companies": "companies",
  "/universities": "universities",
  "/trust": "trust",
  "/settings": "settings",
  "/account": "account",
  "/about": "about",
  "/research": "research",
  "/investor": "investor",
  "/governance": "governance",
  "/ai-control": "governance",
};

export function deriveMissionStoryBeat(mission: Mission | null): MissionStoryBeat {
  if (!mission) return "beginning";
  const lifecycle = deriveMissionLifecycle(mission);
  if (lifecycle.every((s) => s.status === "complete")) return "completion";
  const open = lifecycle.find((s) => s.status === "missing" || s.status === "partial");
  if (!open) return "next";
  if (open.stage === "mission" || open.stage === "question") return "beginning";
  if (open.stage === "evidence" || open.stage === "reasoning") return "middle";
  if (open.missing?.toLowerCase().includes("unknown") || open.status === "blocked") return "unknown";
  return "next";
}

export function storyBeatI18nKey(beat: MissionStoryBeat): string {
  const keys: Record<MissionStoryBeat, string> = {
    beginning: "storyBeatBeginning",
    middle: "storyBeatMiddle",
    unknown: "storyBeatUnknown",
    next: "storyBeatNext",
    completion: "storyBeatCompletion",
  };
  return keys[beat];
}

export function routePurposeI18nKey(routeKey: string): string {
  const keys: Record<string, string> = {
    home: "routeHomePurpose",
    evidence: "routeEvidencePurpose",
    reasoning: "routeReasoningPurpose",
    graph: "routeGraphPurpose",
    reports: "routeReportsPurpose",
    myWork: "routeMyWorkPurpose",
    search: "routeSearchPurpose",
    countries: "routeCountriesPurpose",
    companies: "routeCompaniesPurpose",
    universities: "routeUniversitiesPurpose",
    trust: "routeTrustPurpose",
    research: "routeResearchPurpose",
    settings: "routeSettingsPurpose",
    account: "routeAccountPurpose",
    about: "routeAboutPurpose",
    investor: "routeInvestorPurpose",
    governance: "routeGovernancePurpose",
  };
  return keys[routeKey] ?? "routeHomePurpose";
}

/** EPIC-24 — Route companion: where, why, one next step — no fake AI memory. */
export function deriveRouteCompanion(pathname: string, mission: Mission | null): RouteCompanionContext {
  const base = pathname.split("?")[0];
  const routeKey = ROUTE_KEY_MAP[base] ?? (base.startsWith("/research/") ? "research" : "home");
  const lifecycleNext = getMissionNextAction(mission);
  const fallback = deriveFirstMinuteAction(mission);
  return {
    routeKey,
    storyBeat: deriveMissionStoryBeat(mission),
    nextHref: lifecycleNext?.href ?? fallback.href,
    nextLabel: lifecycleNext?.nextAction ?? fallback.label,
    nextActionKey: lifecycleNext?.nextActionKey ?? fallback.nextActionKey,
    nextLabelKey: lifecycleNext
      ? missionContinueIntentKey(lifecycleNext.stage)
      : fallback.labelKey,
  };
}
