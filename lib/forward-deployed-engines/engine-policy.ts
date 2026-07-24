/**
 * Engine policy — confirmation gates, allowlisting, stop conditions.
 */

import type {
  EnginePlan,
  EngineRunRecord,
  ForwardDeployedEngineId,
} from "@/lib/forward-deployed-engines/engine-types";
import { getEngineDefinition } from "@/lib/forward-deployed-engines/engine-registry";

export type EnginePolicyCheck = {
  readonly allowed: boolean;
  readonly reason?: string;
};

export function canExecuteEngine(run: EngineRunRecord): EnginePolicyCheck {
  if (run.state !== "awaiting_confirmation") {
    return { allowed: false, reason: "Engine must be in awaiting_confirmation state" };
  }
  if (!run.plan) {
    return { allowed: false, reason: "No plan to execute" };
  }
  if (run.plan.missingInputs.some((f) => f.required && !f.provided)) {
    return { allowed: false, reason: "Required inputs still missing" };
  }
  return { allowed: true };
}

export function canCancelEngine(run: EngineRunRecord): boolean {
  return !["completed", "cancelled", "failed"].includes(run.state);
}

export function isActionAllowlisted(engineId: ForwardDeployedEngineId, actionId: string): boolean {
  const def = getEngineDefinition(engineId);
  return def.allowlistedActions.includes(actionId);
}

/** Never accept arbitrary model-generated hrefs or mutation payloads. */
export function validateEngineAction(
  engineId: ForwardDeployedEngineId,
  actionId: string,
): EnginePolicyCheck {
  if (!isActionAllowlisted(engineId, actionId)) {
    return { allowed: false, reason: `Action ${actionId} not allowlisted for engine ${engineId}` };
  }
  return { allowed: true };
}

export function shouldStopForMissingAuthority(plan: EnginePlan): boolean {
  return plan.missingInputs.some((f) => f.required && !f.provided && !f.inferred);
}

export function shouldStopForMissingEvidence(plan: EnginePlan): boolean {
  return plan.evidenceRequirements.length > 0 && plan.missingInputs.some(
    (f) => f.key.startsWith("evidence") && f.required && !f.provided,
  );
}

/** Engines must never fabricate data, sources, progress or completion. */
export function planIntegrityCheck(plan: EnginePlan): EnginePolicyCheck {
  if (!plan.clarifiedObjective.trim()) {
    return { allowed: false, reason: "Clarified objective is empty" };
  }
  for (const task of plan.proposedTasks) {
    if (!task.title.trim()) {
      return { allowed: false, reason: "Proposed task has empty title" };
    }
  }
  return { allowed: true };
}
