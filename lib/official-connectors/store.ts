/**
 * In-memory verified observation store — publishes only after validation.
 * Duplicate prevention by provenance+indicator+entity+period key.
 */

import type {
  ConnectorHealthSnapshot,
  OfficialSourceSlug,
  VerifiedObservation,
} from "@/lib/official-connectors/types";
import { assertPublishable, dedupeKey } from "@/lib/official-connectors/framework/validate";
import { appendAudit } from "@/lib/official-connectors/framework/audit";

const observations = new Map<string, VerifiedObservation>();
const health = new Map<string, ConnectorHealthSnapshot>();

export function publishObservation(observation: VerifiedObservation): boolean {
  const error = assertPublishable(observation);
  if (error) {
    appendAudit({
      connectorId: observation.provenance.connectorId,
      action: "reject",
      detail: error,
      failureClass: "validation_failed",
    });
    return false;
  }
  const key = dedupeKey(observation);
  observations.set(key, observation);
  appendAudit({
    connectorId: observation.provenance.connectorId,
    action: "publish",
    detail: key,
  });
  return true;
}

export function listObservations(filter?: {
  entityId?: string;
  sourceSlug?: OfficialSourceSlug;
}): readonly VerifiedObservation[] {
  const all = [...observations.values()];
  return all.filter((item) => {
    if (filter?.entityId && item.entityId !== filter.entityId) return false;
    if (filter?.sourceSlug && item.provenance.sourceSlug !== filter.sourceSlug) return false;
    return true;
  });
}

export function clearObservations(): void {
  observations.clear();
}

export function setConnectorHealth(snapshot: ConnectorHealthSnapshot): void {
  health.set(snapshot.connectorId, snapshot);
}

export function getConnectorHealth(connectorId: string): ConnectorHealthSnapshot | null {
  return health.get(connectorId) ?? null;
}

export function listConnectorHealth(): readonly ConnectorHealthSnapshot[] {
  return [...health.values()];
}

export function connectedSourceSlugs(): readonly OfficialSourceSlug[] {
  const slugs = new Set<OfficialSourceSlug>();
  for (const item of observations.values()) {
    if (item.verificationState === "verified") {
      slugs.add(item.provenance.sourceSlug);
    }
  }
  for (const item of health.values()) {
    if (item.liveCapable && item.status === "healthy" && item.lastSuccessAt) {
      slugs.add(item.sourceSlug);
    }
  }
  return [...slugs];
}

export function observationCount(): number {
  return observations.size;
}
