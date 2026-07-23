/**
 * Connector health + freshness helpers (Phase 1).
 */

import type { ConnectorHealthState, FreshnessState } from "@/lib/official-connector-foundation/types";
import { deriveFreshnessState } from "@/lib/official-connector-foundation/normalize";

export type HealthSnapshot = {
  readonly connectorId: string;
  readonly health: ConnectorHealthState;
  readonly freshness: FreshnessState;
  readonly lastCheckedAt: string | null;
  readonly message: string;
};

/** Phase 1 planned connectors stay planned until a later live phase. */
export function plannedHealthSnapshot(connectorId: string): HealthSnapshot {
  return {
    connectorId,
    health: "planned",
    freshness: "not_checked",
    lastCheckedAt: null,
    message: "Phase 1 — not live; health remains planned",
  };
}

export function evaluateHealthAfterCheck(params: {
  readonly connectorId: string;
  readonly lastCheckedAt: string;
  readonly success: boolean;
  readonly maxFreshAgeMs?: number;
  readonly message: string;
}): HealthSnapshot {
  const freshness = deriveFreshnessState(
    params.lastCheckedAt,
    params.maxFreshAgeMs ?? 24 * 60 * 60 * 1000
  );
  return {
    connectorId: params.connectorId,
    health: params.success ? "healthy" : "unavailable",
    freshness,
    lastCheckedAt: params.lastCheckedAt,
    message: params.message,
  };
}
