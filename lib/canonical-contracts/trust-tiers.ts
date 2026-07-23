/**
 * Explicit trust tiers for Preview Completion (DD-PC-002).
 * Device-local identity is never team/cloud authority (SF-2).
 */

export type AccountTrustTier =
  | "guest"
  | "device_local"
  | "authenticated_personal"
  | "organization_member"
  | "organization_administrator"
  | "publication_review_authority";

export type AccountMode = "signed-out" | "device-local" | "cloud";

export function trustTierFromAccountMode(
  accountMode: AccountMode,
  opts?: { readonly orgRole?: "owner" | "administrator" | "editor" | "reviewer" | "viewer" | null },
): AccountTrustTier {
  if (accountMode === "signed-out") return "guest";
  if (accountMode === "device-local") return "device_local";
  const role = opts?.orgRole ?? null;
  if (role === "owner" || role === "administrator") return "organization_administrator";
  if (role) return "organization_member";
  return "authenticated_personal";
}

/** Personal cabinet (projects, drafts metadata) — device-local OR cloud. */
export function mayAccessPersonalCabinet(accountMode: AccountMode): boolean {
  return accountMode === "device-local" || accountMode === "cloud";
}

/**
 * Shared collaboration (teams, invites, cloud messages, team publication).
 * Requires verified cloud session — never device-local alone.
 */
export function mayAccessTeamCollaboration(accountMode: AccountMode): boolean {
  return accountMode === "cloud";
}

/** Scientific intake upload path that claims cloud object storage. */
export function mayStartCloudObjectUpload(accountMode: AccountMode): boolean {
  return accountMode === "cloud";
}

/** Guest may navigate public surfaces and draft local non-sensitive intent only. */
export function guestMayDraftLocalIntent(accountMode: AccountMode): boolean {
  return accountMode === "signed-out";
}
