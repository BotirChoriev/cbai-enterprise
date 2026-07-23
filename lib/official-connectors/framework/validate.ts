/**
 * Validation + freshness helpers — invalid observations are never published.
 */

import type {
  FreshnessStatus,
  VerifiedObservation,
} from "@/lib/official-connectors/types";

const STALE_AFTER_MS = 1000 * 60 * 60 * 24 * 400; // ~400 days without refresh → stale

export function isoNow(): string {
  return new Date().toISOString();
}

export function computeFreshness(retrievedAt: string, now = Date.now()): FreshnessStatus {
  const retrieved = Date.parse(retrievedAt);
  if (Number.isNaN(retrieved)) return "unknown";
  if (now - retrieved > STALE_AFTER_MS) return "stale";
  return "fresh";
}

export function assertPublishable(observation: VerifiedObservation): string | null {
  if (observation.verificationState !== "verified") {
    return "verificationState must be verified";
  }
  if (observation.value === null || observation.value === undefined || observation.value === "") {
    return "value missing";
  }
  if (typeof observation.value === "number" && !Number.isFinite(observation.value)) {
    return "non-finite numeric value";
  }
  if (!observation.provenance.sourceUrl) return "sourceUrl missing";
  if (!observation.provenance.retrievedAt) return "retrievedAt missing";
  if (!observation.indicatorName) return "indicatorName missing";
  if (!observation.entityId) return "entityId missing";
  if (observation.freshnessStatus === "stale") return "stale observation rejected";
  return null;
}

export function dedupeKey(observation: {
  indicatorCode: string;
  entityId: string;
  referencePeriod: string;
  provenance: { sourceSlug: string };
}): string {
  return [
    observation.provenance.sourceSlug,
    observation.entityId,
    observation.indicatorCode,
    observation.referencePeriod,
  ].join("::");
}

