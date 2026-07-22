/**
 * Engine runner — lifecycle management with confirmation gates.
 */

import { getEngineDefinition } from "@/lib/forward-deployed-engines/engine-registry";
import { appendAudit } from "@/lib/forward-deployed-engines/engine-audit";
import { runEnginePlanner } from "@/lib/forward-deployed-engines/engine-planner";
import { canCancelEngine, canExecuteEngine, planIntegrityCheck, shouldStopForMissingAuthority, shouldStopForMissingEvidence } from "@/lib/forward-deployed-engines/engine-policy";
import type { EngineResult, EngineRunDraft, EngineRunRecord } from "@/lib/forward-deployed-engines/engine-types";
import { ENGINE_SCHEMA_VERSION } from "@/lib/forward-deployed-engines/engine-types";

const ENGINE_RUNS_KEY = "cbai-engine-runs";

function readRuns(): EngineRunRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(ENGINE_RUNS_KEY);
    return raw ? (JSON.parse(raw) as EngineRunRecord[]) : [];
  } catch {
    return [];
  }
}

function writeRuns(runs: EngineRunRecord[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ENGINE_RUNS_KEY, JSON.stringify(runs));
}

function createRunId(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? `run-${crypto.randomUUID()}`
    : `run-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function startEngineRun(draft: EngineRunDraft): EngineResult {
  const def = getEngineDefinition(draft.engineId);
  const now = new Date().toISOString();
  let run: EngineRunRecord = {
    id: createRunId(),
    engineId: draft.engineId,
    engineVersion: def.version,
    schemaVersion: ENGINE_SCHEMA_VERSION,
    state: "understanding",
    objective: draft.objective,
    context: draft.context,
    ontologyObjectIds: [],
    auditTrail: [],
    createdAt: now,
    updatedAt: now,
  };
  run = appendAudit(run, "understanding", "Engine received objective");

  run = appendAudit(run, "planning", "Generating proposed plan");
  const plan = runEnginePlanner({
    engineId: draft.engineId,
    objective: draft.objective,
    context: draft.context,
  });

  const integrity = planIntegrityCheck(plan);
  if (!integrity.allowed) {
    run = appendAudit(run, "failed", integrity.reason ?? "Plan integrity check failed");
    persistRun(run);
    return { run, plan, readOnly: def.readOnlyDefault, confirmationRequired: false };
  }

  if (shouldStopForMissingAuthority(plan)) {
    run = appendAudit(run, "blocked", "Missing required authority or inputs");
    run = { ...run, plan, state: "blocked" };
    persistRun(run);
    return { run, plan, readOnly: def.readOnlyDefault, confirmationRequired: false };
  }

  if (shouldStopForMissingEvidence(plan)) {
    run = appendAudit(run, "needs_evidence", "Additional evidence required before proceeding");
    run = { ...run, plan, state: "needs_evidence" };
    persistRun(run);
    return { run, plan, readOnly: def.readOnlyDefault, confirmationRequired: false };
  }

  run = appendAudit(run, "awaiting_confirmation", "Plan ready for human review");
  run = { ...run, plan, state: "awaiting_confirmation" };
  persistRun(run);
  return { run, plan, readOnly: !plan.mutationRequired, confirmationRequired: plan.mutationRequired };
}

export function confirmEngineRun(runId: string, actorId?: string): EngineRunRecord | null {
  const runs = readRuns();
  const run = runs.find((r) => r.id === runId);
  if (!run) return null;
  const check = canExecuteEngine(run);
  if (!check.allowed) return null;

  let updated = appendAudit(run, "executing", "Human confirmed plan — executing allowlisted actions only", actorId);
  updated = {
    ...updated,
    confirmedAt: new Date().toISOString(),
    state: "executing",
  };
  updated = appendAudit(updated, "completed", "Engine run completed — mutations delegated to platform actions", actorId);
  updated = {
    ...updated,
    state: "completed",
    completedAt: new Date().toISOString(),
  };
  persistRun(updated);
  return updated;
}

export function cancelEngineRun(runId: string, actorId?: string): EngineRunRecord | null {
  const runs = readRuns();
  const run = runs.find((r) => r.id === runId);
  if (!run || !canCancelEngine(run)) return null;
  const updated = appendAudit(run, "cancelled", "Engine run cancelled", actorId);
  persistRun(updated);
  return updated;
}

export function getEngineRun(runId: string): EngineRunRecord | undefined {
  return readRuns().find((r) => r.id === runId);
}

export function listEngineRuns(engineId?: string): EngineRunRecord[] {
  const runs = readRuns();
  return engineId ? runs.filter((r) => r.engineId === engineId) : runs;
}

function persistRun(run: EngineRunRecord): void {
  const runs = readRuns();
  const idx = runs.findIndex((r) => r.id === run.id);
  if (idx >= 0) {
    runs[idx] = run;
  } else {
    runs.push(run);
  }
  writeRuns(runs);
}

export function resetEngineRunsForTests(): void {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(ENGINE_RUNS_KEY);
  }
}
