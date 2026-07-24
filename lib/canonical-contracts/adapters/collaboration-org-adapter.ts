import { ADAPTER_NOT_WIRED, type AdapterStatus } from "@/lib/canonical-contracts/adapters/types";

export type CollaborationOrgAdapterInput = {
  readonly draftTeamId?: string;
  readonly collaborationRecordId?: string;
};

export type CollaborationOrgAdapterResult = AdapterStatus & {
  readonly provisionalOwner: "lib/organization-os";
  readonly mapping: "deferred";
};

/**
 * lib/collaboration + team drafts → organization-os.
 * Stage 1: not wired; preserves all existing keys untouched.
 */
export function collaborationToOrgOsAdapter(
  _input: CollaborationOrgAdapterInput,
): CollaborationOrgAdapterResult {
  void _input;
  return {
    ...ADAPTER_NOT_WIRED,
    provisionalOwner: "lib/organization-os",
    mapping: "deferred",
  };
}
