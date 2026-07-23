/**
 * Device-local mission engine runtime store (Phase 5).
 * Empty until the user creates or attaches runtime to a mission — no fabricated progress.
 */

import {
  applyMissionStageTransition,
  canRecordFinalDecision,
  isMissionEngineStage,
} from "@/lib/mission-engine/stage-engine";
import type {
  MissionDecisionRecord,
  MissionEngineRuntime,
  MissionEngineStage,
  MissionEngineTask,
  MissionEvidenceRequirement,
  MissionHumanReviewCheckpoint,
  MissionStageTransitionResult,
} from "@/lib/mission-engine/types";
import { resolveStorageKey } from "@/lib/storage/namespaced-key";

const MISSION_ENGINE_KEY = "cbai-mission-engine-runtimes";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function isRuntime(value: unknown): value is MissionEngineRuntime {
  if (!value || typeof value !== "object") return false;
  const row = value as MissionEngineRuntime;
  return typeof row.missionId === "string" && isMissionEngineStage(row.stage) && Array.isArray(row.stageAudit);
}

function readRuntimes(): MissionEngineRuntime[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(resolveStorageKey(MISSION_ENGINE_KEY));
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isRuntime);
  } catch {
    return [];
  }
}

function writeRuntimes(runtimes: readonly MissionEngineRuntime[]): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(resolveStorageKey(MISSION_ENGINE_KEY), JSON.stringify(runtimes));
}

export function loadMissionEngineRuntimes(): MissionEngineRuntime[] {
  return readRuntimes().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function loadMissionEngineRuntime(missionId: string): MissionEngineRuntime | null {
  return readRuntimes().find((row) => row.missionId === missionId) ?? null;
}

export function createMissionEngineRuntime(missionId: string): MissionEngineRuntime {
  const existing = loadMissionEngineRuntime(missionId);
  if (existing) return existing;
  const now = new Date().toISOString();
  const runtime: MissionEngineRuntime = {
    missionId,
    stage: "define",
    tasks: [],
    assignees: [],
    evidenceRequirements: [],
    humanReviewCheckpoints: [],
    decision: null,
    stageAudit: [
      {
        id: `audit-${Date.now()}-init`,
        fromStage: null,
        toStage: "define",
        changedBy: "local-user",
        changedAt: now,
        note: "Mission engine runtime created (planned — no fabricated progress).",
      },
    ],
    createdAt: now,
    updatedAt: now,
  };
  writeRuntimes([runtime, ...readRuntimes()]);
  return runtime;
}

function saveRuntime(runtime: MissionEngineRuntime): MissionEngineRuntime {
  const runtimes = readRuntimes();
  const index = runtimes.findIndex((row) => row.missionId === runtime.missionId);
  if (index === -1) {
    writeRuntimes([runtime, ...runtimes]);
  } else {
    runtimes[index] = runtime;
    writeRuntimes(runtimes);
  }
  return runtime;
}

export function transitionMissionEngineStage(
  missionId: string,
  toStage: MissionEngineStage,
  changedBy: string,
  note?: string | null,
): MissionStageTransitionResult {
  const current = loadMissionEngineRuntime(missionId) ?? createMissionEngineRuntime(missionId);
  const result = applyMissionStageTransition(current, toStage, changedBy, note);
  if (!result.ok) return result;
  saveRuntime(result.runtime);
  return result;
}

export function upsertMissionEvidenceRequirement(
  missionId: string,
  requirement: MissionEvidenceRequirement,
): MissionEngineRuntime | null {
  const current = loadMissionEngineRuntime(missionId) ?? createMissionEngineRuntime(missionId);
  const without = current.evidenceRequirements.filter((row) => row.id !== requirement.id);
  return saveRuntime({
    ...current,
    evidenceRequirements: [...without, requirement],
    updatedAt: new Date().toISOString(),
  });
}

export function upsertMissionTask(
  missionId: string,
  task: MissionEngineTask,
): MissionEngineRuntime | null {
  const current = loadMissionEngineRuntime(missionId) ?? createMissionEngineRuntime(missionId);
  const without = current.tasks.filter((row) => row.id !== task.id);
  const assignees = task.assigneeId
    ? Array.from(new Set([...current.assignees, task.assigneeId]))
    : [...current.assignees];
  return saveRuntime({
    ...current,
    tasks: [...without, task],
    assignees,
    updatedAt: new Date().toISOString(),
  });
}

export function upsertHumanReviewCheckpoint(
  missionId: string,
  checkpoint: MissionHumanReviewCheckpoint,
): MissionEngineRuntime | null {
  const current = loadMissionEngineRuntime(missionId) ?? createMissionEngineRuntime(missionId);
  const without = current.humanReviewCheckpoints.filter((row) => row.id !== checkpoint.id);
  return saveRuntime({
    ...current,
    humanReviewCheckpoints: [...without, checkpoint],
    updatedAt: new Date().toISOString(),
  });
}

export function recordMissionDecision(
  missionId: string,
  decision: MissionDecisionRecord,
): MissionStageTransitionResult {
  const current = loadMissionEngineRuntime(missionId) ?? createMissionEngineRuntime(missionId);
  const gate = canRecordFinalDecision(current, decision.approvedByHuman);
  if (!gate.ok) return gate;
  const updated = saveRuntime({
    ...current,
    decision,
    updatedAt: new Date().toISOString(),
  });
  return { ok: true, runtime: updated };
}

export const MISSION_ENGINE_STORAGE_KEY = MISSION_ENGINE_KEY;
