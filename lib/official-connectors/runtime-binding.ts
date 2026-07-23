/**
 * Runtime binding helpers — merge verified observations into enterprise surfaces.
 */

import type { GlobalStatusModel } from "@/lib/enterprise/global-status";
import { buildGlobalStatus } from "@/lib/enterprise/global-status";
import {
  connectedSourceSlugs,
  listConnectorHealth,
  listObservations,
  observationCount,
} from "@/lib/official-connectors/store";
import type { VerifiedObservation } from "@/lib/official-connectors/types";

export function buildLiveGlobalStatus(coverage?: Parameters<typeof buildGlobalStatus>[0]): GlobalStatusModel {
  const base = buildGlobalStatus(coverage);
  const live = connectedSourceSlugs();
  const health = listConnectorHealth();
  const latestCheck = health
    .map((h) => h.lastCheckedAt)
    .filter((v): v is string => Boolean(v))
    .sort()
    .at(-1);

  const connectedSources = Math.max(base.connectedSources, new Set(["cbai-local-registry", ...live]).size);
  const missingSources = Math.max(0, base.totalSources - connectedSources);

  return {
    ...base,
    connectedSources,
    missingSources,
    lastUpdated: latestCheck ?? base.lastUpdated,
    evidenceHealth:
      observationCount() > 0
        ? live.length > 1
          ? "Healthy — registry connected"
          : "Partial — local registry only"
        : base.evidenceHealth,
    confidence:
      observationCount() > 0
        ? "Partial — verified sources registered"
        : base.confidence,
    coverageBasis:
      observationCount() > 0
        ? `${observationCount()} verified official observation(s) published · ${base.coverageBasis}`
        : base.coverageBasis,
  };
}

export function countryObservationCards(countryId: string): readonly VerifiedObservation[] {
  return listObservations({ entityId: countryId });
}

export function formatObservationValue(observation: VerifiedObservation): string {
  if (typeof observation.value === "number") {
    return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(observation.value);
  }
  return String(observation.value);
}
