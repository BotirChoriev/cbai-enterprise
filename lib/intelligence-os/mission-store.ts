/**
 * Mission persistence — local, honest, namespaced like the project engine.
 */

import type { Mission, MissionDraft, MissionStatus } from "@/lib/intelligence-os/mission.types";
import { resolveStorageKey } from "@/lib/storage/namespaced-key";

const MISSIONS_KEY = "cbai-missions";
const CURRENT_MISSION_KEY = "cbai-current-mission-id";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function readMissions(): Mission[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(resolveStorageKey(MISSIONS_KEY));
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isMission);
  } catch {
    return [];
  }
}

function writeMissions(missions: readonly Mission[]): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(resolveStorageKey(MISSIONS_KEY), JSON.stringify(missions));
}

function isMission(value: unknown): value is Mission {
  if (!value || typeof value !== "object") return false;
  const m = value as Mission;
  return typeof m.id === "string" && typeof m.problem === "string" && typeof m.status === "string";
}

function newId(): string {
  return `mission-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function loadMissions(): Mission[] {
  return readMissions().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function loadMission(id: string): Mission | null {
  return readMissions().find((m) => m.id === id) ?? null;
}

export function loadCurrentMission(): Mission | null {
  if (!isBrowser()) return null;
  const currentId = window.localStorage.getItem(resolveStorageKey(CURRENT_MISSION_KEY));
  if (!currentId) {
    const active = readMissions().find((m) => m.status === "active");
    return active ?? readMissions()[0] ?? null;
  }
  return loadMission(currentId);
}

export function setCurrentMission(id: string | null): void {
  if (!isBrowser()) return;
  if (id) {
    window.localStorage.setItem(resolveStorageKey(CURRENT_MISSION_KEY), id);
  } else {
    window.localStorage.removeItem(resolveStorageKey(CURRENT_MISSION_KEY));
  }
}

export function createMission(draft: MissionDraft): Mission {
  const now = new Date().toISOString();
  const mission: Mission = {
    id: newId(),
    status: draft.status ?? "active",
    createdAt: now,
    updatedAt: now,
    problem: draft.problem.trim(),
    whyExists: draft.whyExists.trim(),
    whoBenefits: draft.whoBenefits.trim(),
    whoCouldBeHarmed: draft.whoCouldBeHarmed.trim(),
    evidenceHave: draft.evidenceHave.trim(),
    evidenceMissing: draft.evidenceMissing.trim(),
    disciplines: draft.disciplines.filter(Boolean),
    capabilitiesNeeded: draft.capabilitiesNeeded.trim(),
    environmentalImpact: draft.environmentalImpact.trim(),
    successCriteria: draft.successCriteria.trim(),
    projectId: draft.projectId,
  };
  const missions = readMissions();
  writeMissions([mission, ...missions.map((m) => (m.status === "active" ? { ...m, status: "paused" as MissionStatus } : m))]);
  setCurrentMission(mission.id);
  return mission;
}

export function updateMission(id: string, patch: Partial<Omit<Mission, "id" | "createdAt">>): Mission | null {
  const missions = readMissions();
  const index = missions.findIndex((m) => m.id === id);
  if (index === -1) return null;
  const updated: Mission = {
    ...missions[index],
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  missions[index] = updated;
  writeMissions(missions);
  return updated;
}

export function linkMissionToProject(missionId: string, projectId: string): Mission | null {
  return updateMission(missionId, { projectId, status: "active" });
}
