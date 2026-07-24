/**
 * Engine audit — execution event history and provenance exposure.
 */

import type { EngineAuditEntry, EngineLifecycleState, EngineRunRecord } from "@/lib/forward-deployed-engines/engine-types";
import { ENGINE_SCHEMA_VERSION } from "@/lib/forward-deployed-engines/engine-types";

export function createEngineAuditEntry(
  state: EngineLifecycleState,
  message: string,
  actorId?: string,
): EngineAuditEntry {
  const id = typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `eng-audit-${Date.now()}`;
  return { id, timestamp: new Date().toISOString(), state, message, actorId };
}

export function appendAudit(
  run: EngineRunRecord,
  state: EngineLifecycleState,
  message: string,
  actorId?: string,
): EngineRunRecord {
  const entry = createEngineAuditEntry(state, message, actorId);
  return {
    ...run,
    state,
    auditTrail: [...run.auditTrail, entry],
    updatedAt: new Date().toISOString(),
  };
}

export type EngineProvenanceExposure = {
  readonly engineId: string;
  readonly engineVersion: string;
  readonly schemaVersion: number;
  readonly userProvidedInputs: readonly string[];
  readonly inferredInputs: readonly string[];
  readonly officialSourceMaterial: readonly string[];
  readonly missingEvidence: readonly string[];
  readonly limitations: readonly string[];
  readonly confirmationEventId?: string;
  readonly executionHistory: readonly EngineAuditEntry[];
};

export function exposeEngineProvenance(run: EngineRunRecord): EngineProvenanceExposure {
  const plan = run.plan;
  return {
    engineId: run.engineId,
    engineVersion: run.engineVersion,
    schemaVersion: ENGINE_SCHEMA_VERSION,
    userProvidedInputs: plan?.userProvidedFields ?? [],
    inferredInputs: plan?.inferredFields ?? [],
    officialSourceMaterial: [],
    missingEvidence: plan?.evidenceRequirements ?? [],
    limitations: plan?.limitations.map((l) => l.description) ?? [],
    confirmationEventId: run.confirmedAt,
    executionHistory: run.auditTrail,
  };
}
