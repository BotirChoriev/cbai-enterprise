/**
 * Unified Mission OS operating context — connects Mission, Project, entities, and URL params
 * without a second mission system.
 */

import type { ContextEntityRef } from "@/lib/context/context-types";
import { pinEntity, recordRecentEntity } from "@/lib/context/context-history";
import {
  linkEntityToProject,
  loadProjectEntities,
  saveProjectNote,
} from "@/lib/project/project-store";
import {
  createMission,
  linkMissionToProject,
  loadCurrentMission,
  setCurrentMission,
} from "@/lib/intelligence-os/mission-store";
import { createProject } from "@/lib/project/project-store";
import { notifyMissionDataChanged } from "@/lib/intelligence-os/mission-activation-events";
import type { Mission } from "@/lib/intelligence-os/mission.types";

export const OPERATING_PARAM_KEYS = {
  mission: "mission",
  project: "project",
} as const;

export type OperatingUrlParams = {
  missionId?: string | null;
  projectId?: string | null;
};

export type AddEntityToMissionResult =
  | { ok: true; missionId: string; projectId: string; alreadyLinked: boolean }
  | { ok: false; reason: "no_mission" | "no_project" | "browser_unavailable" };

export function parseOperatingParams(searchParams: URLSearchParams): OperatingUrlParams {
  return {
    missionId: searchParams.get(OPERATING_PARAM_KEYS.mission),
    projectId: searchParams.get(OPERATING_PARAM_KEYS.project),
  };
}

export function serializeOperatingParams(params: OperatingUrlParams): Record<string, string> {
  const out: Record<string, string> = {};
  if (params.missionId) out[OPERATING_PARAM_KEYS.mission] = params.missionId;
  if (params.projectId) out[OPERATING_PARAM_KEYS.project] = params.projectId;
  return out;
}

export function mergeQueryParams(...paramSets: Record<string, string>[]): string {
  const merged = new URLSearchParams();
  for (const set of paramSets) {
    for (const [key, value] of Object.entries(set)) {
      if (value) merged.set(key, value);
    }
  }
  const query = merged.toString();
  return query ? `?${query}` : "";
}

export function buildOperatingHref(
  path: string,
  ...paramSets: Record<string, string>[]
): string {
  return `${path}${mergeQueryParams(...paramSets)}`;
}

export function operatingParamsFromMission(mission: Mission | null | undefined): OperatingUrlParams {
  if (!mission) return {};
  return {
    missionId: mission.id,
    projectId: mission.projectId ?? null,
  };
}

/** Activate mission from URL when present — keeps deep links and cross-route navigation honest. */
export function syncMissionFromOperatingParams(params: OperatingUrlParams): void {
  if (typeof window === "undefined") return;
  if (params.missionId) {
    setCurrentMission(params.missionId);
  }
}

/**
 * Start a mission from a single problem statement — creates linked project and activates mission.
 */
export function startMissionFromProblem(problem: string): Mission | null {
  if (typeof window === "undefined") return null;
  const trimmed = problem.trim();
  if (trimmed.length < 10) return null;

  const project = createProject({
    title: trimmed.slice(0, 120),
    type: "research_project",
    description: trimmed,
    tags: [],
    visibility: "private",
    status: "active",
    researchQuestion: trimmed,
  });

  const mission = createMission({
    problem: trimmed,
    whyExists: trimmed,
    whoBenefits: "",
    whoCouldBeHarmed: "",
    evidenceHave: "",
    evidenceMissing: "",
    disciplines: [],
    capabilitiesNeeded: "",
    environmentalImpact: "",
    successCriteria: "",
    projectId: project.id,
  });

  linkMissionToProject(mission.id, project.id);
  notifyMissionDataChanged("project");
  return mission;
}

/** Link a catalog entity to the active mission's project and workspace bookmarks. */
export function addEntityToActiveMission(
  entity: ContextEntityRef,
  reason?: string,
): AddEntityToMissionResult {
  if (typeof window === "undefined") {
    return { ok: false, reason: "browser_unavailable" };
  }

  const mission = loadCurrentMission();
  if (!mission) return { ok: false, reason: "no_mission" };
  if (!mission.projectId) return { ok: false, reason: "no_project" };

  const linked = loadProjectEntities(mission.projectId);
  const alreadyLinked = linked.some((e) => e.kind === entity.kind && e.id === entity.id);

  if (!alreadyLinked) {
    linkEntityToProject(mission.projectId, entity);
    saveProjectNote({
      projectId: mission.projectId,
      body: reason?.trim() || `Entity linked to mission: ${entity.name} (${entity.kind}).`,
      linkedEntityId: entity.id,
      linkedEntityName: entity.name,
      linkedEntityType: entity.kind,
    });
  }

  recordRecentEntity(entity);
  pinEntity(entity);
  notifyMissionDataChanged("project");
  return {
    ok: true,
    missionId: mission.id,
    projectId: mission.projectId,
    alreadyLinked,
  };
}

export function myWorkHrefForMission(mission: Mission | null | undefined): string {
  if (!mission?.projectId) return "/my-work";
  return buildOperatingHref("/my-work", serializeOperatingParams(operatingParamsFromMission(mission)));
}

/** Canonical activated research topic — microbiology has the richest real workflow today. */
export const ACTIVATED_RESEARCH_TOPIC_PATH = "/research/microbiology" as const;
