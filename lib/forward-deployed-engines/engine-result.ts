/**
 * Engine result helpers — format results for workspace UI.
 */

import type { EnginePlan, EngineResult, EngineRunRecord } from "@/lib/forward-deployed-engines/engine-types";
import { exposeEngineProvenance } from "@/lib/forward-deployed-engines/engine-audit";

export function formatEngineResult(result: EngineResult): {
  run: EngineRunRecord;
  plan: EnginePlan;
  provenance: ReturnType<typeof exposeEngineProvenance>;
  canConfirm: boolean;
  canCancel: boolean;
} {
  return {
    run: result.run,
    plan: result.plan,
    provenance: exposeEngineProvenance(result.run),
    canConfirm: result.confirmationRequired && result.run.state === "awaiting_confirmation",
    canCancel: !["completed", "cancelled", "failed"].includes(result.run.state),
  };
}

export function summarizePlan(plan: EnginePlan): string {
  const taskCount = plan.proposedTasks.length;
  const missingCount = plan.missingInputs.filter((f) => f.required && !f.provided).length;
  return `${plan.clarifiedObjective} — ${taskCount} proposed tasks, ${missingCount} missing required inputs`;
}
