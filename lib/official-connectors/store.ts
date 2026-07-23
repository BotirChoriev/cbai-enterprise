/**
 * Verified observation store — versioned; never silently overwrites.
 */

import type {
  ConnectorHealthSnapshot,
  OfficialSourceSlug,
  VerifiedObservation,
} from "@/lib/official-connectors/types";
import { assertPublishable, dedupeKey } from "@/lib/official-connectors/framework/validate";
import { appendAudit } from "@/lib/official-connectors/framework/audit";
import {
  connectedSlugsFromRegistry,
  markSourceConnected,
} from "@/lib/official-connectors/connection-status";
import { sourceHashForObservation } from "@/lib/official-connectors/persistence/source-hash";

export type ObservationVersionRecord = {
  readonly version: number;
  readonly sourceHash: string;
  readonly writtenAt: string;
  readonly observation: VerifiedObservation;
  readonly transformationLog: readonly string[];
};

const versionsByIdentity = new Map<string, ObservationVersionRecord[]>();
const health = new Map<string, ConnectorHealthSnapshot>();
const healthHistory = new Map<string, ConnectorHealthSnapshot[]>();

export type PublishOutcome =
  | { readonly ok: true; readonly version: number; readonly duplicate: false }
  | { readonly ok: false; readonly duplicate: true; readonly existingVersion: number; readonly message: string }
  | { readonly ok: false; readonly duplicate: false; readonly message: string };

export function publishObservation(
  observation: VerifiedObservation,
  options: { readonly markConnected?: boolean } = {},
): boolean {
  return publishObservationVersioned(observation, options).ok;
}

export function publishObservationVersioned(
  observation: VerifiedObservation,
  options: { readonly markConnected?: boolean } = {},
): PublishOutcome {
  const error = assertPublishable(observation);
  if (error) {
    appendAudit({
      connectorId: observation.provenance.connectorId,
      action: "reject",
      detail: error,
      failureClass: "validation_failed",
    });
    return { ok: false, duplicate: false, message: error };
  }

  const key = dedupeKey(observation);
  const hash = sourceHashForObservation(observation);
  const existing = versionsByIdentity.get(key) ?? [];
  const latest = existing[existing.length - 1];

  if (latest && latest.sourceHash === hash) {
    appendAudit({
      connectorId: observation.provenance.connectorId,
      action: "reject",
      detail: `duplicate:${key}`,
      failureClass: "validation_failed",
    });
    return {
      ok: false,
      duplicate: true,
      existingVersion: latest.version,
      message: "Duplicate observation rejected — prior verified version retained",
    };
  }

  const version = (latest?.version ?? 0) + 1;
  const record: ObservationVersionRecord = {
    version,
    sourceHash: hash,
    writtenAt: new Date().toISOString(),
    observation,
    transformationLog: [
      observation.transformationNotes,
      latest
        ? `Supersedes version ${latest.version} (hash ${latest.sourceHash}) without deleting it`
        : "Initial verified version",
    ],
  };
  versionsByIdentity.set(key, [...existing, record]);
  appendAudit({
    connectorId: observation.provenance.connectorId,
    action: "publish",
    detail: `${key}@v${version}`,
  });

  if (options.markConnected) {
    markSourceConnected(observation.provenance.sourceSlug, observation.provenance.retrievedAt);
  }

  return { ok: true, version, duplicate: false };
}

export function listObservations(filter?: {
  entityId?: string;
  sourceSlug?: OfficialSourceSlug;
}): readonly VerifiedObservation[] {
  const latest: VerifiedObservation[] = [];
  for (const versions of versionsByIdentity.values()) {
    const last = versions[versions.length - 1];
    if (!last) continue;
    const item = last.observation;
    if (filter?.entityId && item.entityId !== filter.entityId) continue;
    if (filter?.sourceSlug && item.provenance.sourceSlug !== filter.sourceSlug) continue;
    latest.push(item);
  }
  return latest;
}

export function listObservationVersions(identityKey: string): readonly ObservationVersionRecord[] {
  return [...(versionsByIdentity.get(identityKey) ?? [])];
}

export function clearObservations(): void {
  versionsByIdentity.clear();
}

export function setConnectorHealth(snapshot: ConnectorHealthSnapshot): void {
  health.set(snapshot.connectorId, snapshot);
  const history = healthHistory.get(snapshot.connectorId) ?? [];
  healthHistory.set(snapshot.connectorId, [...history, snapshot].slice(-50));
}

export function getConnectorHealth(connectorId: string): ConnectorHealthSnapshot | null {
  return health.get(connectorId) ?? null;
}

export function listConnectorHealth(): readonly ConnectorHealthSnapshot[] {
  return [...health.values()];
}

export function listConnectorHealthHistory(connectorId: string): readonly ConnectorHealthSnapshot[] {
  return [...(healthHistory.get(connectorId) ?? [])];
}

/**
 * Connected = registry marked connected (Pages Function path only).
 * Does not treat in-memory browser retrieval as connected.
 */
export function connectedSourceSlugs(): readonly OfficialSourceSlug[] {
  return connectedSlugsFromRegistry();
}

export function observationCount(): number {
  return listObservations().length;
}

export function exportAllVersions(): readonly ObservationVersionRecord[] {
  return [...versionsByIdentity.values()].flat();
}
