/**
 * Opportunity Radar — verified dated records only.
 * Returns empty with honest status when no licensed feed is connected.
 */

import type { CollaborationOpportunityRecord } from "@/lib/university-intelligence/types";

export type OpportunityRadarResult = {
  readonly items: readonly CollaborationOpportunityRecord[];
  readonly activeCount: number;
  readonly expiredHidden: number;
  readonly status: "not_connected" | "partial" | "connected";
  readonly honestyNotice: string;
};

/**
 * List opportunities for a university. Never synthesizes grants/calls.
 * Expired items are excluded from the active list.
 */
export function listOpportunityRadar(
  _universityId: string,
  now = new Date(),
): OpportunityRadarResult {
  const connected: CollaborationOpportunityRecord[] = [];
  // No licensed opportunity feed is bundled.
  const active = connected.filter((item) => {
    if (item.status === "expired") return false;
    if (item.deadline) {
      const d = Date.parse(item.deadline);
      if (Number.isFinite(d) && d < now.getTime()) return false;
    }
    return item.status === "active";
  });

  return {
    items: active,
    activeCount: active.length,
    expiredHidden: 0,
    status: "not_connected",
    honestyNotice:
      "Opportunity Radar uses verified dated records only. No synthetic opportunities, fabricated deadlines, or decorative feeds.",
  };
}
