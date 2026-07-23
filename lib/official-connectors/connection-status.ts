/**
 * Runtime connection status — sources stay planned until the deployed
 * Preview Pages Function successfully retrieves verified observations.
 * Browser keyless refresh must never flip status to connected.
 */

import type { OfficialSourceSlug } from "@/lib/official-connectors/types";

export type ConnectionStatus = "planned" | "static" | "connected" | "disabled";

type ConnectionRecord = {
  readonly slug: OfficialSourceSlug;
  status: ConnectionStatus;
  readonly reason: string;
  lastConnectedAt: string | null;
};

const registry: Record<OfficialSourceSlug, ConnectionRecord> = {
  "world-bank": {
    slug: "world-bank",
    status: "planned",
    reason: "Awaiting deployed Preview Function verified retrieval",
    lastConnectedAt: null,
  },
  "united-nations": {
    slug: "united-nations",
    status: "planned",
    reason: "Connectivity probe only — no verified series published yet",
    lastConnectedAt: null,
  },
  oecd: {
    slug: "oecd",
    status: "planned",
    reason: "Member-country datasets not yet verified live",
    lastConnectedAt: null,
  },
  "us-census": {
    slug: "us-census",
    status: "planned",
    reason: "Requires CENSUS_API_KEY runtime secret + validated ACS series",
    lastConnectedAt: null,
  },
  "us-bea": {
    slug: "us-bea",
    status: "planned",
    reason: "Requires BEA_API_KEY runtime secret + validated NIPA series",
    lastConnectedAt: null,
  },
  "us-bls": {
    slug: "us-bls",
    status: "planned",
    reason: "Awaiting deployed Preview Function verified retrieval",
    lastConnectedAt: null,
  },
  "us-sec": {
    slug: "us-sec",
    status: "planned",
    reason: "Awaiting deployed Preview Function verified retrieval",
    lastConnectedAt: null,
  },
  "cbai-local-registry": {
    slug: "cbai-local-registry",
    status: "static",
    reason: "Local entity registry — not an external official statistics feed",
    lastConnectedAt: null,
  },
};

/** Only the Pages Function refresh path may call this after verified publish. */
export function markSourceConnected(slug: OfficialSourceSlug, at = new Date().toISOString()): void {
  const row = registry[slug];
  if (!row || row.status === "disabled") return;
  row.status = "connected";
  row.lastConnectedAt = at;
  (row as { reason: string }).reason =
    "Verified observation retrieved by deployed Preview Pages Function and displayed";
}

export function getConnectionStatus(slug: OfficialSourceSlug): ConnectionRecord {
  return { ...registry[slug] };
}

export function listConnectionStatuses(): readonly ConnectionRecord[] {
  return Object.values(registry).map((row) => ({ ...row }));
}

export function connectedSlugsFromRegistry(): readonly OfficialSourceSlug[] {
  return Object.values(registry)
    .filter((row) => row.status === "connected")
    .map((row) => row.slug);
}

export function resetConnectionStatusesForTests(): void {
  for (const row of Object.values(registry)) {
    if (row.slug === "cbai-local-registry") {
      row.status = "static";
      row.lastConnectedAt = null;
      continue;
    }
    row.status = "planned";
    row.lastConnectedAt = null;
  }
}
