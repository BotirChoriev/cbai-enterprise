/**
 * EPIC-05 — Future cloud interfaces (clean boundaries, no fake sync).
 */

import type { Organization } from "@/lib/organization-os/organization.types";
import type { DecisionLedgerEntry } from "@/lib/organization-os/decision-ledger.types";
import type { MissionDiscussionEntry } from "@/lib/organization-os/mission-discussion.types";

export type OrganizationCloudSyncResult =
  | { readonly ok: true; readonly syncedAt: string }
  | { readonly ok: false; readonly reason: string };

export interface OrganizationCloudAdapter {
  readonly connected: boolean;
  pullOrganizations(): Promise<readonly Organization[]>;
  pushOrganization(organization: Organization): Promise<OrganizationCloudSyncResult>;
  pullDecisionLedger(missionId: string): Promise<readonly DecisionLedgerEntry[]>;
  pushDiscussion(entry: MissionDiscussionEntry): Promise<OrganizationCloudSyncResult>;
}

export const DEVICE_LOCAL_CLOUD_ADAPTER: OrganizationCloudAdapter = {
  connected: false,
  async pullOrganizations() {
    return [];
  },
  async pushOrganization() {
    return { ok: false, reason: "Cloud organization sync is not connected." };
  },
  async pullDecisionLedger() {
    return [];
  },
  async pushDiscussion() {
    return { ok: false, reason: "Cloud discussion sync is not connected." };
  },
};
