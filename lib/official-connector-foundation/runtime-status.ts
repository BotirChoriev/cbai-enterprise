/**
 * Runtime connection status for foundation sources.
 * Only World Bank WDI may flip to connected after verified retrieval.
 * Unrelated connectors are never mutated here.
 */

import type {
  ConnectorHealthState,
  FoundationConnectionStatus,
} from "@/lib/official-connector-foundation/types";

export type RuntimeSourceStatus = {
  status: FoundationConnectionStatus;
  health: ConnectorHealthState;
  lastCheckedAt: string | null;
  lastSuccessAt: string | null;
  message: string;
  liveEnabled: boolean;
};

const WORLD_BANK_SLUG = "world-bank" as const;

const runtime: Record<string, RuntimeSourceStatus> = {
  [WORLD_BANK_SLUG]: {
    status: "planned",
    health: "planned",
    lastCheckedAt: null,
    lastSuccessAt: null,
    message: "World Bank WDI registered — awaiting verified retrieval",
    liveEnabled: false,
  },
};

export function getWorldBankRuntimeStatus(): RuntimeSourceStatus {
  return { ...runtime[WORLD_BANK_SLUG]! };
}

export function markWorldBankChecked(at: string, message: string): void {
  const row = runtime[WORLD_BANK_SLUG]!;
  row.lastCheckedAt = at;
  row.message = message;
}

/** Call only after at least one verified WDI observation is published. */
export function markWorldBankConnected(at: string): void {
  const row = runtime[WORLD_BANK_SLUG]!;
  row.status = "connected";
  row.health = "healthy";
  row.liveEnabled = true;
  row.lastCheckedAt = at;
  row.lastSuccessAt = at;
  row.message = "Verified WDI observation retrieved — World Bank connected";
}

export function markWorldBankFailure(at: string, message: string): void {
  const row = runtime[WORLD_BANK_SLUG]!;
  // On failure keep Planned — never invent Connected.
  if (row.status !== "connected") {
    row.status = "planned";
    row.liveEnabled = false;
    row.health = "unavailable";
  } else {
    row.health = "degraded";
  }
  row.lastCheckedAt = at;
  row.message = message;
}

export function resetWorldBankRuntimeForTests(): void {
  runtime[WORLD_BANK_SLUG] = {
    status: "planned",
    health: "planned",
    lastCheckedAt: null,
    lastSuccessAt: null,
    message: "World Bank WDI registered — awaiting verified retrieval",
    liveEnabled: false,
  };
}

export function isWorldBankConnected(): boolean {
  return runtime[WORLD_BANK_SLUG]!.status === "connected";
}
