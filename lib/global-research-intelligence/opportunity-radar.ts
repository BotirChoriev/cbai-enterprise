/**
 * Opportunity Radar — verified dated records only; empty when not connected.
 */

import type { GriOpportunity } from "@/lib/global-research-intelligence/types";

export type GriOpportunityRadar = {
  readonly items: readonly GriOpportunity[];
  readonly activeCount: number;
  readonly expiredHidden: number;
  readonly status: "not_connected" | "partial" | "connected";
  readonly honestyNotice: string;
};

export function listResearchOpportunityRadar(now = new Date()): GriOpportunityRadar {
  const connected: GriOpportunity[] = [];
  const active = connected.filter((item) => {
    if (item.status === "expired") return false;
    if (item.deadline) {
      const t = Date.parse(item.deadline);
      if (Number.isFinite(t) && t < now.getTime()) return false;
    }
    return item.status === "active";
  });
  return {
    items: active,
    activeCount: active.length,
    expiredHidden: 0,
    status: "not_connected",
    honestyNotice:
      "Opportunity Radar shows verified dated records only. No synthetic grants, fabricated deadlines, or decorative feeds.",
  };
}

/** Pure helper for tests — expired deadlines never count as active. */
export function isOpportunityActive(
  item: Pick<GriOpportunity, "status" | "deadline">,
  now = new Date(),
): boolean {
  if (item.status === "expired" || item.status === "not_connected") return false;
  if (item.status === "unknown") return false;
  if (item.deadline) {
    const t = Date.parse(item.deadline);
    if (Number.isFinite(t) && t < now.getTime()) return false;
  }
  return item.status === "active";
}
