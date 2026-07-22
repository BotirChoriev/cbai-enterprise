/**
 * Ontology provenance — audit trail and source material separation.
 */

import type { OntologyAuditEvent, OntologyObjectId, OntologyProvenance, OntologySourceReference } from "./types";

export function createAuditEvent(
  objectId: OntologyObjectId,
  action: OntologyAuditEvent["action"],
  details: Readonly<Record<string, unknown>> = {},
  actorId?: string,
): OntologyAuditEvent {
  const id = typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `audit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return {
    id,
    objectId,
    action,
    actorId,
    timestamp: new Date().toISOString(),
    details,
  };
}

/** Distinguish official source material from localized UI summary. */
export function isOfficialSourceReference(ref: OntologySourceReference): boolean {
  return Boolean(ref.sourceId && ref.title);
}

export function mergeProvenance(
  existing: OntologyProvenance,
  update: Partial<OntologyProvenance>,
): OntologyProvenance {
  return {
    ...existing,
    ...update,
    inferredFields: update.inferredFields ?? existing.inferredFields,
    userProvidedFields: update.userProvidedFields ?? existing.userProvidedFields,
  };
}

export function markConfirmed(provenance: OntologyProvenance, confirmationEventId: string): OntologyProvenance {
  return { ...provenance, confirmationEventId };
}

export type ProvenanceSummary = {
  readonly source: OntologyProvenance["source"];
  readonly userProvided: readonly string[];
  readonly inferred: readonly string[];
  readonly hasConfirmation: boolean;
  readonly engineId?: string;
  readonly legacyRecordId?: string;
};

export function summarizeProvenance(provenance: OntologyProvenance): ProvenanceSummary {
  return {
    source: provenance.source,
    userProvided: provenance.userProvidedFields ?? [],
    inferred: provenance.inferredFields ?? [],
    hasConfirmation: Boolean(provenance.confirmationEventId),
    engineId: provenance.engineId,
    legacyRecordId: provenance.legacyRecordId,
  };
}
